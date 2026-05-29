import {
  CYCLE_COMPLETION_STATUSES,
  EMOTION_LABELS,
  FOCUS_PHASES,
  FOCUS_STATES,
  SESSION_STATUSES,
  type DeviceReadingPayload,
  type FocusPhase,
  type SessionStatus,
  type CycleCompletionStatus,
} from "@/lib/backend/focus-types";

export function isIsoDateString(value: unknown) {
  return typeof value === "string" && !Number.isNaN(Date.parse(value));
}

export function ensureEnum<T extends readonly string[]>(
  value: unknown,
  allowed: T,
  name: string
): T[number] {
  if (typeof value !== "string" || !allowed.includes(value)) {
    throw new Error(`${name} is invalid`);
  }
  return value as T[number];
}

export function parseDeviceReadingPayload(input: unknown): DeviceReadingPayload {
  if (!input || typeof input !== "object") throw new Error("payload is required");
  const body = input as Record<string, unknown>;

  if (typeof body.device_code !== "string" || !body.device_code.trim()) {
    throw new Error("device_code is required");
  }
  if (!isIsoDateString(body.recorded_at)) {
    throw new Error("recorded_at must be ISO datetime");
  }

  const focus = body.focus as Record<string, unknown> | undefined;
  if (!focus) throw new Error("focus is required");
  if (typeof focus.score !== "number" || focus.score < 0 || focus.score > 100) {
    throw new Error("focus.score must be 0..100");
  }
  const focusState = ensureEnum(focus.state, FOCUS_STATES, "focus.state");

  const emotion = body.emotion as Record<string, unknown> | undefined;
  if (!emotion) throw new Error("emotion is required");
  if (typeof emotion.valence !== "number" || emotion.valence < -1 || emotion.valence > 1) {
    throw new Error("emotion.valence must be -1..1");
  }
  if (typeof emotion.arousal !== "number" || emotion.arousal < -1 || emotion.arousal > 1) {
    throw new Error("emotion.arousal must be -1..1");
  }
  const emotionLabel = ensureEnum(emotion.label, EMOTION_LABELS, "emotion.label");

  const sensors = (body.sensors as Record<string, unknown> | undefined) ?? {};
  const room = (body.room as Record<string, unknown> | undefined) ?? undefined;

  return {
    device_code: body.device_code as string,
    recorded_at: body.recorded_at as string,
    focus: {
      score: focus.score as number,
      state: focusState,
      probability: toNumberOrUndefined(focus.probability),
      distraction_probability: toNumberOrUndefined(focus.distraction_probability),
      confidence: toNumberOrUndefined(focus.confidence),
      model_version: toStringOrUndefined(focus.model_version),
    },
    emotion: {
      valence: emotion.valence as number,
      arousal: emotion.arousal as number,
      label: emotionLabel,
      confidence: toNumberOrUndefined(emotion.confidence),
      model_version: toStringOrUndefined(emotion.model_version),
    },
    sensors: {
      heart_rate: toNumberOrUndefined(sensors.heart_rate),
      motion_level: toNumberOrUndefined(sensors.motion_level),
      accel_x: toNumberOrUndefined(sensors.accel_x),
      accel_y: toNumberOrUndefined(sensors.accel_y),
      accel_z: toNumberOrUndefined(sensors.accel_z),
      gyro_x: toNumberOrUndefined(sensors.gyro_x),
      gyro_y: toNumberOrUndefined(sensors.gyro_y),
      gyro_z: toNumberOrUndefined(sensors.gyro_z),
      pressure_level: toNumberOrUndefined(sensors.pressure_level),
      touch_count: toNumberOrUndefined(sensors.touch_count),
      noise_level: toNumberOrUndefined(sensors.noise_level),
      light_lux: toNumberOrUndefined(sensors.light_lux),
      brightness: toNumberOrUndefined(sensors.brightness),
    },
    room: room
      ? {
          source: toStringOrUndefined(room.source),
          connected: typeof room.connected === "boolean" ? room.connected : undefined,
          updated_at: toStringOrUndefined(room.updated_at),
          noise_level: toNumberOrUndefined(room.noise_level),
          light_lux: toNumberOrUndefined(room.light_lux),
          brightness: toNumberOrUndefined(room.brightness),
          noise_state: toStringOrUndefined(room.noise_state),
          light_state: toStringOrUndefined(room.light_state),
          room_score: toNumberOrUndefined(room.room_score),
          room_state: toStringOrUndefined(room.room_state),
          recommendation: toStringOrUndefined(room.recommendation),
        }
      : undefined,
  };
}

