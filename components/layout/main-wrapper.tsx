"use client";

import { usePathname } from "next/navigation";

export default function MainWrapper({
  children,
  isSidebarCollapsed,
}: {
  children: React.ReactNode;
  isSidebarCollapsed: boolean;
}) {
  const pathname = usePathname();

  // หากเป็นหน้าแรก "/" จะไม่เผื่อระยะ Sidebar ทางซ้าย
  // หากเป็นหน้าอื่น (เช่น "/main") จะเผื่อเว้นที่ให้ Sidebar ทางซ้ายมือ (เฉพาะจอ md ขึ้นไป)
  const isHome = pathname === "/";
  const isDashboard = pathname === "/main";

  return (
    <div
      className={`flex min-h-screen w-full transition-all duration-300 ${
        !isHome ? (isSidebarCollapsed ? "md:pl-[88px]" : "md:pl-[280px]") : ""
      }`}
    >
      <main className="flex-1 w-full min-h-screen">
        <div
          className={`mx-auto w-full px-4 sm:px-6 ${
            isDashboard ? "max-w-none py-4 lg:px-5" : "max-w-[1200px] py-6 lg:px-8"
          }`}
        >
          {children}
        </div>
      </main>
    </div>
  );
}
