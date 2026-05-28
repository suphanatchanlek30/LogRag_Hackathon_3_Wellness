"use client";

import Image from "next/image";
import { useEffect, useState } from "react";

type FocusSource = "device" | "manual";

const PRESET_MINUTES = [15, 25, 45, 60];

const chartPoints = [34, 46, 70, 25, 75, 86, 42, 63, 72, 28, 81, 70, 30, 50, 61, 44, 37, 61];
const chartTimes = ["08:00", "10:00", "12:00", "14:00", "16:00", "18:00", "20:00"];
const timeline = [
  { state: "focus", icon: "🥕" },
  { state: "short_break", icon: "🍃" },
  { state: "focus", icon: "🥕" },
  { state: "short_break", icon: "🍃" },
  { state: "focus", icon: "🥕" },
  { state: "short_break", icon: "🍃" },
  { state: "focus", icon: "🥕" },
  { state: "long_rest", icon: "☀️" },
];

const emotionLegend = [
  { key: "happy", label: "สนุก", note: "กระตือรือร้น มีความสุข", color: "#f9be16", image: "/dashboard/Fun.png" },
  { key: "relaxed", label: "ผ่อนคลาย", note: "นิ่ง สบายใจ", color: "#27b14b", image: "/dashboard/Relaxed.png" },
  { key: "bored", label: "เบื่อ", note: "เฉื่อย ไม่แรงจูงใจ", color: "#3b82f6", image: "/dashboard/Bored.png" },
  { key: "stressed", label: "เครียด", note: "กังวล ว้าวุ่น", color: "#ef4444", image: "/dashboard/Stressed.png" },
  { key: "normal", label: "ปกติ", note: "สมดุล ปกติ", color: "#6b7280", image: "/dashboard/NormalRabbit.png" },
];

