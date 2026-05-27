"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { 
  HiHome, 
  HiOutlineShoppingBag, 
  HiOutlineClipboardCheck, 
  HiOutlineCog 
} from "react-icons/hi";
import { FaTree, FaWater, FaSeedling } from "react-icons/fa";
import { MdAutoGraph } from "react-icons/md";

export default function Sidebar() {
  const pathname = usePathname();

  // ไม่แสดง Sidebar ในหน้าแรก
  if (pathname === "/") return null;

  const navItems = [
    { name: "แดชบอร์ด", href: "/main", icon: MdAutoGraph },
    { name: "โซนบก", href: "/land", icon: FaTree, iconColor: "text-amber-700" },
    { name: "โซนน้ำ", href: "#", icon: FaWater, iconColor: "text-sky-500", badge: "เร็วๆ นี้" },
    { name: "ภารกิจ", href: "/quests", icon: HiOutlineClipboardCheck },
    { name: "กระเป๋า", href: "/bag", icon: HiOutlineShoppingBag },
    { name: "การเติบโต", href: "/growth", icon: FaSeedling },
    { name: "ตั้งค่า", href: "/settings", icon: HiOutlineCog },
  ];

  return (
    <aside className="fixed left-0 top-0 bottom-0 z-40 hidden w-[280px] flex-col border-r border-[#f0f0f0] bg-white shadow-[2px_0_20px_rgba(0,0,0,0.02)] md:flex overflow-y-auto">
      {/* ส่วนหัว Logo */}
      <div className="flex flex-col items-center justify-center pt-10 pb-6 shrink-0">
        <div className="flex items-center gap-1.5">
          <span className="text-2xl drop-shadow-sm">🌱</span>
          <h1 className="text-[1.7rem] font-medium tracking-tight">
            <span className="text-[#3DC029]">ดูแลเพื่อน</span>
            <span className="text-[#28A4ED]">น้อย</span>
          </h1>
          <span className="text-xl drop-shadow-sm">🍃</span>
        </div>
        <p className="mt-2 text-[0.85rem] text-slate-400 font-normal tracking-wide">
          ให้อาหาร • เติบโต • ผูกพัน
        </p>
      </div>

      {/* เมนูนำทาง */}
      <nav className="flex-1 px-5 py-2 space-y-2">
        {navItems.map((item) => {
          const isActive = pathname === item.href;
          const Icon = item.icon;
          
          return (
            <Link
              key={item.name}
              href={item.href}
              className={`group flex items-center justify-between rounded-2xl px-5 py-3.5 transition-all duration-200 ${
                isActive 
                  ? "bg-[#F3FCEB] text-[#3DC029] font-medium shadow-sm" 
                  : "text-slate-500 font-light hover:bg-slate-50 hover:text-slate-800"
              }`}
            >
              <div className="flex items-center gap-3.5">
                <Icon
                  className={`text-[1.35rem] drop-shadow-sm transition-transform group-hover:scale-110 ${isActive ? "text-[#3DC029]" : item.iconColor || "text-slate-400 group-hover:text-slate-600"}`}
                />
                <span className="text-[0.95rem] tracking-wide">{item.name}</span>
              </div>

              {item.badge && (
                <span className="rounded-full bg-[#E5F5FF] px-2.5 py-1 text-[0.7rem] font-medium text-[#28A4ED] shrink-0 border border-[#bce3fc]">
                  {item.badge}
                </span>
              )}
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}
