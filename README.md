# LogRag (My Hack 3)

โปรเจกต์เว็บดูแลเพื่อนน้อย พัฒนาด้วย Next.js (App Router)  
ตอนนี้มีทั้งฝั่ง UI และ API backend ที่เชื่อม Supabase สำหรับทดสอบได้แล้ว

## สิ่งที่มีในตอนนี้

- หน้าเลือกโซน `/`
- หน้าโซนบก `/land`
- หน้าแดชบอร์ด `/main`
  - ปุ่ม Focus Timer (mock lock screen)
  - กล่องเทส API (`/api/hello`, `/api/focus-sessions`)
- API backend (Next Route Handlers)
  - `GET /api/hello`
  - `GET /api/focus-sessions`
  - `POST /api/focus-sessions`

## Tech Stack

- Next.js 16 (App Router)
- React 19 + TypeScript
- Tailwind CSS v4
- Supabase (`@supabase/supabase-js`)

## โครงสร้างหลัก

```txt
app/
  api/
    hello/route.ts
    focus-sessions/route.ts
  main/page.tsx
  land/page.tsx
  page.tsx

components/
  focus/
    focus-lock-panel.tsx      # UI โหมดโฟกัส + countdown
    focus-api-test-panel.tsx  # UI ปุ่มเทส API
  sidebar/sidebar.tsx
  navbar/bottom-nav.tsx

lib/
  focus/
    types.ts                  # type กลางของ focus session
    api.ts                    # helper เรียก API จาก frontend
  supabase/
    client.ts                 # supabase client ฝั่ง browser
    server.ts                 # supabase client ฝั่ง server
```

## ตั้งค่า Environment

สร้าง/แก้ไฟล์ `.env.local`

```env
NEXT_PUBLIC_SUPABASE_URL=https://YOUR_PROJECT_REF.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=YOUR_SUPABASE_ANON_KEY
SUPABASE_SERVICE_ROLE_KEY=YOUR_SUPABASE_SERVICE_ROLE_KEY
```

หมายเหตุ:
- `SUPABASE_SERVICE_ROLE_KEY` ใช้เฉพาะฝั่ง server เท่านั้น
- เปลี่ยนค่าแล้วต้อง restart `npm run dev`

## เริ่มใช้งาน

1. ติดตั้งแพ็กเกจ
```bash
npm install
```

2. รันโปรเจกต์
```bash
npm run dev
```

3. เปิดเว็บ
- `http://localhost:3000`

## วิธีเทสระบบ (แนะนำ)

1. เปิด `http://localhost:3000/api/hello`  
ต้องเห็น JSON ตอบกลับ `ok: true`

2. เปิด `http://localhost:3000/main`

3. ในกล่อง `Supabase API Test`:
- กด `Test /api/hello`
- กด `Create Session`
- กด `Fetch Sessions`

4. ไป Supabase Table Editor ตรวจตาราง `focus_sessions`  
ต้องมีข้อมูลใหม่ถูกสร้าง

## Supabase Setup เพิ่มเติม

ดูเอกสารละเอียดที่:
- [SUPABASE_SETUP.md](/mnt/c/My_Projects_Hack3/my_hack_3/SUPABASE_SETUP.md)

ไฟล์นี้มีขั้นตอน Database, Auth, Storage, Realtime, Edge Functions ครบ

## Scripts

- `npm run dev` เริ่มโหมดพัฒนา
- `npm run build` build production
- `npm run start` รัน production
- `npm run lint` ตรวจ lint

## หมายเหตุ

- โปรเจกต์นี้ใช้ Next.js รุ่นใหม่ ควรอิง docs ใน `node_modules/next/dist/docs/` ก่อนแก้โค้ดโครงสร้างใหญ่
- เมนูบางส่วนใน sidebar ยังเป็น placeholder และถูกปิดการคลิกไว้