export default function DashboardMock() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isLocked, setIsLocked] = useState(false);
  const [remainingSec, setRemainingSec] = useState(0);
  const [selectedMin, setSelectedMin] = useState(25);
  const [lastSource, setLastSource] = useState<FocusSource>("manual");

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

  const minutes = Math.floor(remainingSec / 60)
    .toString()
    .padStart(2, "0");
  const seconds = Math.floor(remainingSec % 60)
    .toString()
    .padStart(2, "0");

  function activateFocus(durationSec: number, source: FocusSource) {
    setLastSource(source);
    setRemainingSec(durationSec);
    setIsLocked(true);
    setIsModalOpen(false);
  }

  return (
    <>
      <section className="min-h-screen bg-[radial-gradient(circle_at_top,#f7fff7_0%,#ffffff_42%)] pb-6">
        <div className="mx-auto w-full space-y-3 sm:space-y-4 lg:space-y-5">
          <section className="grid gap-3 sm:gap-4 grid-cols-1 lg:grid-cols-2">
            <header className="flex flex-col justify-center gap-2">
              <div>
                <h1 className="text-[1.5rem] font-semibold leading-none tracking-tight text-slate-900 sm:text-[1.85rem] md:text-[2rem]">
                  Dashboard
                </h1>
                <p className="mt-1.5 flex items-center gap-2 text-sm font-normal text-slate-600 sm:text-[1.02rem]">
                  ติดตามสมาธิและอารมณ์ระหว่างวัน
                  <span className="text-xl">🌱</span>
                </p>
              </div>
            </header>

            <div className="grid gap-2 grid-cols-1 sm:grid-cols-2 items-start">
              <TopSummaryCard />
              <StartFocusCard
                onManualStart={() => setIsModalOpen(true)}
                onMockStart={() => activateFocus(20 * 60, "device")}
              />
            </div>
          </section>

          <div className="grid gap-3 lg:gap-5 grid-cols-1 lg:grid-cols-3">
            <div className="space-y-4 lg:space-y-5 lg:col-span-2">
              <FocusScoreSection />

              <div className="grid gap-2 sm:grid-cols-2">
                <MetricCard
                  icon="/dashboard/sessions_today.png"
                  title="Sessions Today"
                  value="5"
                  unit="รอบ"
                  accent="green"
                  footer="เพิ่มขึ้น 2 จากเมื่อวาน"
                />
                <MetricCard
                  icon="/dashboard/focus_time.png"
                  title="Focus Time"
                  value="2 ชม. 05"
                  unit="นาที"
                  accent="red"
                  footer="เป้าหมาย 3 ชม."
                  progress={69}
                />
                <MetricCard
                  icon="/dashboard/break_time.png"
                  title="Break Time"
                  value="45"
                  unit="นาที"
                  accent="green"
                  footer="เหมาะสม"
                  progress={83}
                />
                <MetricCard
                  icon="/dashboard/current_state.png"
                  title="Current State"
                  value="ปกติ"
                  unit=""
                  accent="blue"
                  footer="สมดุลดี"
                />
              </div>

              <section className="relative overflow-hidden rounded-[20px] border border-sky-100 bg-white shadow-[0_12px_24px_rgba(151,190,255,0.12)]">
                <Image
                  src="/dashboard/bg-small.png"
                  alt="dashboard background"
                  width={2172}
                  height={724}
                  className="absolute inset-0 h-full w-full object-cover"
                />
                <div className="relative flex min-h-[140px] flex-col justify-between gap-3 p-3 sm:flex-row sm:items-end sm:p-5">
                  <div className="w-full sm:max-w-xs rounded-[18px] bg-white/92 p-3 shadow-[0_12px_24px_rgba(72,138,255,0.12)] backdrop-blur-sm">
                    <div className="text-2xl text-sky-300">"</div>
                    <p className="-mt-1 text-[0.96rem] font-medium leading-snug text-slate-800 sm:text-[1.06rem]">
                      วันนี้คุณทำได้ดีมากเลย!
                    </p>
                    <p className="mt-2 text-sm text-slate-600 sm:text-[0.95rem]">
                      สานต่อสิ่งดี ๆ ต่อวันนี้ ๆ ให้กับคุณนะ
                    </p>
                  </div>
                  <Image
                    src="/dashboard/NormalRabbit.png"
                    alt="rabbit"
                    width={160}
                    height={160}
                    className="mx-auto h-[80px] w-[80px] object-contain sm:mx-0 sm:h-[100px] sm:w-[100px]"
                  />
                </div>
              </section>
            </div>

            <div className="space-y-4 lg:space-y-5 lg:col-span-1">
              <FocusCycleSection />
              <EmotionSection />
            </div>
          </div>
        </div>
      </section>

      {isModalOpen ? (
        <div className="fixed inset-0 z-50 grid place-items-center bg-slate-950/25 p-4 backdrop-blur-[2px]">
          <div className="w-full max-w-md rounded-[24px] border border-emerald-100 bg-white p-5 shadow-[0_24px_54px_rgba(34,197,94,0.14)] sm:p-6">
            <h2 className="text-[1.35rem] font-semibold text-slate-900 sm:text-[1.5rem]">ตั้งเวลาโฟกัส</h2>
            <p className="mt-2 text-sm text-slate-500">เลือกเวลา mock ก่อนเริ่มโหมดโฟกัสบน dashboard</p>
            <div className="mt-5 grid grid-cols-2 gap-3">
              {PRESET_MINUTES.map((minute) => (
                <button
                  key={minute}
                  type="button"
                  onClick={() => setSelectedMin(minute)}
                  className={`rounded-2xl border px-4 py-2.5 text-sm font-medium transition ${
                    selectedMin === minute
                      ? "border-emerald-500 bg-emerald-500 text-white"
                      : "border-slate-200 bg-white text-slate-700 hover:border-emerald-200 hover:bg-emerald-50"
                  }`}
                >
                  {minute} นาที
                </button>
              ))}
            </div>
            <div className="mt-6 flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="rounded-2xl px-4 py-2 text-sm font-medium text-slate-500 hover:bg-slate-50"
              >
                ยกเลิก
              </button>
              <button
                type="button"
                onClick={() => activateFocus(selectedMin * 60, "manual")}
                className="rounded-2xl bg-emerald-500 px-5 py-2 text-sm font-medium text-white hover:bg-emerald-600"
              >
                เริ่มโฟกัส
              </button>
            </div>
          </div>
        </div>
      ) : null}

      {isLocked ? (
        <div className="fixed inset-0 z-[60] grid place-items-center bg-[radial-gradient(circle_at_top,#f7fff1_0%,#ffffff_55%)] p-4 sm:p-6">
          <div className="w-full max-w-xl rounded-[28px] border border-emerald-100 bg-white p-6 text-center shadow-[0_24px_64px_rgba(34,197,94,0.14)] sm:rounded-[32px] sm:p-8">
            <p className="text-xs font-medium uppercase tracking-[0.24em] text-emerald-600">Focus Mode</p>
            <Image
              src="/mainpage/image/aCarrot.png"
              alt="carrot"
              width={120}
              height={120}
              className="mx-auto mt-5 h-20 w-20 object-contain sm:h-24 sm:w-24"
            />
            <h3 className="mt-4 text-2xl font-semibold text-slate-900 sm:text-3xl">เวลาตั้งใจโฟกัส</h3>
            <p className="mt-2 text-sm font-normal text-slate-500">
              โหมดล็อกหน้าจอกำลังทำงาน ({lastSource === "device" ? "Device" : "Manual"})
            </p>
            <p className="mt-5 text-5xl font-semibold tracking-tight text-slate-900 sm:text-6xl">
              {minutes}:{seconds}
            </p>
            <p className="mt-3 text-sm text-slate-500">ระบบจะปลดล็อกอัตโนมัติเมื่อเวลาหมด</p>
            <button
              type="button"
              onClick={() => {
                setIsLocked(false);
                setRemainingSec(0);
              }}
              className="mt-8 rounded-2xl border border-slate-200 bg-white px-5 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
            >
              Emergency Stop
            </button>
          </div>
        </div>
      ) : null}
    </>
  );
}

