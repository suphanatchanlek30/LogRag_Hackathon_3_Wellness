export type FocusSource = "manual" | "device";
export type FocusStatus = "active" | "completed" | "cancelled";

export type FocusSession = {
  id: string;
  user_id: string;
  duration_sec: number;
  source: FocusSource;
  status: FocusStatus;
  created_at: string;
};

export type CreateFocusSessionInput = {
  user_id: string;
  duration_sec: number;
  source?: FocusSource;
  status?: FocusStatus;
};
