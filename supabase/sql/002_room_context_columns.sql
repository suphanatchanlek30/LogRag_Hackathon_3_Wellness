-- Add Nano 33 room context columns to existing focus backend tables.
-- Run this once in Supabase SQL Editor if 001_focus_backend.sql was already applied.

alter table public.sensor_readings
  add column if not exists room_connected boolean,
  add column if not exists room_source text,
  add column if not exists room_updated_at timestamptz,
  add column if not exists noise_level numeric(6,2),
  add column if not exists light_lux numeric(8,2),
  add column if not exists brightness numeric(5,4),
  add column if not exists noise_state text,
  add column if not exists light_state text,
  add column if not exists room_score int,
  add column if not exists room_state text,
  add column if not exists room_recommendation text;

do $$
begin
  if not exists (
    select 1
    from pg_constraint
    where conname = 'sensor_readings_room_score_range'
  ) then
    alter table public.sensor_readings
      add constraint sensor_readings_room_score_range
      check (room_score is null or (room_score >= 0 and room_score <= 100));
  end if;
end $$;

create index if not exists idx_sensor_readings_room_state
on public.sensor_readings(room_state);
