import FocusLockPanel from "@/components/focus/focus-lock-panel";
import FocusApiTestPanel from "@/components/focus/focus-api-test-panel";

export default function MainPage() {
  return (
    <section className="relative min-h-screen bg-white px-2 py-4 sm:px-4 sm:py-6">
      <FocusLockPanel />
      <h1 className="text-2xl font-medium tracking-tight text-slate-800">Dashboard</h1>
      <p className="mt-2 max-w-2xl text-base font-normal text-slate-600">
        หน้า mock สำหรับทดสอบโหมด Focus: กดปุ่มมุมขวาบนเพื่อเริ่มนับถอยหลังและล็อกหน้าจอ
      </p>
      <FocusApiTestPanel />
    </section>
  );
}
