"use client";

import { useEffect, useState } from "react";
import type { DeviceReadingPayload } from "@/lib/backend/focus-types";
import { useUnoQBluetooth } from "@/lib/bluetooth/use-unoq-bluetooth";

type BluetoothPanelProps = {
  onLatestReading?: (reading: DeviceReadingPayload) => void;
};

export default function BluetoothPanel({ onLatestReading }: BluetoothPanelProps) {
  const {
    isSupported,
    isConnected,
    deviceName,
    latestReading,
    error,
    connect,
    disconnect,
    sendCommand,
  } = useUnoQBluetooth();
  const [commandStatus, setCommandStatus] = useState("");

  useEffect(() => {
    if (!latestReading) return;
    onLatestReading?.(latestReading);
  }, [latestReading, onLatestReading]);

  async function handleConnect() {
    try {
      await connect();
    } catch {
      return;
    }
  }

  async function handlePing() {
    setCommandStatus("");
    try {
      await sendCommand({ type: "ping", sent_at: new Date().toISOString() });
      setCommandStatus("ส่งคำสั่ง ping แล้ว");
    } catch (sendError) {
      setCommandStatus(sendError instanceof Error ? sendError.message : "ส่งคำสั่งไม่สำเร็จ");
    }
  }

  return (
    <section className="rounded-[20px] border border-emerald-100 bg-[linear-gradient(180deg,#ffffff_0%,#f5fff3_100%)] p-4 shadow-[0_12px_30px_rgba(15,23,42,0.055)]">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.22em] text-emerald-600">
            Bluetooth
          </p>
          <h2 className="mt-1 text-lg font-semibold text-slate-900">UNO Q Live Stream</h2>
          <p className="mt-1 text-sm text-slate-500">
            เชื่อม BLE กับอุปกรณ์แล้วส่ง reading ต่อไปที่ `/api/device/readings`
          </p>
        </div>

        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={handleConnect}
            disabled={!isSupported || isConnected}
            className="rounded-2xl bg-emerald-500 px-4 py-2 text-sm font-medium text-white disabled:cursor-not-allowed disabled:bg-slate-300"
          >
            {isConnected ? "Connected" : "Connect Bluetooth"}
          </button>
          <button
            type="button"
            onClick={disconnect}
            disabled={!isConnected}
            className="rounded-2xl border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 disabled:cursor-not-allowed disabled:text-slate-300"
          >
            Disconnect
          </button>
          <button
            type="button"
            onClick={handlePing}
            disabled={!isConnected}
            className="rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-2 text-sm font-medium text-emerald-700 disabled:cursor-not-allowed disabled:text-slate-300"
          >
            Send Ping
          </button>
        </div>
      </div>

      <div className="mt-4 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <InfoCard label="Support" value={isSupported ? "พร้อมใช้งาน" : "ไม่รองรับ"} />
        <InfoCard label="Status" value={isConnected ? "เชื่อมต่อแล้ว" : "ยังไม่เชื่อมต่อ"} />
        <InfoCard label="Device" value={deviceName || "UNOQ-LogRag"} />
        <InfoCard
          label="Latest Focus"
          value={latestReading ? `${latestReading.focus.score}/100` : "-"}
        />
      </div>

      {!isSupported ? (
        <p className="mt-4 rounded-2xl border border-amber-200 bg-amber-50 px-3 py-2 text-sm text-amber-700">
          Browser นี้ยังใช้ Web Bluetooth ไม่ได้ หรือไม่ได้รันบน HTTPS/localhost
        </p>
      ) : null}
      {error ? (
        <p className="mt-4 rounded-2xl border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-700">
          {error}
        </p>
      ) : null}
      {commandStatus ? (
        <p className="mt-4 rounded-2xl border border-sky-200 bg-sky-50 px-3 py-2 text-sm text-sky-700">
          {commandStatus}
        </p>
      ) : null}

      <div className="mt-4 rounded-[18px] border border-slate-100 bg-white/90 p-3">
        <div className="flex items-center justify-between gap-3">
          <p className="text-sm font-semibold text-slate-800">Latest Reading</p>
          <p className="text-xs text-slate-500">
            {latestReading?.recorded_at ? new Date(latestReading.recorded_at).toLocaleString() : "-"}
          </p>
        </div>
        <pre className="mt-3 overflow-x-auto rounded-2xl bg-slate-950 p-3 text-xs text-slate-100">
          {latestReading ? JSON.stringify(latestReading, null, 2) : "ยังไม่มีข้อมูลจาก BLE"}
        </pre>
      </div>
    </section>
  );
}

function InfoCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-[16px] border border-slate-100 bg-white px-3 py-3 shadow-[0_10px_22px_rgba(15,23,42,0.04)]">
      <p className="text-xs font-medium text-slate-500">{label}</p>
      <p className="mt-1 text-sm font-semibold text-slate-800">{value}</p>
    </div>
  );
}
