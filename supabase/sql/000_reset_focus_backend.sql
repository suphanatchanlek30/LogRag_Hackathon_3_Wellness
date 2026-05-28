-- Optional reset script for old prototype schema
-- Run this BEFORE 001_focus_backend.sql if you already created old tables.

drop table if exists public.emotion_predictions cascade;
drop table if exists public.sensor_readings cascade;
drop table if exists public.focus_cycles cascade;
drop table if exists public.daily_focus_summary cascade;
drop table if exists public.focus_sessions cascade;
drop table if exists public.devices cascade;

drop type if exists focus_state_enum cascade;
drop type if exists focus_phase_enum cascade;
drop type if exists emotion_label_enum cascade;
drop type if exists session_status_enum cascade;
drop type if exists cycle_completion_enum cascade;