function TopSummaryCard() {
  return (
    <section className="flex min-h-[72px] w-full items-center gap-3 rounded-[14px] border border-slate-100 bg-white p-2.5 shadow-[0_6px_16px_rgba(15,23,42,0.04)] sm:min-h-[84px]">
      <Image src="/dashboard/today_focus.png" alt="today focus" width={48} height={48} className="h-10 w-10 object-contain sm:h-12 sm:w-12" />
      <div className="flex-1">
        <p className="text-sm font-medium leading-snug text-slate-500 sm:text-sm">Today Focus Score</p>
        <div className="mt-0.5 flex items-end gap-1">
          <span className="text-[1.4rem] font-semibold leading-none text-[#28bf41] sm:text-[1.8rem]">72</span>
          <span className="pb-0.5 text-sm font-medium text-slate-500 sm:text-base">/100</span>
        </div>
      </div>
    </section>
  );
}

function StartFocusCard({
  onManualStart,
  onMockStart,
}: {
  onManualStart: () => void;
  onMockStart: () => void;
}) {
  return (
    <section className="w-full rounded-[18px] bg-[linear-gradient(135deg,#1fd149_0%,#18b634_55%,#169d2c_100%)] p-[1px] shadow-[0_12px_26px_rgba(34,197,94,0.18)]">
      <div className="flex min-h-[84px] h-full flex-col justify-between rounded-[17px] bg-[linear-gradient(135deg,rgba(255,255,255,0.06),rgba(255,255,255,0)_60%)] p-3 text-white sm:min-h-[96px]">
        <button
          type="button"
          onClick={onManualStart}
          className="flex items-center gap-3 text-left"
        >
          <span className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-white text-xl text-[#1fbe3d] shadow-[0_10px_22px_rgba(255,255,255,0.26)] sm:h-11 sm:w-11">
            ▶
          </span>
          <div className="min-w-0">
            <p className="text-[0.98rem] font-semibold leading-tight sm:text-[1.06rem]">Start Focus</p>
            <p className="mt-0.5 text-[0.85rem] text-white/88">เริ่มโฟกัสตอนนี้</p>
          </div>
          <Image
            src="/mainpage/image/aCarrot.png"
            alt="carrot"
            width={44}
            height={44}
            className="ml-auto h-7 w-7 shrink-0 object-contain"
          />
        </button>
        <button
          type="button"
          onClick={onMockStart}
          className="mt-1 self-start rounded-full border border-white/30 bg-white/12 px-2 py-0.5 text-[0.72rem] font-medium text-white hover:bg-white/18"
        >
          Mock Device Trigger
        </button>
      </div>
    </section>
  );
}

function FocusScoreSection() {
  const width = 720;
  const height = 300;
  const padding = 34;
  const stepX = (width - padding * 2) / (chartPoints.length - 1);
  const points = chartPoints.map((value, index) => {
    const x = padding + index * stepX;
    const y = height - padding - (value / 100) * (height - padding * 2);
    return { x, y, value };
  });
  const path = points
    .map((point, index) => `${index === 0 ? "M" : "L"} ${point.x} ${point.y}`)
    .join(" ");

  return (
    <section className="w-full rounded-[24px] border border-emerald-50 bg-white p-4 shadow-[0_12px_30px_rgba(15,23,42,0.055)] sm:p-5">
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-center gap-3">
          <span className="grid h-7 w-7 place-items-center rounded-full bg-[#1fc243] text-xs font-semibold text-white sm:h-8 sm:w-8 sm:text-sm">1</span>
          <div>
            <h2 className="text-[1.15rem] font-semibold text-slate-900 sm:text-[1.35rem]">Focus Score / ช่วงเวลา</h2>
            <p className="mt-1 text-sm text-slate-500">Focus Score</p>
          </div>
        </div>
        <div className="rounded-full border border-emerald-100 bg-emerald-50 px-3 py-1.5 text-sm font-semibold text-[#28bf41] sm:px-4 sm:py-2 sm:text-base">
          ↗ AVG 72
        </div>
      </div>

      <div className="mt-3 overflow-hidden rounded-[20px] border border-slate-100 bg-[linear-gradient(180deg,#ffffff_0%,#fcfffb_100%)] p-2 sm:p-3">
        <svg viewBox={`0 0 ${width} ${height}`} className="h-[180px] w-full sm:h-[220px] lg:h-[250px]">
          {[0, 25, 50, 75, 100].map((tick, index) => {
            const y = height - padding - (tick / 100) * (height - padding * 2);
            return (
              <g key={tick}>
                <line x1={padding} y1={y} x2={width - padding} y2={y} stroke="#e9f2e7" strokeDasharray="4 4" />
                <text x={padding - 16} y={y + 4} fontSize="12" fill="#64748b" textAnchor="end">
                  {tick}
                </text>
                {index < chartTimes.length && (
                  <line
                    x1={padding + index * ((width - padding * 2) / (chartTimes.length - 1))}
                    y1={padding}
                    x2={padding + index * ((width - padding * 2) / (chartTimes.length - 1))}
                    y2={height - padding}
                    stroke="#eff6ed"
                  />
                )}
              </g>
            );
          })}

          <path d={path} fill="none" stroke="#27b14b" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" />
          {points.map((point) => (
            <g key={`${point.x}-${point.y}`}>
              <circle cx={point.x} cy={point.y} r="5.6" fill="#fff" stroke="#27b14b" strokeWidth="3" />
            </g>
          ))}

          {chartTimes.map((label, index) => (
            <text
              key={label}
              x={padding + index * ((width - padding * 2) / (chartTimes.length - 1))}
              y={height - 8}
              fontSize="14"
              fill="#475569"
              textAnchor="middle"
            >
              {label}
            </text>
          ))}
        </svg>

        <div className="mt-2 grid grid-cols-6 sm:grid-cols-8 gap-1 rounded-[12px] bg-white">
          {timeline.map((item, index) => (
            <div
              key={`${item.state}-${index}`}
              className={`flex h-7 items-center justify-center rounded-md text-xs shadow-[inset_0_-2px_0_rgba(255,255,255,0.24)] sm:h-9 sm:text-base ${
                item.state === "focus"
                  ? "bg-[#ff5037]"
                  : item.state === "short_break"
                  ? "bg-[#83d225]"
                  : "bg-[#ffbc17]"
              } text-white`}
            >
              {item.icon}
            </div>
          ))}
        </div>

        <div className="mt-3 flex flex-wrap gap-x-4 gap-y-2 text-xs text-slate-700 sm:text-sm">
          <LegendDot color="#ff5037" label="Focus (25 นาที)" />
          <LegendDot color="#83d225" label="Short Break (5 นาที)" />
          <LegendDot color="#ffbc17" label="Long Rest (30 นาที)" />
        </div>
      </div>
    </section>
  );
}

function FocusCycleSection() {
  const segments = [
    { color: "#ff3d30", value: 35 },
    { color: "#82d21e", value: 10 },
    { color: "#ffbe18", value: 25 },
    { color: "#82d21e", value: 10 },
    { color: "#ff3d30", value: 20 },
  ];

  return (
    <section className="w-full rounded-[24px] border border-emerald-50 bg-white p-4 shadow-[0_12px_30px_rgba(15,23,42,0.055)] sm:p-5">
      <div className="flex items-center gap-3">
        <span className="grid h-7 w-7 place-items-center rounded-full bg-[#1fc243] text-xs font-semibold text-white sm:h-8 sm:w-8 sm:text-sm">2</span>
        <h2 className="text-[1.15rem] font-semibold text-slate-900 sm:text-[1.35rem]">วงจรโฟกัส / พัก</h2>
      </div>

      <div className="mt-4 grid gap-4 grid-cols-1 sm:grid-cols-2 xl:grid-cols-1">
        <div className="grid place-items-center">
          <div
            className="relative h-[160px] w-[160px] rounded-full sm:h-[200px] sm:w-[200px] lg:h-[240px] lg:w-[240px]"
            style={{
              background: `conic-gradient(
                ${segments[0].color} 0% 35%,
                white 35% 36%,
                ${segments[1].color} 36% 46%,
                white 46% 47%,
                ${segments[2].color} 47% 72%,
                white 72% 73%,
                ${segments[3].color} 73% 83%,
                white 83% 84%,
                ${segments[4].color} 84% 100%
              )`,
            }}
          >
            <div className="absolute inset-[18px] grid place-items-center rounded-full bg-white shadow-[inset_0_0_0_1px_rgba(226,232,240,0.9)] sm:inset-[24px] lg:inset-[32px]">
              <Image
                src="/mainpage/image/aCarrot.png"
                alt="carrot cycle"
                width={120}
                height={120}
                className="h-12 w-12 object-contain sm:h-16 sm:w-16 lg:h-20 lg:w-20"
              />
              <p className="-mt-1 text-lg font-semibold text-slate-800 sm:text-xl lg:text-2xl">1 Cycle</p>
            </div>
          </div>
        </div>

        <div className="space-y-2 sm:space-y-3">
          <CycleItem color="#ff3d30" title="Focus" subtitle="ทำงานอย่างตั้งใจ" value="25 นาที" />
          <CycleItem color="#82d21e" title="Short Break" subtitle="พักสั้น ๆ รีเซ็ตสมาธิ" value="5 นาที" />
          <CycleItem color="#ffbe18" title="Long Rest" subtitle="พักยาว ชาร์จพลังใจ" value="30 นาที" />
          <div className="rounded-[20px] border border-emerald-100 bg-[linear-gradient(180deg,#f9fff6_0%,#f3ffef_100%)] px-4 py-2 sm:py-3 text-xs sm:text-sm font-medium text-[#46a329]">
            💡 แนะนำ: ทำ 4 รอบ แล้วพักยาว 30 นาที 🍃
          </div>
        </div>
      </div>
    </section>
  );
}

function EmotionSection() {
  return (
    <section className="rounded-[24px] border border-emerald-50 bg-white p-4 shadow-[0_12px_30px_rgba(15,23,42,0.055)] sm:p-5">
      <div className="flex items-center gap-3">
        <span className="grid h-7 w-7 place-items-center rounded-full bg-[#1fc243] text-xs font-semibold text-white sm:h-8 sm:w-8 sm:text-sm">3</span>
        <h2 className="text-[1.15rem] font-semibold text-slate-900 sm:text-[1.35rem]">Emotion State</h2>
      </div>

      <div className="mt-4 grid gap-3 sm:gap-4 grid-cols-1 lg:grid-cols-2">
        <div className="rounded-[22px] border border-slate-100 bg-[radial-gradient(circle_at_center,#ffffff_0%,#fbfdff_100%)] p-3 sm:p-4">
          <div className="relative mx-auto h-[160px] max-w-full rounded-full bg-[conic-gradient(from_90deg,rgba(251,191,36,0.18)_0deg,rgba(34,197,94,0.14)_90deg,rgba(59,130,246,0.14)_180deg,rgba(239,68,68,0.16)_270deg,rgba(251,191,36,0.18)_360deg)] sm:h-[200px] lg:h-[240px]">
            <div className="absolute inset-0 rounded-full border border-slate-100" />
            <div className="absolute left-1/2 top-2 sm:top-3 -translate-x-1/2 text-center text-[10px] sm:text-xs text-slate-600">
              <p className="font-medium">Valence (ความรู้สึก)</p>
              <p>ดี</p>
            </div>
            <div className="absolute bottom-2 sm:bottom-3 left-1/2 -translate-x-1/2 text-[10px] sm:text-xs text-slate-600">เศร้า</div>
            <div className="absolute left-1.5 sm:left-2.5 top-1/2 -translate-y-1/2 text-[8px] sm:text-[10px] text-slate-600">Unmotivated</div>
            <div className="absolute right-1.5 sm:right-2.5 top-1/2 -translate-y-1/2 text-[8px] sm:text-[10px] text-slate-600">Motivate</div>
            <div className="absolute left-1/2 top-1/2 h-px w-[78%] -translate-x-1/2 bg-slate-300" />
            <div className="absolute left-1/2 top-1/2 h-[78%] w-px -translate-x-1/2 -translate-y-1/2 bg-slate-300" />

            <EmotionPoint label="ผ่อนคลาย" color="#27b14b" x="28%" y="35%" />
            <EmotionPoint label="สนุก" color="#f9be16" x="74%" y="40%" />
            <EmotionPoint label="เบื่อ" color="#3b82f6" x="32%" y="70%" />
            <EmotionPoint label="เครียด" color="#ef4444" x="70%" y="71%" />
            <EmotionPoint label="Normal" color="#8bc34a" x="56%" y="54%" active />
          </div>
        </div>

        <div className="flex flex-col gap-2 sm:gap-3">
          <div className="rounded-[22px] border border-slate-100 bg-white p-3 sm:p-4 shadow-[0_10px_24px_rgba(15,23,42,0.05)]">
            {emotionLegend.map((item) => (
              <div key={item.key} className="flex items-center gap-2 sm:gap-3 border-b border-slate-100 py-2 sm:py-2.5 last:border-b-0">
                <span className="h-3 w-3 shrink-0 rounded-full sm:h-3.5 sm:w-3.5" style={{ backgroundColor: item.color }} />
                <div className="flex-1 min-w-0">
                  <p className="text-sm sm:text-base font-medium text-slate-800">{item.label}</p>
                  <p className="text-xs text-slate-500">{item.note}</p>
                </div>
              </div>
            ))}
          </div>
          <div className="rounded-[20px] border border-emerald-100 bg-[linear-gradient(180deg,#f7fff7_0%,#f0ffef_100%)] px-3 sm:px-4 py-2 sm:py-3 text-xs sm:text-sm font-medium text-[#319541]">
            💚 ตรวจสอบอารมณ์ของคุณสม่ำเสมอ เพื่อให้เข้าใจตัวเองมากขึ้น
          </div>
        </div>
      </div>
    </section>
  );
}

function MetricCard({
  icon,
  title,
  value,
  unit,
  footer,
  accent,
  progress,
}: {
  icon: string;
  title: string;
  value: string;
  unit: string;
  footer: string;
  accent: "green" | "red" | "blue";
  progress?: number;
}) {
  const theme =
    accent === "green"
      ? {
          bg: "from-[#f2ffef] to-[#fbfffb]",
          line: "bg-[#74d957]",
        }
      : accent === "red"
      ? {
          bg: "from-[#fff4f1] to-[#fffdfd]",
          line: "bg-[#ff6e55]",
        }
      : {
          bg: "from-[#eef8ff] to-[#f9fcff]",
          line: "bg-[#5eb2ff]",
        };

  return (
    <section className={`rounded-[22px] border border-slate-100 bg-gradient-to-b ${theme.bg} p-4 shadow-[0_12px_22px_rgba(15,23,42,0.05)]`}>
      <Image src={icon} alt={title} width={58} height={58} className="h-12 w-12 object-contain" />
      <p className="mt-3 text-[0.95rem] font-medium text-slate-700 sm:text-base">{title}</p>
      <div className="mt-2 flex items-end gap-1.5">
        <span className="text-[1.6rem] font-semibold leading-none text-slate-900 sm:text-[1.85rem]">{value}</span>
        {unit ? <span className="pb-0.5 text-sm text-slate-600 sm:text-[0.95rem]">{unit}</span> : null}
      </div>
      <p className="mt-2.5 text-xs text-slate-500 sm:text-sm">{footer}</p>
      {typeof progress === "number" ? (
        <div className="mt-3 h-2 rounded-full bg-white/80">
          <div className={`h-full rounded-full ${theme.line}`} style={{ width: `${progress}%` }} />
        </div>
      ) : null}
    </section>
  );
}

function CycleItem({
  color,
  title,
  subtitle,
  value,
}: {
  color: string;
  title: string;
  subtitle: string;
  value: string;
}) {
  return (
    <div className="rounded-[22px] border border-slate-100 bg-white px-4 py-3.5 shadow-[0_10px_22px_rgba(15,23,42,0.05)]">
      <div className="flex items-start gap-4">
        <span className="mt-1 h-4 w-4 rounded-full" style={{ backgroundColor: color }} />
        <div className="flex-1">
          <p className="text-base font-semibold text-slate-800 sm:text-[1.05rem]">{title}</p>
          <p className="mt-1 text-xs text-slate-500 sm:text-sm">{subtitle}</p>
        </div>
        <p className="text-[1.25rem] font-semibold text-slate-800 sm:text-[1.45rem]">{value}</p>
      </div>
    </div>
  );
}

function LegendDot({ color, label }: { color: string; label: string }) {
  return (
    <div className="flex items-center gap-2">
      <span className="h-3.5 w-3.5 rounded-full" style={{ backgroundColor: color }} />
      <span>{label}</span>
    </div>
  );
}

function EmotionPoint({
  label,
  color,
  x,
  y,
  active = false,
}: {
  label: string;
  color: string;
  x: string;
  y: string;
  active?: boolean;
}) {
  return (
    <div className="absolute -translate-x-1/2 -translate-y-1/2 text-center" style={{ left: x, top: y }}>
      <div
        className={`mx-auto rounded-full ${active ? "h-6 w-6 ring-4 ring-[#a7ef7d]/55 sm:h-8 sm:w-8" : "h-3.5 w-3.5 sm:h-4 sm:w-4"}`}
        style={{ backgroundColor: color }}
      />
      <p className="mt-1.5 text-[10px] font-medium text-slate-600 sm:text-xs">{label}</p>
    </div>
  );
}
