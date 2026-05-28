"use client";

import { useEffect, useMemo, useState } from "react";

type FocusPayload = {
  durationSec: number;
  source: "device" | "manual";
  label: string;
};

const PRESET_MINUTES = [15, 25, 45, 60];

export default function FocusLockPanel() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isLocked, setIsLocked] = useState(false);
  const [remainingSec, setRemainingSec] = useState(0);
  const [selectedMin, setSelectedMin] = useState(25);
  const [lastSource, setLastSource] = useState<FocusPayload["source"]>("manual");

  useEffect(() => {
    if (!isLocked || remainingSec <= 0) return;

    const timer = window.setInterval(() => {
      setRemainingSec((prev) => {
        if (prev <= 1) {
          window.clearInterval(timer);
          setIsLocked(false);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => window.clearInterval(timer);
  }, [isLocked, remainingSec]);

  const timeLabel = useMemo(() => {
    const m = Math.floor(remainingSec / 60)
      .toString()
      .padStart(2, "0");
    const s = Math.floor(remainingSec % 60)
      .toString()
      .padStart(2, "0");
    return `${m}:${s}`;
  }, [remainingSec]);

  function activateFocus(payload: FocusPayload) {
    setLastSource(payload.source);
    setRemainingSec(payload.durationSec);
    setIsLocked(true);
    setIsModalOpen(false);
  }

  function startManualFocus() {
    activateFocus({
      durationSec: selectedMin * 60,
      source: "manual",
      label: `Manual ${selectedMin}m`,
    });
  }

  function mockDeviceSignal() {
    // Mock data from backend/device trigger.
    activateFocus({
      durationSec: 20 * 60,
      source: "device",
      label: "Device Trigger 20m",
    });
  }

  return (
    <>
      <div className="z-40 mb-4 flex w-full items-center justify-end gap-2 rounded-2xl md:gap-3">
        <button
          type="button"
          onClick={() => setIsModalOpen(true)}
          className="min-h-10 flex-1 rounded-xl bg-green-500 px-4 text-sm font-medium text-white transition hover:bg-emerald-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-300 md:min-h-11 md:flex-none md:px-5"
        >
          Set Focus Time
        </button>
        <button
          type="button"
          onClick={mockDeviceSignal}
          className="min-h-10 flex-1 rounded-xl border border-slate-200 bg-white px-4 text-sm font-medium text-slate-700 transition hover:bg-slate-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-300 md:min-h-11 md:flex-none md:px-5"
        >
          Mock Device
        </button>
      </div>

      {isModalOpen ? (
        <div className="fixed inset-0 z-50 grid place-items-center bg-slate-900/20 p-4 backdrop-blur-[2px]">
          <div className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-6 shadow-xl">
            <h2 className="text-xl font-semibold text-slate-800">ตั้งเวลาโฟกัส</h2>
            <p className="mt-1 text-sm font-normal text-slate-500">
              เลือกเวลาเพื่อเริ่มล็อกหน้าจอแบบนับถอยหลัง
            </p>

            <div className="mt-4 grid grid-cols-2 gap-2">
              {PRESET_MINUTES.map((m) => (
                <button
                  key={m}
                  type="button"
                  onClick={() => setSelectedMin(m)}
                  className={`min-h-11 rounded-xl px-4 text-sm font-medium transition ${
                    selectedMin === m
                      ? "bg-emerald-500 text-white shadow-sm"
                      : "border border-slate-200 bg-white text-slate-700 hover:bg-slate-50"
                  }`}
                >
                  {m} นาที
                </button>
              ))}
            </div>

            <div className="mt-5 flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="min-h-10 rounded-lg px-4 text-sm font-medium text-slate-600 hover:bg-slate-100"
              >
                ยกเลิก
              </button>
              <button
                type="button"
                onClick={startManualFocus}
                className="min-h-10 rounded-lg bg-emerald-500 px-4 text-sm font-medium text-white hover:bg-emerald-600"
              >
                เริ่มโฟกัส
              </button>
            </div>
          </div>
        </div>
      ) : null}

      {isLocked ? (
        <div className="fixed inset-0 z-[60] grid place-items-center bg-white p-6 text-slate-800">
          <div className="w-full max-w-lg rounded-3xl border border-slate-200 bg-white p-8 text-center shadow-lg">
            <p className="text-xs font-medium uppercase tracking-[0.2em] text-emerald-600">
              Focus Mode
            </p>
            <h3 className="mt-3 text-2xl font-semibold">เวลาตั้งใจโฟกัส</h3>
            <p className="mt-2 text-sm font-normal text-slate-500">
              โหมดล็อกหน้าจอทำงานอยู่ ({lastSource === "device" ? "Device" : "Manual"})
            </p>
            <p className="mt-6 text-6xl font-semibold tabular-nums text-slate-900">{timeLabel}</p>
            <p className="mt-3 text-sm font-normal text-slate-500">
              ระบบจะปลดล็อกอัตโนมัติเมื่อเวลาหมด
            </p>

            <button
              type="button"
              onClick={() => {
                setIsLocked(false);
                setRemainingSec(0);
              }}
              className="mt-8 min-h-10 rounded-lg border border-slate-200 bg-slate-50 px-4 text-sm font-medium text-slate-700 hover:bg-slate-100"
            >
              Emergency Stop
            </button>
          </div>
        </div>
      ) : null}
    </>
  );
}
