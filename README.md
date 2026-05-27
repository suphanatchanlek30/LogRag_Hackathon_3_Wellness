# ดูแลเพื่อนน้อย (My Hack 3)

เว็บแอปแนวเกมเลี้ยงเพื่อนน้อย (Virtual Pet) สร้างด้วย Next.js App Router
ผู้เล่นสามารถเลือกโซน, เก็บแครอท, ให้อาหารน้องกระต่าย และติดตามการเติบโตตามจำนวนวันที่ดูแลต่อเนื่อง

## Tech Stack

- Next.js `16.2.6` (App Router)
- React `19.2.4`
- TypeScript
- Tailwind CSS `v4`
- React Icons

## Features หลัก

- หน้า Landing สำหรับเลือกโซนการเล่น
- โซนบก (`/land`) พร้อมระบบ:
  - เก็บแครอทแบบขั้น (`carrot1 -> carrot6 -> +1 แครอท`)
  - ให้อาหารน้องกระต่ายเพื่อลดแครอทและเพิ่มพลังงาน
  - เปลี่ยน mood ของน้องตามสถานะ (ปกติ/สดใส/หิว/ตื่นเต้น)
  - ระบบการเติบโตตามวัน (1, 7, 30, 90 วัน)
  - ปลดล็อกรางวัลการเติบโต (บ้าน, ชุด, Secret)
- Responsive navigation:
  - `Sidebar` สำหรับ desktop
  - `BottomNav` สำหรับ mobile

## Route ที่มีในปัจจุบัน

- `/` หน้าเลือกโซน (Landing)
- `/land` โซนบก (ฟีเจอร์หลัก)
- `/main` หน้า placeholder (ยังไม่ได้เชื่อมฟีเจอร์จริง)

หมายเหตุ: เมนูบางรายการใน Navbar/Sidebar (`/quests`, `/settings`, `/bag`, `/growth`) ยังไม่มีหน้าจริงใน `app/` และจะได้ 404 จนกว่าจะสร้าง route เหล่านี้

## โครงสร้างโปรเจกต์

```txt
app/
  layout.tsx            # Root layout + Sidebar + MainWrapper + BottomNav
  page.tsx              # หน้าแรก
  land/page.tsx         # หน้าโซนบก (เกมหลัก)
  main/page.tsx         # หน้า main (placeholder)
  globals.css           # Global styles + keyframes

components/
  home-componenets/
    home-page.tsx       # Landing UI + video split zone
  layout/
    main-wrapper.tsx    # จัดระยะเมื่อมี Sidebar
  navbar/
    bottom-nav.tsx      # Mobile bottom navigation
  sidebar/
    sidebar.tsx         # Desktop sidebar

public/mainpage/
  image/                # sprite และภาพประกอบ
  video/                # วิดีโอพื้นหลัง
```

## การเริ่มต้นใช้งาน

ติดตั้ง dependencies:

```bash
npm install
```

รันโหมดพัฒนา:

```bash
npm run dev
```

เปิดที่:

- http://localhost:3000

## Scripts

- `npm run dev` รัน development server
- `npm run build` สร้าง production build
- `npm run start` รัน production server
- `npm run lint` ตรวจ lint

## หมายเหตุสำหรับผู้พัฒนา

โปรเจกต์นี้ใช้ Next.js เวอร์ชันใหม่ที่มี breaking changes
ก่อนแก้โค้ดที่เกี่ยวกับโครงสร้างหรือ API ของ Next.js ควรอ้างอิงเอกสารใน:

- `node_modules/next/dist/docs/`

## แนวทางพัฒนาต่อ

- เพิ่ม route ที่ยังขาด (`/quests`, `/settings`, `/bag`, `/growth`)
- แยก state เกมออกจาก component เดียวไปเป็น store/hook
- persist progress ของผู้เล่น (localStorage หรือ backend)
- เพิ่มระบบโซนน้ำให้ใช้งานได้จริง
- เพิ่ม test สำหรับ logic การเติบโตและการคำนวณรางวัล
