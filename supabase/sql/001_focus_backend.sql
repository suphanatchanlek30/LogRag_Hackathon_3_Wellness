-- LogRag Focus Backend Schema
-- Run this file in Supabase SQL Editor once.

create extension if not exists "pgcrypto";

-- Enums
do $$ begin
  create type focus_state_enum as enum ('focus', 'short_break', 'long_rest', 'idle');
exception when duplicate_object then null; end $$;

do $$ begin
  create type focus_phase_enum as enum ('focus', 'short_break', 'long_rest');
exception when duplicate_object then null; end $$;

do $$ begin
  create type emotion_label_enum as enum ('happy', 'relaxed', 'bored', 'stressed', 'normal');
exception when duplicate_object then null; end $$;

do $$ begin
  create type session_status_enum as enum ('active', 'completed', 'cancelled');
exception when duplicate_object then null; end $$;

do $$ begin
  create type cycle_completion_enum as enum ('active', 'completed', 'skipped', 'interrupted');
exception when duplicate_object then null; end $$;

-- Shared trigger function
create or replace function set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

-- 1) devices
create table if not exists public.devices (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null,
  device_name text not null,
  device_code text unique not null,
  device_type text not null default 'arduino',
  firmware_version text,
  model_version text,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

drop trigger if exists trg_devices_updated_at on public.devices;
create trigger trg_devices_updated_at
before update on public.devices
for each row execute function set_updated_at();

-- 2) focus_sessions
create table if not exists public.focus_sessions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null,
  device_id uuid references public.devices(id),
  session_date date not null default current_date,
  started_at timestamptz not null,
  ended_at timestamptz,
  status session_status_enum not null default 'active',
  total_focus_seconds int not null default 0,
  total_break_seconds int not null default 0,
  total_cycles int not null default 0,
  avg_focus_score numeric(5,2),
  max_focus_score int,
  min_focus_score int,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

drop trigger if exists trg_focus_sessions_updated_at on public.focus_sessions;
create trigger trg_focus_sessions_updated_at
before update on public.focus_sessions
for each row execute function set_updated_at();

-- 3) sensor_readings
create table if not exists public.sensor_readings (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null,
  device_id uuid references public.devices(id),
  session_id uuid references public.focus_sessions(id),
  recorded_at timestamptz not null,
  focus_score int not null check (focus_score between 0 and 100),
  focus_state focus_state_enum not null,
  heart_rate int,
  motion_level numeric(6,3),
  accel_x numeric(8,4),
  accel_y numeric(8,4),
  accel_z numeric(8,4),
  gyro_x numeric(8,4),
  gyro_y numeric(8,4),
  gyro_z numeric(8,4),
  pressure_level numeric(6,3),
  touch_count int,
  focus_probability numeric(5,4),
  distraction_probability numeric(5,4),
  model_confidence numeric(5,4),
  model_version text,
  raw_payload jsonb,
  created_at timestamptz not null default now()
);

-- 4) emotion_predictions
create table if not exists public.emotion_predictions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null,
  device_id uuid references public.devices(id),
  session_id uuid references public.focus_sessions(id),
  reading_id uuid references public.sensor_readings(id),
  recorded_at timestamptz not null,
  valence numeric(5,3) not null check (valence >= -1 and valence <= 1),
  arousal numeric(5,3) not null check (arousal >= -1 and arousal <= 1),
  emotion_label emotion_label_enum not null,
  confidence numeric(5,4),
  model_version text,
  created_at timestamptz not null default now()
);

-- 5) focus_cycles
create table if not exists public.focus_cycles (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null,
  device_id uuid references public.devices(id),
  session_id uuid references public.focus_sessions(id),
  cycle_no int not null,
  phase focus_phase_enum not null,
  planned_duration_minutes int not null,
  actual_duration_seconds int not null default 0,
  started_at timestamptz not null,
  ended_at timestamptz,
  avg_focus_score numeric(5,2),
  completion_status cycle_completion_enum not null default 'active',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

drop trigger if exists trg_focus_cycles_updated_at on public.focus_cycles;
create trigger trg_focus_cycles_updated_at
before update on public.focus_cycles
for each row execute function set_updated_at();

-- 6) daily_focus_summary
create table if not exists public.daily_focus_summary (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null,
  summary_date date not null,
  sessions_count int not null default 0,
  total_focus_seconds int not null default 0,
  total_break_seconds int not null default 0,
  total_cycles int not null default 0,
  avg_focus_score numeric(5,2),
  best_focus_score int,
  latest_focus_score int,
  latest_emotion_label emotion_label_enum,
  latest_valence numeric(5,3),
  latest_arousal numeric(5,3),
  focus_goal_seconds int not null default 10800,
  cycle_goal int not null default 4,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique(user_id, summary_date)
);

