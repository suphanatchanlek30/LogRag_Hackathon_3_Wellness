import { getSupabaseServerClient } from "@/lib/supabase/server";
import { fail, ok, toErrorMessage } from "@/lib/backend/http";
import { parseCycleStartBody } from "@/lib/backend/focus-helpers";

export async function POST(request: Request) {
  try {
    const body = parseCycleStartBody(await request.json());
    const supabase = getSupabaseServerClient();

    const { data: device, error: deviceError } = await supabase
      .from("devices")
      .select("id,user_id,is_active")
      .eq("device_code", body.device_code)
      .maybeSingle();
    if (deviceError) return fail(deviceError.message, 500);
    if (!device || !device.is_active) return fail("device not found or inactive", 404);

    const { data: session, error: sessionError } = await supabase
      .from("focus_sessions")
      .select("id")
      .eq("id", body.session_id)
      .eq("user_id", device.user_id)
      .maybeSingle();
    if (sessionError) return fail(sessionError.message, 500);
    if (!session) return fail("session not found", 404);

    const { data, error } = await supabase
      .from("focus_cycles")
      .insert({
        user_id: device.user_id,
        device_id: device.id,
        session_id: body.session_id,
        cycle_no: body.cycle_no,
        phase: body.phase,
        planned_duration_minutes: body.planned_duration_minutes,
        started_at: body.started_at,
        completion_status: "active",
      })
      .select("id")
      .single();
    if (error) return fail(error.message, 500);

    return ok({ message: "เริ่ม cycle สำเร็จ", cycle_id: data.id }, 201);
  } catch (error) {
    return fail(toErrorMessage(error), 500);
  }
}
