"use client";

import { useEffect, useRef, useState } from "react";
import type { DeviceReadingPayload } from "@/lib/backend/focus-types";
import { postDeviceReading } from "@/lib/focus/device-readings";

const SERVICE_UUID = "6e400001-b5a3-f393-e0a9-e50e24dcca9e";
const RX_UUID = "6e400002-b5a3-f393-e0a9-e50e24dcca9e";
const TX_UUID = "6e400003-b5a3-f393-e0a9-e50e24dcca9e";

type BluetoothState = {
  isSupported: boolean;
  isConnected: boolean;
  deviceName: string;
  latestReading: DeviceReadingPayload | null;
  receivedChunks: number;
  receivedLines: number;
  parsedReadings: number;
  error: string;
  connect: () => Promise<void>;
  disconnect: () => void;
  sendCommand: (command: unknown) => Promise<void>;
};

type DeviceReadingBatchPayload = {
  type?: string;
  readings?: unknown[];
};

export function useUnoQBluetooth(): BluetoothState {
  const [isSupported, setIsSupported] = useState(false);
  const [isConnected, setIsConnected] = useState(false);
  const [deviceName, setDeviceName] = useState("");
  const [latestReading, setLatestReading] = useState<DeviceReadingPayload | null>(null);
  const [receivedChunks, setReceivedChunks] = useState(0);
  const [receivedLines, setReceivedLines] = useState(0);
  const [parsedReadings, setParsedReadings] = useState(0);
  const [error, setError] = useState("");

  const deviceRef = useRef<BluetoothDevice | null>(null);
  const txCharacteristicRef = useRef<BluetoothRemoteGATTCharacteristic | null>(null);
  const rxCharacteristicRef = useRef<BluetoothRemoteGATTCharacteristic | null>(null);
  const bufferRef = useRef("");
  const decoderRef = useRef<TextDecoder | null>(null);
  const encoderRef = useRef<TextEncoder | null>(null);
  const notificationHandlerRef = useRef<((event: Event) => void) | null>(null);
  const isDisconnectingRef = useRef(false);

  useEffect(() => {
    setIsSupported(getBluetoothSupport());
    decoderRef.current = new TextDecoder();
    encoderRef.current = new TextEncoder();

    return () => {
      const device = deviceRef.current;
      const txCharacteristic = txCharacteristicRef.current;
      const notificationHandler = notificationHandlerRef.current;

      if (txCharacteristic && notificationHandler) {
        txCharacteristic.removeEventListener("characteristicvaluechanged", notificationHandler);
      }
      if (device?.gatt?.connected) {
        device.gatt.disconnect();
      }
    };
  }, []);

  async function connect() {
    setError("");

    if (typeof window === "undefined" || !window.isSecureContext) {
      setIsSupported(false);
      throw new Error("Web Bluetooth ใช้งานได้บน HTTPS หรือ localhost เท่านั้น");
    }
    if (!navigator.bluetooth) {
      setIsSupported(false);
      throw new Error("Browser นี้ไม่รองรับ Web Bluetooth");
    }

    const device = await navigator.bluetooth.requestDevice({
      filters: [{ namePrefix: "UNOQ" }],
      optionalServices: [SERVICE_UUID],
    });

    cleanupConnectionState(true);

    deviceRef.current = device;
    device.addEventListener("gattserverdisconnected", handleDisconnected);

    try {
      const server = await device.gatt?.connect();
      if (!server) throw new Error("เชื่อมต่อ GATT ไม่สำเร็จ");

      const service = await server.getPrimaryService(SERVICE_UUID);
      const txCharacteristic = await service.getCharacteristic(TX_UUID);
      const rxCharacteristic = await service.getCharacteristic(RX_UUID);

      txCharacteristicRef.current = txCharacteristic;
      rxCharacteristicRef.current = rxCharacteristic;

      const notificationHandler = async (event: Event) => {
        const target = event.target as BluetoothRemoteGATTCharacteristic | null;
        const value = target?.value;
        if (!value || !decoderRef.current) return;
        setReceivedChunks((prev) => prev + 1);

        bufferRef.current += decoderRef.current.decode(value, { stream: true });
        const lines = bufferRef.current.split("\n");
        bufferRef.current = lines.pop() ?? "";

        for (const line of lines) {
          const trimmed = line.trim();
          if (!trimmed) continue;
          setReceivedLines((prev) => prev + 1);

          try {
            const parsed = JSON.parse(trimmed) as unknown;
            const readings = getDeviceReadings(parsed);
            if (readings.length === 0) {
              throw new Error("BLE payload shape ไม่ถูกต้อง");
            }
            for (const reading of readings) {
              setLatestReading(reading);
              await postDeviceReading(reading);
              setParsedReadings((prev) => prev + 1);
            }
            setError("");
          } catch (parseError) {
            setError(parseError instanceof Error ? parseError.message : "อ่านข้อมูล BLE ไม่สำเร็จ");
          }
        }
      };

      notificationHandlerRef.current = notificationHandler;
      txCharacteristic.addEventListener("characteristicvaluechanged", notificationHandler);
      await txCharacteristic.startNotifications();
      await sendCommand({ type: "start" });

      setDeviceName(device.name ?? "UNOQ Device");
      setIsConnected(true);
      setIsSupported(true);
    } catch (connectError) {
      cleanupConnectionState(true);
      const message = toBluetoothErrorMessage(connectError);
      setError(message);
      throw new Error(message);
    }
  }

  function disconnect() {
    void disconnectInternal();
  }

  async function sendCommand(command: unknown) {
    if (!rxCharacteristicRef.current || !encoderRef.current) {
      throw new Error("Bluetooth ยังไม่เชื่อมต่อ");
    }

    const payload = encoderRef.current.encode(`${JSON.stringify(command)}\n`);
    if (rxCharacteristicRef.current.properties.writeWithoutResponse) {
      await rxCharacteristicRef.current.writeValueWithoutResponse(payload);
      return;
    }
    await rxCharacteristicRef.current.writeValueWithResponse(payload);
  }

  function handleDisconnected() {
    if (isDisconnectingRef.current) {
      isDisconnectingRef.current = false;
    }
    cleanupConnectionState(false);
  }

  async function disconnectInternal() {
    isDisconnectingRef.current = true;
    try {
      if (rxCharacteristicRef.current) {
        await sendCommand({ type: "stop" });
      }
    } catch {
      // Ignore stop errors during teardown.
    } finally {
      cleanupConnectionState(true);
      isDisconnectingRef.current = false;
    }
  }

  function cleanupConnectionState(disconnectGatt: boolean) {
    const device = deviceRef.current;
    const txCharacteristic = txCharacteristicRef.current;
    const notificationHandler = notificationHandlerRef.current;

    if (txCharacteristic && notificationHandler) {
      txCharacteristic.removeEventListener("characteristicvaluechanged", notificationHandler);
    }
    if (device) {
      device.removeEventListener("gattserverdisconnected", handleDisconnected);
      if (disconnectGatt && device.gatt?.connected) {
        device.gatt.disconnect();
      }
    }

    txCharacteristicRef.current = null;
    rxCharacteristicRef.current = null;
    notificationHandlerRef.current = null;
    bufferRef.current = "";
    deviceRef.current = null;
    setIsConnected(false);
    setDeviceName(disconnectGatt ? "" : device?.name ?? "");
    setReceivedChunks(0);
    setReceivedLines(0);
    setParsedReadings(0);
  }

  return {
    isSupported,
    isConnected,
    deviceName,
    latestReading,
    receivedChunks,
    receivedLines,
    parsedReadings,
    error,
    connect,
    disconnect,
    sendCommand,
  };
}

