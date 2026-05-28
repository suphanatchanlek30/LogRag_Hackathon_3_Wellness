"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useRef } from "react";

export default function HomePage() {
  const video1Ref = useRef<HTMLVideoElement>(null);
  const video2Ref = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    if (video1Ref.current) {
      video1Ref.current.playbackRate = 0.5; // ปรับความเร็วลดลงเหลือ 50%
    }
    if (video2Ref.current) {
      video2Ref.current.playbackRate = 0.5; // ปรับความเร็วลดลงเหลือ 50%
    }
  }, []);

  return (
    <main className="relative min-h-screen overflow-hidden bg-white px-4 py-6 text-slate-800">

      <div className="relative mx-auto flex min-h-[calc(100vh-3rem)] max-w-[420px] flex-col items-center justify-between">
        <header className="flex flex-col items-center text-center shrink-0 pt-2 lg:pt-6">
          <div className="flex items-center gap-2">
            <span className="text-2xl">🍃</span>
            <h1 className="text-[clamp(2rem,8vw,3rem)] font-medium leading-none">
              <span className="text-emerald-500">Log</span>
              <span className="text-sky-500"> Rag</span>
            </h1>
            <span className="text-2xl">🍃</span>
          </div>
          <p className="mt-2 text-[clamp(0.95rem,3.5vw,1.15rem)] font-normal text-slate-500">
            ให้อาหาร • เติบโต • ผูกพัน
          </p>
        </header>

        <section className="relative flex w-full flex-1 items-center justify-center my-8">
          <div className="absolute inset-x-4 top-1/2 h-[82%] -translate-y-1/2 rounded-full bg-[radial-gradient(circle,_rgba(52,211,153,0.1)_0%,_rgba(56,189,248,0.08)_48%,_transparent_75%)] blur-2xl" />

          <div className="relative mx-auto aspect-square w-[min(92vw,380px)] overflow-hidden rounded-full border-[6px] border-white bg-white shadow-[0_20px_60px_rgba(148,163,184,0.24)] ring-[3px] ring-lime-400/90">
            <div className="absolute inset-[6px] rounded-full ring-[3px] ring-sky-300/75" />

            <div className="absolute inset-0 flex">
              <section className="relative w-1/2 overflow-hidden">
                <video
                  ref={video1Ref}
                  className="absolute inset-0 h-full w-full object-cover object-center"
                  src="/mainpage/video/f1.mp4"
                  autoPlay
                  muted
                  loop
                  playsInline
                  preload="metadata"
                  disablePictureInPicture
                  aria-hidden="true"
                />
                <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(255,255,255,0.12),rgba(255,255,255,0.02)_25%,rgba(163,230,53,0.04)_60%,rgba(22,163,74,0.08)_100%)]" />

                <Link href="/land" className="absolute left-1/2 top-[54%] w-[64%] -translate-x-1/2 -translate-y-1/2 block transition-transform hover:scale-105 active:scale-95 cursor-pointer">
                  <Image
                    src="/mainpage/image/left.png"
                    alt="โซนบก"
                    width={220}
                    height={220}
                    priority
                    className="h-auto w-full object-contain drop-shadow-[0_10px_18px_rgba(255,255,255,0.35)]"
                  />
                </Link>
              </section>

              <section className="relative w-1/2 overflow-hidden">
                <video
                  ref={video2Ref}
                  className="absolute inset-0 h-full w-full object-cover object-center saturate-110"
                  src="/mainpage/video/f2.mp4"
                  autoPlay
                  muted
                  loop
                  playsInline
                  preload="metadata"
                  disablePictureInPicture
                  aria-hidden="true"
                />
                <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(255,255,255,0.1),rgba(255,255,255,0.02)_24%,rgba(56,189,248,0.05)_62%,rgba(3,105,161,0.1)_100%)]" />

                <div className="absolute left-1/2 top-[54%] w-[64%] -translate-x-1/2 -translate-y-1/2">
                  <Image
                    src="/mainpage/image/right.png"
                    alt="โซนน้ำ"
                    width={220}
                    height={220}
                    priority
                    className="h-auto w-full object-contain drop-shadow-[0_10px_18px_rgba(255,255,255,0.28)]"
                  />
                </div>
              </section>
            </div>
            <div className="pointer-events-none absolute inset-y-[2%] left-1/2 w-[3px] -translate-x-1/2 rounded-full bg-white/85 shadow-[0_0_16px_rgba(255,255,255,0.9)]" />
          </div>
        </section>

        {/* กล่อง "เริ่มต้นการผจญภัย" ด้านล่างวงกลม */}
        <div className="mx-auto shrink-0 flex w-[min(92vw,400px)] items-center gap-4 rounded-[10px] border-[1.5px] border-slate-200/80 bg-white px-5 py-4 shadow-[0_8px_24px_rgba(148,163,184,0.06)] sm:px-6 sm:py-5 pb-2 lg:pb-6">
          <div className="shrink-0">
            <Image
                src="/mainpage/image/rise.png"
                alt="เริ่มต้นการผจญภัย"
                width={60}
                height={60}
                className="h-[52px] w-[52px] object-contain drop-shadow-[0_4px_8px_rgba(0,0,0,0.05)] sm:h-[60px] sm:w-[60px]"
              />
            </div>
            <div className="flex flex-col">
              <h2 className="text-[1.125rem] font-bold text-emerald-500 sm:text-[1.2rem]">
                เริ่มต้นการผจญภัย
              </h2>
              <p className="mt-0.5 text-[0.875rem] leading-[1.35] text-slate-500 sm:text-[0.95rem]">
                เลือกโลกที่คุณอยากเข้าไปดูแลเพื่อนน้อยกันเลย!
              </p>
            </div>
          </div>
      </div>
    </main>
  );
}
