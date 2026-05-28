# Supabase Setup (LogRag)

เอกสารนี้ครอบคลุม:
- Database
- Authentication
- Storage
- Edge Functions
- Realtime
- API ทดสอบ (Next.js backend + frontend)

## 1) เตรียมค่า ENV

แก้ไฟล์ `.env.local` ให้ใส่ค่าจริงจาก Supabase:
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` หรือ `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`

สำคัญ:
- `SUPABASE_SERVICE_ROLE_KEY` ใช้เฉพาะฝั่ง server (`app/api/*`)
- ถ้าใช้ `DATABASE_URL` และรหัสผ่านมี `# @ !` ต้อง URL-encode

## 2) Database (SQL)

ไปที่ Supabase SQL Editor แล้วรัน:

```sql
create extension if not exists "pgcrypto";

create table if not exists public.focus_sessions (
  id uuid primary key default gen_random_uuid(),
  user_id text not null,
  duration_sec integer not null check (duration_sec > 0),
  source text not null check (source in ('manual', 'device')),
  status text not null default 'active' check (status in ('active', 'completed', 'cancelled')),
  created_at timestamptz not null default now()
);

alter table public.focus_sessions enable row level security;

drop policy if exists "read focus sessions" on public.focus_sessions;
create policy "read focus sessions"
on public.focus_sessions
for select
to authenticated, anon
using (true);

drop policy if exists "insert focus sessions" on public.focus_sessions;
create policy "insert focus sessions"
on public.focus_sessions
for insert
to authenticated, anon
with check (true);
```

## 3) Authentication

ใน Supabase Dashboard:
- Authentication -> Providers -> เปิด `Email`
- ถ้าจะใช้ Social login ค่อยเปิดเพิ่มทีหลัง

หมายเหตุ: โค้ดชุดนี้ยังไม่บังคับ login เพื่อให้เทส API ได้เร็ว

## 4) Storage

Storage -> Create bucket:
- ชื่อ `focus-assets`
- Public: `true` (สำหรับ dev/test)

## 5) Realtime

Database -> Replication:
- เปิด replication ให้ table `focus_sessions`

ถ้าต้องใช้ในหน้า dashboard จริง จะ subscribe จาก `supabase.channel(...)` ได้

## 6) Edge Functions

ตัวอย่าง function: `device-trigger` (เอาไว้รับ event จากอุปกรณ์)

```ts
// supabase/functions/device-trigger/index.ts
import { createClient } from "npm:@supabase/supabase-js@2";

Deno.serve(async (req) => {
  const supabase = createClient(
    Deno.env.get("SUPABASE_URL") ?? "",
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
  );

  const body = await req.json();
  const { user_id, duration_sec } = body;

  const { data, error } = await supabase.from("focus_sessions").insert({
    user_id,
    duration_sec,
    source: "device",
    status: "active",
  }).select("*").single();

  if (error) return new Response(JSON.stringify({ ok: false, error: error.message }), { status: 500 });
  return new Response(JSON.stringify({ ok: true, data }), { status: 200 });
});
```

Deploy (ในเครื่องที่มี Supabase CLI):
- `supabase login`
- `supabase functions deploy device-trigger`

## 7) API ที่ทำไว้ในโปรเจกต์นี้

- `GET /api/hello` -> API ปกติของ Next
- `GET /api/focus-sessions` -> ดึง session จาก Supabase
- `POST /api/focus-sessions` -> สร้าง session ลง Supabase

ไฟล์:
- `app/api/hello/route.ts`
- `app/api/focus-sessions/route.ts`

## 8) Frontend test ที่ทำไว้แล้ว

หน้า `/main` มี panel `Supabase API Test`:
- ปุ่ม `Test /api/hello`
- ปุ่ม `Create Session`
- ปุ่ม `Fetch Sessions`

## 9) วิธีเทส End-to-End

1. ใส่ค่าจริงใน `.env.local`
2. ติดตั้ง package:
   - `npm install`
3. รัน dev server:
   - `npm run dev`
4. เปิด `http://localhost:3000/main`
5. กด `Test /api/hello` ต้องเห็นข้อความ `Hello from Next API`
6. กด `Create Session` แล้ว `Fetch Sessions` ต้องเห็นข้อมูลในตาราง
7. ตรวจซ้ำใน Supabase Table Editor (`focus_sessions`) ว่ามี row ใหม่

## 10) ปัญหาที่เจอบ่อย

- `Missing NEXT_PUBLIC_SUPABASE_URL...`
  - ยังไม่ได้ตั้งค่า env หรือยังไม่ restart server
- `relation "focus_sessions" does not exist`
  - ยังไม่ได้รัน SQL สร้างตาราง
- 401/403 จาก Supabase
  - key ผิด หรือ policy/RLS ยังไม่ถูกต้อง