function getBluetoothSupport() {
  return (
    typeof window !== "undefined" &&
    typeof navigator !== "undefined" &&
    window.isSecureContext &&
    Boolean(navigator.bluetooth)
  );
}

function toBluetoothErrorMessage(error: unknown) {
  const fallback = "เชื่อมต่อ Bluetooth ไม่สำเร็จ";
  if (!(error instanceof Error)) return fallback;

  if (error.message.includes(RX_UUID)) {
    return `ไม่พบ RX characteristic (${RX_UUID}) ใน service ${SERVICE_UUID}. ตรวจ firmware ของ UNO Q ว่ามี write characteristic UUID นี้จริง`;
  }
  if (error.message.includes(TX_UUID)) {
    return `ไม่พบ TX characteristic (${TX_UUID}) ใน service ${SERVICE_UUID}. ตรวจ firmware ของ UNO Q ว่ามี notify characteristic UUID นี้จริง`;
  }

  return error.message || fallback;
}

function getDeviceReadings(value: unknown): DeviceReadingPayload[] {
  const unwrapped = unwrapPayload(value);

  if (isDeviceReadingLike(unwrapped)) {
    const normalized = normalizeReading(unwrapped);
    return normalized ? [normalized] : [];
  }

  if (isDeviceReadingBatchPayload(unwrapped)) {
    const readings: DeviceReadingPayload[] = [];
    for (const item of unwrapped.readings) {
      if (!isDeviceReadingLike(item)) continue;
      const normalized = normalizeReading(item);
      if (!normalized) continue;
      readings.push(normalized);
    }
    return readings;
  }

  if (isDeviceReadingLike(value)) {
    const normalized = normalizeReading(value);
    return normalized ? [normalized] : [];
  }

  if (isDeviceReadingBatchPayload(value)) {
    const readings: DeviceReadingPayload[] = [];
    for (const item of value.readings) {
      if (!isDeviceReadingLike(item)) continue;
      const normalized = normalizeReading(item);
      if (!normalized) continue;
      readings.push(normalized);
    }
    return readings;
  }

  return [];
}

