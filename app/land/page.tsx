"use client";

import Image from "next/image";
import { useMemo, useState, type ReactNode } from "react";
import { HiHeart, HiLightningBolt } from "react-icons/hi";

type Mood = "normal" | "happy" | "hungry" | "excited";

const MAX_CARROT_LEVEL = 6;

const moodLabel: Record<Mood, string> = {
  normal: "ปกติ",
  happy: "สดใส",
  hungry: "หิวแล้ว",
  excited: "ตื่นเต้น",
};

const rewardSteps = [
  { day: 1, title: "เริ่มต้น", reward: "rabbit1", caption: "ตัวจิ๋วสุด" },
  { day: 7, title: "1 สัปดาห์", reward: "บ้านแสนอบอุ่น", caption: "ปลดล็อกบ้าน" },
  { day: 30, title: "1 เดือน", reward: "ชุดน่ารัก", caption: "ปลดล็อกชุด" },
  { day: 90, title: "3 เดือน", reward: "Secret", caption: "ของลับพิเศษ" },
];

export default function Land() {
  const [energy, setEnergy] = useState(80);
  const [carrotLevel, setCarrotLevel] = useState(1);
  const [carrotCount, setCarrotCount] = useState(12);
  const [careDays, setCareDays] = useState(1);
  const [mood, setMood] = useState<Mood>("normal");
  const [fedMessage, setFedMessage] = useState(false);

  const rabbitLevel = useMemo(() => {
    if (careDays >= 90) return 4;
    if (careDays >= 30) return 3;
    if (careDays >= 7) return 2;
    return 1;
  }, [careDays]);

  function collectCarrot() {
    setMood("excited");

    if (carrotLevel < MAX_CARROT_LEVEL) {
      setCarrotLevel((level) => level + 1);
      return;
    }

    setCarrotLevel(1);
    setCarrotCount((count) => count + 1);
  }

  function feedRabbit() {
    if (carrotCount <= 0) {
      setMood("hungry");
      return;
    }

    setCarrotCount((count) => count - 1);
    setEnergy((value) => Math.min(value + 20, 100));
    setCareDays((days) => Math.min(days + 1, 90));
    setMood("happy");
    setFedMessage(true);
    window.setTimeout(() => setFedMessage(false), 1600);
  }

  return (
    <main className="min-h-[calc(100vh-3rem)] bg-white px-3 pb-24 pt-2 text-[#315827] sm:px-5 md:px-6 md:py-5 lg:px-8">
      <div className="mx-auto w-full max-w-[470px] space-y-3 md:max-w-[760px] xl:max-w-[900px]">
        <section className="relative h-[278px] overflow-hidden rounded-[28px] border border-white bg-[#9be0ff] shadow-[0_16px_34px_rgba(34,139,78,0.18)] sm:h-[340px] md:h-[390px] lg:h-[420px]">
          <Image
            src="/mainpage/image/bg.png"
            alt="ทุ่งหญ้าโซนบก"
            fill
            priority
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 760px, 900px"
            className="object-cover"
          />

          <div className="absolute left-1/2 top-4 z-20 w-[min(74%,340px)] -translate-x-1/2 rounded-[14px] bg-white/95 px-4 py-3 shadow-[0_10px_24px_rgba(15,23,42,0.15)] sm:top-5 sm:w-[min(66%,380px)]">
            <div className="mb-2 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <HiLightningBolt className="h-5 w-5 text-[#f4b52a]" />
                <span className="text-sm font-medium text-slate-700">พลังงาน</span>
              </div>
              <span className="text-sm font-medium text-slate-600">{energy} / 100</span>
            </div>
            <div className="h-3 overflow-hidden rounded-full bg-slate-100">
              <div
                className="h-full rounded-full bg-gradient-to-r from-[#8bd621] to-[#13c85a] transition-[width] duration-500"
                style={{ width: `${energy}%` }}
              />
            </div>
          </div>

          {careDays >= 7 && (
            <div className="absolute bottom-8 right-3 z-10 h-24 w-24 sm:bottom-10 sm:right-7 sm:h-32 sm:w-32 md:h-40 md:w-40">
              <Image
                src="/mainpage/image/home_rabbit.png"
                alt="บ้านของกระต่าย"
                fill
                sizes="128px"
                className="object-contain drop-shadow-[0_10px_16px_rgba(35,68,25,0.18)]"
              />
            </div>
          )}

          <div className="absolute bottom-3 left-1/2 z-20 -translate-x-1/2">
            <RabbitImage level={rabbitLevel} mood={mood} dressed={careDays >= 30} />
          </div>

          {fedMessage && (
            <div className="absolute bottom-14 right-4 z-30 rounded-[18px] bg-white px-4 py-3 text-sm font-medium text-[#45a82c] shadow-[0_12px_26px_rgba(22,101,52,0.2)]">
              <div className="flex items-center gap-2">
                <HiHeart className="h-5 w-5 text-[#ff8cab]" />
                ให้อาหารแล้ว
              </div>
              <p className="mt-1 text-xs text-[#4c7c3d]">+20 พลังงาน</p>
            </div>
          )}

          <div className="absolute bottom-4 left-4 z-20 rounded-full bg-white/90 px-3 py-1 text-xs font-medium text-[#4c7c3d] shadow-sm">
            อารมณ์: {moodLabel[mood]}
          </div>
        </section>

        <section className="grid grid-cols-[minmax(0,1fr)_12px_minmax(0,1fr)_12px_minmax(0,1fr)] items-stretch gap-2 sm:grid-cols-[minmax(0,1fr)_22px_minmax(0,1fr)_22px_minmax(0,1fr)] sm:gap-3 md:gap-4">
          <ActionCard
            title="รับอาหาร"
            button="เก็บ"
            hint={`ได้ ${carrotLevel === MAX_CARROT_LEVEL ? "1 แครอท" : `carrot${carrotLevel}`}`}
            onClick={collectCarrot}
          >
            <AssetImage
              src={`/mainpage/image/carrot${carrotLevel}.png`}
              alt={`carrot${carrotLevel}`}
              className="h-14 w-16 sm:h-16 sm:w-20"
            />
          </ActionCard>
          <StepArrow />
          <BasketCard count={carrotCount} />
          <StepArrow />
          <ActionCard title="ให้อาหารน้อง" button="ให้อาหาร" onClick={feedRabbit}>
            <AssetImage
              src="/mainpage/image/aCarrot.png"
              alt="แครอทสำหรับให้อาหาร"
              className="h-14 w-14 sm:h-16 sm:w-16"
            />
          </ActionCard>
        </section>

        <section className="rounded-[24px] border border-slate-100 bg-white p-3 shadow-[0_10px_28px_rgba(15,23,42,0.07)] sm:p-4">
          <div className="mb-4 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between sm:gap-3">
            <div>
              <p className="text-base font-medium text-[#48a62c]">การเติบโตของน้อง</p>
              <p className="text-xs text-slate-500">
                เล่นต่อเนื่อง {careDays} วัน • rabbit{rabbitLevel}
              </p>
            </div>
            <div className="rounded-full bg-[#eaf8e5] px-3 py-1 text-xs font-medium text-[#45a82c]">
              {nextRewardLabel(careDays)}
            </div>
          </div>

          <div className="relative px-1 sm:px-2">
            <span className="pointer-events-none absolute left-[12.5%] right-[12.5%] top-8 z-0 h-[2px] bg-[repeating-linear-gradient(to_right,#cbd5e1_0_12px,transparent_12px_24px)] sm:top-9 md:top-10" />
            <div className="relative z-10 grid grid-cols-4 items-start gap-1.5 sm:gap-2 md:gap-4">
            {rewardSteps.map((item) => {
              const unlocked = careDays >= item.day;

              return (
                <div key={item.day} className="relative text-center">
                  <div
                    className={`relative z-10 mx-auto grid h-16 w-16 place-items-center overflow-hidden rounded-full border-2 shadow-[0_0_0_8px_#ffffff] sm:h-[72px] sm:w-[72px] md:h-20 md:w-20 md:shadow-[0_0_0_10px_#ffffff] ${
                      unlocked
                        ? "border-[#73c848] bg-[#f2fbe9]"
                        : "border-slate-200 bg-white grayscale"
                    }`}
                  >
                    <RewardVisual day={item.day} />
                  </div>
                  <p className="mt-2 text-[11px] font-medium text-slate-500">{item.title}</p>
                  <p className="text-xs font-medium text-[#315b25]">{item.reward}</p>
                  <p className="mt-0.5 text-[10px] text-slate-400">{item.caption}</p>
                  {unlocked && (
                    <span className="mx-auto mt-2 grid h-5 w-5 place-items-center rounded-full bg-[#50b82e] text-xs font-medium text-white">
                      ✓
                    </span>
                  )}
                </div>
              );
            })}
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}

function nextRewardLabel(days: number) {
  if (days < 7) return `อีก ${7 - days} วันได้บ้าน`;
  if (days < 30) return `อีก ${30 - days} วันได้ชุด`;
  if (days < 90) return `อีก ${90 - days} วันได้ Secret`;
  return "ปลดล็อกครบแล้ว";
}

function rabbitSrc(level: number, mood: Mood, dressed: boolean) {
  if (dressed && mood === "hungry") return "/mainpage/image/rabbitws_sad.png";
  if (dressed && (mood === "happy" || mood === "excited")) {
    return "/mainpage/image/rabbitws_happy.png";
  }
  if (dressed) return "/mainpage/image/rabbitws_normal.png";

  return `/mainpage/image/rabbit${level}.png`;
}

function RabbitImage({
  level,
  mood,
  dressed,
}: {
  level: number;
  mood: Mood;
  dressed: boolean;
}) {
  const sizeClass =
    level === 1
      ? "h-[126px] w-[126px] sm:h-[148px] sm:w-[148px] md:h-[170px] md:w-[170px]"
      : level === 2
        ? "h-[138px] w-[138px] sm:h-[162px] sm:w-[162px] md:h-[188px] md:w-[188px]"
        : level === 3
          ? "h-[150px] w-[150px] sm:h-[176px] sm:w-[176px] md:h-[204px] md:w-[204px]"
          : "h-[160px] w-[160px] sm:h-[188px] sm:w-[188px] md:h-[218px] md:w-[218px]";

  return (
    <div className={`relative ${sizeClass} animate-[pet-bob_3.4s_ease-in-out_infinite]`}>
      <Image
        src={rabbitSrc(level, mood, dressed)}
        alt={`rabbit${level} ${moodLabel[mood]}`}
        fill
        priority
        sizes="(max-width: 640px) 160px, (max-width: 1024px) 188px, 218px"
        className="object-contain drop-shadow-[0_12px_18px_rgba(35,68,25,0.2)]"
      />
    </div>
  );
}

function ActionCard({
  title,
  button,
  hint,
  children,
  onClick,
}: {
  title: string;
  button: string;
  hint?: string;
  children: ReactNode;
  onClick: () => void;
}) {
  return (
    <article className="h-[162px] rounded-[16px] border border-slate-100 bg-white px-2 py-2.5 text-center shadow-[0_10px_24px_rgba(15,23,42,0.07)] sm:h-[186px] sm:rounded-[20px] sm:px-4 sm:py-3.5">
      <div className="flex h-full flex-col items-center">
        <h2 className="text-[11px] font-medium leading-tight text-[#48a62c] sm:text-sm">{title}</h2>
        <div className="mt-1.5 grid h-12 place-items-center sm:mt-3 sm:h-16">{children}</div>
        <div className="mt-auto flex flex-col items-center">
          <button
            type="button"
            onClick={onClick}
            className="h-8 w-full max-w-[78px] rounded-full bg-[#58b43c] px-2 text-[12px] font-semibold text-white shadow-[0_8px_14px_rgba(72,166,44,0.22)] transition active:scale-95 sm:h-10 sm:max-w-[112px] sm:px-3 sm:text-sm"
          >
            {button}
          </button>
          {hint && <p className="mt-1 text-[10px] font-medium text-[#58b43c] sm:mt-1.5 sm:text-[11px]">{hint}</p>}
        </div>
      </div>
    </article>
  );
}

function BasketCard({ count }: { count: number }) {
  return (
    <article className="relative h-[162px] rounded-[16px] border border-slate-100 bg-white px-2 py-2.5 text-center shadow-[0_10px_24px_rgba(15,23,42,0.07)] sm:h-[186px] sm:rounded-[20px] sm:px-4 sm:py-3.5">
      <h2 className="text-[11px] font-medium leading-tight text-[#48a62c] sm:text-sm">แครอทของฉัน</h2>
      <div className="mt-1.5 grid h-14 place-items-center sm:mt-3 sm:h-20">
        <AssetImage
          src="/mainpage/image/allCarrot.png"
          alt="ตะกร้าแครอท"
          className="h-12 w-16 sm:h-18 sm:w-24"
        />
      </div>
      <span className="absolute bottom-3 right-3 grid h-7 min-w-7 place-items-center rounded-full bg-[#58b43c] px-2 text-xs font-medium text-white sm:bottom-4 sm:right-4 sm:h-8 sm:min-w-8 sm:text-sm">
        {count}
      </span>
    </article>
  );
}

function AssetImage({
  src,
  alt,
  className,
}: {
  src: string;
  alt: string;
  className: string;
}) {
  return (
    <div className={`relative ${className}`}>
      <Image src={src} alt={alt} fill sizes="120px" className="object-contain" />
    </div>
  );
}

function StepArrow() {
  return (
    <div className="grid h-full min-h-[162px] place-items-center text-xl font-semibold leading-none text-[#56b43a] sm:min-h-[186px] sm:text-3xl">
      &gt;
    </div>
  );
}

function RewardVisual({ day }: { day: number }) {
  if (day === 1) {
    return (
      <Image
        src="/mainpage/image/rabbit1.png"
        alt="rabbit1"
        fill
        sizes="64px"
        className="scale-125 object-contain"
      />
    );
  }

  if (day === 7) return <HouseIcon />;
  if (day === 30) return <OutfitIcon />;

  return (
    <Image
      src="/mainpage/image/rabbit_secret.png"
      alt="secret rabbit"
      fill
      sizes="64px"
      className="scale-110 object-contain"
    />
  );
}

function HouseIcon() {
  return (
    <Image
      src="/mainpage/image/home_rabbit.png"
      alt="home rabbit"
      fill
      sizes="64px"
      className="scale-110 object-contain"
    />
  );
}

function OutfitIcon() {
  return (
     <Image
      src="/mainpage/image/rabbitws_normal.png"
      alt="shirt rabbit"
      fill
      sizes="64px"
      className="scale-110 object-contain"
    />
  );
}