drop trigger if exists trg_daily_focus_summary_updated_at on public.daily_focus_summary;
create trigger trg_daily_focus_summary_updated_at
before update on public.daily_focus_summary
for each row execute function set_updated_at();

-- Indexes for dashboard queries
create index if not exists idx_devices_user_id on public.devices(user_id);
create index if not exists idx_focus_sessions_user_date on public.focus_sessions(user_id, session_date);
create index if not exists idx_focus_sessions_device_status on public.focus_sessions(device_id, status);
create index if not exists idx_sensor_readings_user_recorded_at on public.sensor_readings(user_id, recorded_at);
create index if not exists idx_sensor_readings_session_id on public.sensor_readings(session_id);
create index if not exists idx_emotion_user_recorded_at on public.emotion_predictions(user_id, recorded_at);
create index if not exists idx_focus_cycles_user_started_at on public.focus_cycles(user_id, started_at);

-- RLS (keep strict for app usage; service role bypasses policies)
alter table public.devices enable row level security;
alter table public.focus_sessions enable row level security;
alter table public.sensor_readings enable row level security;
alter table public.emotion_predictions enable row level security;
alter table public.focus_cycles enable row level security;
alter table public.daily_focus_summary enable row level security;

-- Summary refresh function
create or replace function public.refresh_daily_focus_summary(
  p_user_id uuid,
  p_summary_date date
) returns void
language plpgsql
as $$
declare
  v_sessions_count int := 0;
  v_total_focus int := 0;
  v_total_break int := 0;
  v_total_cycles int := 0;
  v_avg_score numeric(5,2);
  v_best_score int;
  v_latest_score int;
  v_latest_label emotion_label_enum;
  v_latest_valence numeric(5,3);
  v_latest_arousal numeric(5,3);
begin
  select
    coalesce(count(*), 0),
    coalesce(sum(total_focus_seconds), 0),
    coalesce(sum(total_break_seconds), 0),
    coalesce(sum(total_cycles), 0)
  into v_sessions_count, v_total_focus, v_total_break, v_total_cycles
  from public.focus_sessions
  where user_id = p_user_id and session_date = p_summary_date;

  select
    round(avg(focus_score)::numeric, 2),
    max(focus_score),
    (
      select sr.focus_score
      from public.sensor_readings sr
      where sr.user_id = p_user_id and sr.recorded_at::date = p_summary_date
      order by sr.recorded_at desc
      limit 1
    )
  into v_avg_score, v_best_score, v_latest_score
  from public.sensor_readings
  where user_id = p_user_id and recorded_at::date = p_summary_date;

  select
    ep.emotion_label,
    ep.valence,
    ep.arousal
  into v_latest_label, v_latest_valence, v_latest_arousal
  from public.emotion_predictions ep
  where ep.user_id = p_user_id and ep.recorded_at::date = p_summary_date
  order by ep.recorded_at desc
  limit 1;

  insert into public.daily_focus_summary (
    user_id, summary_date,
    sessions_count, total_focus_seconds, total_break_seconds, total_cycles,
    avg_focus_score, best_focus_score, latest_focus_score,
    latest_emotion_label, latest_valence, latest_arousal
  )
  values (
    p_user_id, p_summary_date,
    v_sessions_count, v_total_focus, v_total_break, v_total_cycles,
    v_avg_score, v_best_score, v_latest_score,
    v_latest_label, v_latest_valence, v_latest_arousal
  )
  on conflict (user_id, summary_date)
  do update set
    sessions_count = excluded.sessions_count,
    total_focus_seconds = excluded.total_focus_seconds,
    total_break_seconds = excluded.total_break_seconds,
    total_cycles = excluded.total_cycles,
    avg_focus_score = excluded.avg_focus_score,
    best_focus_score = excluded.best_focus_score,
    latest_focus_score = excluded.latest_focus_score,
    latest_emotion_label = excluded.latest_emotion_label,
    latest_valence = excluded.latest_valence,
    latest_arousal = excluded.latest_arousal,
    updated_at = now();
end;
$$;