function unwrapPayload(value: unknown): unknown {
  if (!value || typeof value !== "object") return value;
  const record = value as Record<string, unknown>;
  if (record.payload) return record.payload;
  if (record.data) return record.data;
  if (record.reading) return record.reading;
  return value;
}

function isDeviceReadingLike(value: unknown): value is Partial<DeviceReadingPayload> {
  const reading = value as Record<string, unknown>;
  return Boolean(
    reading &&
      typeof reading.device_code === "string" &&
      typeof reading.recorded_at === "string" &&
      reading.focus &&
      typeof (reading.focus as Record<string, unknown>).score === "number" &&
      typeof (reading.focus as Record<string, unknown>).state === "string"
  );
}

function isDeviceReadingBatchPayload(value: unknown): value is {
  type?: string;
  readings: unknown[];
} {
  const batch = value as DeviceReadingBatchPayload;
  return Boolean(
    batch &&
      typeof batch === "object" &&
      Array.isArray(batch.readings) &&
      (!batch.type || batch.type === "device_reading_batch")
  );
}

function normalizeReading(reading: Partial<DeviceReadingPayload>) {
  if (!reading.device_code || !reading.recorded_at || !reading.focus) return null;
  if (typeof reading.focus.score !== "number" || typeof reading.focus.state !== "string") return null;

  return {
    device_code: reading.device_code,
    recorded_at: reading.recorded_at,
    focus: {
      score: reading.focus.score,
      state: reading.focus.state,
      probability: reading.focus.probability,
      distraction_probability: reading.focus.distraction_probability,
      confidence: reading.focus.confidence,
      model_version: reading.focus.model_version,
    },
    emotion: {
      valence: reading.emotion?.valence ?? 0,
      arousal: reading.emotion?.arousal ?? 0,
      label: reading.emotion?.label ?? "normal",
      confidence: reading.emotion?.confidence,
      model_version: reading.emotion?.model_version,
    },
    sensors: reading.sensors,
  } satisfies DeviceReadingPayload;
}
