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
  error: string;
  connect: () => Promise<void>;
  disconnect: () => void;
  sendCommand: (command: unknown) => Promise<void>;
};

export function useUnoQBluetooth(): BluetoothState {
  const [isSupported, setIsSupported] = useState(false);
  const [isConnected, setIsConnected] = useState(false);
  const [deviceName, setDeviceName] = useState("");
  const [latestReading, setLatestReading] = useState<DeviceReadingPayload | null>(null);
  const [error, setError] = useState("");

  const deviceRef = useRef<BluetoothDevice | null>(null);
  const txCharacteristicRef = useRef<BluetoothRemoteGATTCharacteristic | null>(null);
  const rxCharacteristicRef = useRef<BluetoothRemoteGATTCharacteristic | null>(null);
  const bufferRef = useRef("");
  const decoderRef = useRef<TextDecoder | null>(null);
  const encoderRef = useRef<TextEncoder | null>(null);
  const notificationHandlerRef = useRef<((event: Event) => void) | null>(null);

  useEffect(() => {
    if (typeof window === "undefined") return;
    setIsSupported(Boolean(window.isSecureContext && navigator.bluetooth));
    decoderRef.current = new TextDecoder();
    encoderRef.current = new TextEncoder();

    return () => {
      disconnect();
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

        bufferRef.current += decoderRef.current.decode(value, { stream: true });
        const lines = bufferRef.current.split("\n");
        bufferRef.current = lines.pop() ?? "";

        for (const line of lines) {
          const trimmed = line.trim();
          if (!trimmed) continue;

          try {
            const reading = JSON.parse(trimmed) as DeviceReadingPayload;
            setLatestReading(reading);
            await postDeviceReading(reading);
            setError("");
          } catch (parseError) {
            setError(parseError instanceof Error ? parseError.message : "อ่านข้อมูล BLE ไม่สำเร็จ");
          }
        }
      };

      notificationHandlerRef.current = notificationHandler;
      txCharacteristic.addEventListener("characteristicvaluechanged", notificationHandler);
      await txCharacteristic.startNotifications();

      setDeviceName(device.name ?? "UNOQ Device");
      setIsConnected(true);
      setIsSupported(true);
    } catch (connectError) {
      cleanupConnectionState(true);
      const message =
        connectError instanceof Error ? connectError.message : "เชื่อมต่อ Bluetooth ไม่สำเร็จ";
      setError(message);
      throw connectError;
    }
  }

  function disconnect() {
    cleanupConnectionState(true);
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
    cleanupConnectionState(false);
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
  }

  return {
    isSupported,
    isConnected,
    deviceName,
    latestReading,
    error,
    connect,
    disconnect,
    sendCommand,
  };
}
