"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { 
  HiOutlineShoppingBag, 
  HiOutlineClipboardCheck, 
  HiOutlineCog,
  HiChevronDoubleLeft,
  HiChevronDoubleRight,
} from "react-icons/hi";
import { FaTree, FaWater, FaSeedling } from "react-icons/fa";
import { MdAutoGraph } from "react-icons/md";

type SidebarProps = {
  isCollapsed: boolean;
  onToggle: () => void;
};

export default function Sidebar({ isCollapsed, onToggle }: SidebarProps) {
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
    <aside
      className={`fixed left-0 top-0 bottom-0 z-40 hidden flex-col border-r border-[#f0f0f0] bg-white shadow-[2px_0_20px_rgba(0,0,0,0.02)] md:flex overflow-y-auto transition-[width] duration-300 ${
        isCollapsed ? "w-[88px]" : "w-[280px]"
      }`}
    >
      {/* ส่วนหัว Logo */}
      <div className="pt-6 pb-4 shrink-0">
        <div className={`flex items-center ${isCollapsed ? "justify-center px-2" : "justify-center px-4"}`}>
          {!isCollapsed ? (
            <div className="flex items-center gap-1.5">
              <span className="text-2xl drop-shadow-sm">🌱</span>
              <h1 className="text-[1.7rem] font-medium tracking-tight">
                <span className="text-[#3DC029]">Log </span>
                <span className="text-[#28A4ED]">Rag</span>
              </h1>
              <span className="text-xl drop-shadow-sm">🍃</span>
            </div>
          ) : (
            <span className="text-2xl drop-shadow-sm">🌱</span>
          )}
        </div>
        {!isCollapsed ? (
          <p className="mt-2 text-center text-[0.85rem] text-slate-400 font-normal tracking-wide">
            ให้อาหาร • เติบโต • ผูกพัน
          </p>
        ) : null}
      </div>

      {/* เมนูนำทาง */}
      <nav className={`flex-1 py-2 space-y-2 ${isCollapsed ? "px-3" : "px-5"}`}>
        {navItems.map((item) => {
          const isActive = pathname === item.href;
          const Icon = item.icon;
          
          return (
            <Link
              key={item.name}
              href={item.href}
              title={isCollapsed ? item.name : undefined}
              className={`group flex items-center rounded-2xl py-3.5 transition-all duration-200 ${
                isCollapsed ? "justify-center px-2" : "justify-between px-5"
              } ${
                isActive 
                  ? "bg-[#F3FCEB] text-[#3DC029] font-medium shadow-sm" 
                  : "text-slate-500 font-light hover:bg-slate-50 hover:text-slate-800"
              }`}
            >
              <div className={`flex items-center ${isCollapsed ? "" : "gap-3.5"}`}>
                <Icon
                  className={`text-[1.35rem] drop-shadow-sm transition-transform group-hover:scale-110 ${isActive ? "text-[#3DC029]" : item.iconColor || "text-slate-400 group-hover:text-slate-600"}`}
                />
                {!isCollapsed ? (
                  <span className="text-[0.95rem] tracking-wide">{item.name}</span>
                ) : null}
              </div>

              {!isCollapsed && item.badge && (
                <span className="rounded-full bg-[#E5F5FF] px-2.5 py-1 text-[0.7rem] font-medium text-[#28A4ED] shrink-0 border border-[#bce3fc]">
                  {item.badge}
                </span>
              )}
            </Link>
          );
        })}
      </nav>

      <button
        type="button"
        onClick={onToggle}
        aria-label={isCollapsed ? "ขยายเมนู" : "ย่อเมนู"}
        className="absolute bottom-4 left-1/2 z-50 grid h-8 w-8 -translate-x-1/2 place-items-center rounded-xl border border-slate-200 bg-white text-slate-500 shadow-sm hover:bg-slate-50 hover:text-slate-700"
      >
        {isCollapsed ? (
          <HiChevronDoubleRight className="text-base" />
        ) : (
          <HiChevronDoubleLeft className="text-base" />
        )}
      </button>
    </aside>
  );
}
