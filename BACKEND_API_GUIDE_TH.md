# Backend API Guide (ภาษาไทย)

เอกสารนี้สำหรับ backend เท่านั้น: Supabase + Next API

## 1) สิ่งที่ต้องทำใน Supabase

1. เข้า `SQL Editor`
2. ถ้าเคยสร้างตาราง `focus_sessions` แบบเก่าแล้ว ให้รัน
   - [supabase/sql/000_reset_focus_backend.sql](/mnt/c/My_Projects_Hack3/my_hack_3/supabase/sql/000_reset_focus_backend.sql)
3. จากนั้นรัน
   - [supabase/sql/001_focus_backend.sql](/mnt/c/My_Projects_Hack3/my_hack_3/supabase/sql/001_focus_backend.sql)

เมื่อรันเสร็จ จะได้:
- ตาราง `devices`, `focus_sessions`, `sensor_readings`, `emotion_predictions`, `focus_cycles`, `daily_focus_summary`
- enum/check/index ครบ
- function `refresh_daily_focus_summary(...)`

## 2) ตั้งค่า ENV

แก้ `.env.local`

```env
NEXT_PUBLIC_SUPABASE_URL=...
SUPABASE_SERVICE_ROLE_KEY=...
NEXT_PUBLIC_SUPABASE_ANON_KEY=...
```

## 3) Seed device 1 ตัว (ต้องทำก่อนยิงจาก Arduino)

รันใน SQL Editor:

```sql
insert into public.devices (user_id, device_name, device_code, device_type, is_active)
values (
  '11111111-1111-1111-1111-111111111111',
  'Focus Tomato',
  'ARDUINO-001',
  'arduino',
  true
)
on conflict (device_code) do update
set is_active = excluded.is_active;
```

> `user_id` นี้คือตัวอย่างสำหรับเทส สามารถเปลี่ยนได้

## 4) Run server

```bash
npm install
npm run dev
```

## 5) API ที่มีให้ใช้งาน

- `POST /api/device/readings`
- `POST /api/focus-sessions/start`
- `PATCH /api/focus-sessions/:sessionId/end`
- `POST /api/focus-cycles/start`
- `PATCH /api/focus-cycles/:cycleId/end`
- `GET /api/dashboard/today?user_id=...&date=YYYY-MM-DD`
- `GET /api/dashboard/history?user_id=...`
- `GET /api/sessions/today?user_id=...&date=YYYY-MM-DD`
- `GET /api/readings?user_id=...&date=YYYY-MM-DD`
- `GET /api/emotions?user_id=...&date=YYYY-MM-DD`

## 6) วิธีเทสเร็วสุด (curl)

### 6.1 Arduino ส่ง reading

```bash
curl -X POST http://localhost:3000/api/device/readings \
  -H "Content-Type: application/json" \
  -d '{
    "device_code":"ARDUINO-001",
    "recorded_at":"2026-05-28T08:30:00+07:00",
    "focus":{"score":72,"state":"focus","probability":0.82,"distraction_probability":0.18,"confidence":0.91,"model_version":"focus-v1.0"},
    "emotion":{"valence":0.12,"arousal":0.05,"label":"normal","confidence":0.88,"model_version":"emotion-v1.0"},
    "sensors":{"heart_rate":82,"motion_level":0.34,"accel_x":0.03,"accel_y":0.98,"accel_z":0.11,"gyro_x":0.12,"gyro_y":-0.04,"gyro_z":0.21,"pressure_level":0.42,"touch_count":3}
  }'
```

### 6.2 ดู dashboard วันนี้

```bash
curl "http://localhost:3000/api/dashboard/today?user_id=11111111-1111-1111-1111-111111111111&date=2026-05-28"
```

### 6.3 ดู raw readings

```bash
curl "http://localhost:3000/api/readings?user_id=11111111-1111-1111-1111-111111111111&date=2026-05-28"
```

## 7) หมายเหตุการทำงานอัตโนมัติ

เมื่อ `POST /api/device/readings` สำเร็จ backend จะ:
1. หา device จาก `device_code`
2. หา/สร้าง `focus_session` ของวันนั้น
3. insert `sensor_readings`
4. insert `emotion_predictions`
5. เรียก `refresh_daily_focus_summary(...)` อัปเดตสรุปรายวันอัตโนมัติ
