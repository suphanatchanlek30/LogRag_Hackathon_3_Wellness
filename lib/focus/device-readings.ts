import type { DeviceReadingPayload } from "@/lib/backend/focus-types";

type DeviceReadingApiResponse = {
  ok: boolean;
  error?: string;
};

export async function postDeviceReading(payload: DeviceReadingPayload) {
  const response = await fetch("/api/device/readings", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });

  const json = (await response.json()) as DeviceReadingApiResponse;
  if (!response.ok || !json.ok) {
    throw new Error(json.error ?? "POST /api/device/readings failed");
  }
}

