export const FOCUS_STATES = ["focus", "short_break", "long_rest", "idle"] as const;
export const FOCUS_PHASES = ["focus", "short_break", "long_rest"] as const;
export const EMOTION_LABELS = ["happy", "relaxed", "bored", "stressed", "normal"] as const;
export const SESSION_STATUSES = ["active", "completed", "cancelled"] as const;
export const CYCLE_COMPLETION_STATUSES = [
  "active",
  "completed",
  "skipped",
  "interrupted",
] as const;

export type FocusState = (typeof FOCUS_STATES)[number];
export type FocusPhase = (typeof FOCUS_PHASES)[number];
export type EmotionLabel = (typeof EMOTION_LABELS)[number];
export type SessionStatus = (typeof SESSION_STATUSES)[number];
export type CycleCompletionStatus = (typeof CYCLE_COMPLETION_STATUSES)[number];

export type DeviceReadingPayload = {
  device_code: string;
  recorded_at: string;
  focus: {
    score: number;
    state: FocusState;
    probability?: number;
    distraction_probability?: number;
    confidence?: number;
    model_version?: string;
  };
  emotion: {
    valence: number;
    arousal: number;
    label: EmotionLabel;
    confidence?: number;
    model_version?: string;
  };
  sensors?: {
    heart_rate?: number;
    motion_level?: number;
    accel_x?: number;
    accel_y?: number;
    accel_z?: number;
    gyro_x?: number;
    gyro_y?: number;
    gyro_z?: number;
    pressure_level?: number;
    touch_count?: number;
    noise_level?: number;
    light_lux?: number;
    brightness?: number;
  };
  room?: {
    source?: string;
    connected?: boolean;
    updated_at?: string;
    noise_level?: number;
    light_lux?: number;
    brightness?: number;
    noise_state?: string;
    light_state?: string;
    room_score?: number;
    room_state?: string;
    recommendation?: string;
  };
};
