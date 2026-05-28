"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { HiHome, HiOutlineShoppingBag, HiOutlineClipboardCheck, HiOutlineCog } from "react-icons/hi";
import { MdAutoGraph } from "react-icons/md";

export default function BottomNav() {
  const pathname = usePathname();

  // ไม่แสดง NavBar ในหน้าแรก (หน้าเลือกโซน)
  if (pathname === "/") return null;

  const navItems = [
    { name: "แดชบอร์ด", href: "/main", icon: MdAutoGraph },
    { name: "โซนบก", href: "/land", icon: HiOutlineShoppingBag },
    { name: "ภารกิจ", href: "/quests", icon: HiOutlineClipboardCheck },
    { name: "ตั้งค่า", href: "/settings", icon: HiOutlineCog },
  ];

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 mx-auto w-full max-w-[420px] bg-white rounded-t-[30px] border-t-[1.5px] border-x-[1.5px] border-slate-200 shadow-sm pb-[env(safe-area-inset-bottom)] md:hidden">
      <nav className="flex items-center justify-around px-2 py-3">
        {navItems.map((item) => {
          const isActive = pathname === item.href;
          const Icon = item.icon;
          return (
            <Link
              key={item.name}
              href={item.href}
              className="flex w-16 flex-col items-center gap-1 transition-transform active:scale-95"
            >
              <Icon
                className={`text-[1.65rem] ${
                  isActive ? "text-[#3da321]" : "text-slate-400"
                }`}
              />
              <span
                className={`text-[0.7rem] font-medium ${
                  isActive ? "text-[#3da321]" : "text-slate-500"
                }`}
              >
                {item.name}
              </span>
            </Link>
          );
        })}
      </nav>
    </div>
  );
}
