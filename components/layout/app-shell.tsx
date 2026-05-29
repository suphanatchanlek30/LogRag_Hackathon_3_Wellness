"use client";

import { useEffect, useState } from "react";
import BottomNav from "@/components/navbar/bottom-nav";
import Sidebar from "@/components/sidebar/sidebar";
import MainWrapper from "@/components/layout/main-wrapper";

export default function AppShell({ children }: { children: React.ReactNode }) {
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(() => {
    if (typeof window === "undefined") return false;
    return window.localStorage.getItem("sidebar-collapsed") === "1";
  });

  useEffect(() => {
    window.localStorage.setItem("sidebar-collapsed", isSidebarCollapsed ? "1" : "0");
  }, [isSidebarCollapsed]);

  return (
    <>
      <Sidebar
        isCollapsed={isSidebarCollapsed}
        onToggle={() => setIsSidebarCollapsed((prev) => !prev)}
      />
      <MainWrapper isSidebarCollapsed={isSidebarCollapsed}>{children}</MainWrapper>
      <BottomNav />
    </>
  );
}
