import { getSupabaseServerClient } from "@/lib/supabase/server";
import { fail, ok, toErrorMessage } from "@/lib/backend/http";
import { parseSessionStartBody } from "@/lib/backend/focus-helpers";

export async function POST(request: Request) {
  try {
    const body = parseSessionStartBody(await request.json());
    const supabase = getSupabaseServerClient();

    const { data: device, error: deviceError } = await supabase
      .from("devices")
      .select("id,user_id,is_active")
      .eq("device_code", body.device_code)
      .maybeSingle();
    if (deviceError) return fail(deviceError.message, 500);
    if (!device || !device.is_active) return fail("device not found or inactive", 404);

    const sessionDate = body.started_at.slice(0, 10);
    const { data: existing, error: existingError } = await supabase
      .from("focus_sessions")
      .select("id")
      .eq("user_id", device.user_id)
      .eq("device_id", device.id)
      .eq("session_date", sessionDate)
      .eq("status", "active")
      .maybeSingle();
    if (existingError) return fail(existingError.message, 500);
    if (existing) return ok({ message: "มี session ที่ active อยู่แล้ว", session_id: existing.id });

    const { data, error } = await supabase
      .from("focus_sessions")
      .insert({
        user_id: device.user_id,
        device_id: device.id,
        session_date: sessionDate,
        started_at: body.started_at,
        status: "active",
      })
      .select("id")
      .single();
    if (error) return fail(error.message, 500);

    return ok({ message: "เริ่ม session สำเร็จ", session_id: data.id }, 201);
  } catch (error) {
    return fail(toErrorMessage(error), 500);
  }
}