export function parseSessionStartBody(input: unknown) {
  if (!input || typeof input !== "object") throw new Error("payload is required");
  const body = input as Record<string, unknown>;
  if (typeof body.device_code !== "string" || !body.device_code.trim()) {
    throw new Error("device_code is required");
  }
  if (!isIsoDateString(body.started_at)) throw new Error("started_at must be ISO datetime");
  return { device_code: body.device_code, started_at: body.started_at as string };
}

export function parseSessionEndBody(input: unknown) {
  if (!input || typeof input !== "object") throw new Error("payload is required");
  const body = input as Record<string, unknown>;
  if (!isIsoDateString(body.ended_at)) throw new Error("ended_at must be ISO datetime");
  const status = ensureEnum(body.status, SESSION_STATUSES, "status") as SessionStatus;
  return { ended_at: body.ended_at as string, status };
}

export function parseCycleStartBody(input: unknown) {
  if (!input || typeof input !== "object") throw new Error("payload is required");
  const body = input as Record<string, unknown>;
  if (typeof body.device_code !== "string" || !body.device_code.trim()) {
    throw new Error("device_code is required");
  }
  if (typeof body.session_id !== "string" || !body.session_id.trim()) {
    throw new Error("session_id is required");
  }
  if (typeof body.cycle_no !== "number") throw new Error("cycle_no is required");
  if (typeof body.planned_duration_minutes !== "number") {
    throw new Error("planned_duration_minutes is required");
  }
  if (!isIsoDateString(body.started_at)) throw new Error("started_at must be ISO datetime");

  const phase = ensureEnum(body.phase, FOCUS_PHASES, "phase") as FocusPhase;
  return {
    device_code: body.device_code,
    session_id: body.session_id,
    cycle_no: body.cycle_no as number,
    phase,
    planned_duration_minutes: body.planned_duration_minutes as number,
    started_at: body.started_at as string,
  };
}

export function parseCycleEndBody(input: unknown) {
  if (!input || typeof input !== "object") throw new Error("payload is required");
  const body = input as Record<string, unknown>;
  if (!isIsoDateString(body.ended_at)) throw new Error("ended_at must be ISO datetime");
  if (typeof body.actual_duration_seconds !== "number") {
    throw new Error("actual_duration_seconds is required");
  }
  const completion_status = ensureEnum(
    body.completion_status,
    CYCLE_COMPLETION_STATUSES,
    "completion_status"
  ) as CycleCompletionStatus;
  return {
    ended_at: body.ended_at as string,
    actual_duration_seconds: body.actual_duration_seconds as number,
    completion_status,
  };
}

export function secondsBetween(startedAt: string, endedAt: string) {
  return Math.max(0, Math.floor((Date.parse(endedAt) - Date.parse(startedAt)) / 1000));
}

export function formatSecondsHuman(seconds: number) {
  const hour = Math.floor(seconds / 3600);
  const min = Math.floor((seconds % 3600) / 60);
  if (hour > 0) return `${hour} ชม. ${min.toString().padStart(2, "0")} นาที`;
  return `${min} นาที`;
}

function toNumberOrUndefined(value: unknown) {
  return typeof value === "number" && Number.isFinite(value) ? value : undefined;
}

function toStringOrUndefined(value: unknown) {
  return typeof value === "string" ? value : undefined;
}
