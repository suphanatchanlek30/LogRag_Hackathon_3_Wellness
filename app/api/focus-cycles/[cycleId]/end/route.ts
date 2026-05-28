import { getSupabaseServerClient } from "@/lib/supabase/server";
import { fail, ok, toErrorMessage } from "@/lib/backend/http";
import { parseCycleEndBody } from "@/lib/backend/focus-helpers";

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ cycleId: string }> }
) {
  try {
    const { cycleId } = await params;
    const body = parseCycleEndBody(await request.json());
    const supabase = getSupabaseServerClient();

    const { data: cycle, error: cycleError } = await supabase
      .from("focus_cycles")
      .select("id,user_id,session_id")
      .eq("id", cycleId)
      .maybeSingle();
    if (cycleError) return fail(cycleError.message, 500);
    if (!cycle) return fail("cycle not found", 404);

    const { error: updateError } = await supabase
      .from("focus_cycles")
      .update({
        ended_at: body.ended_at,
        actual_duration_seconds: body.actual_duration_seconds,
        completion_status: body.completion_status,
      })
      .eq("id", cycleId);
    if (updateError) return fail(updateError.message, 500);

    const { data: allCycles, error: cyclesError } = await supabase
      .from("focus_cycles")
      .select("phase,actual_duration_seconds,completion_status")
      .eq("session_id", cycle.session_id);
    if (cyclesError) return fail(cyclesError.message, 500);

    const totalFocusSeconds = allCycles
      .filter((item) => item.phase === "focus" && item.completion_status === "completed")
      .reduce((acc, cur) => acc + (cur.actual_duration_seconds ?? 0), 0);
    const totalBreakSeconds = allCycles
      .filter(
        (item) =>
          (item.phase === "short_break" || item.phase === "long_rest") &&
          item.completion_status === "completed"
      )
      .reduce((acc, cur) => acc + (cur.actual_duration_seconds ?? 0), 0);
    const totalCycles = allCycles.filter(
      (item) => item.phase === "focus" && item.completion_status === "completed"
    ).length;

    const { error: updateSessionError } = await supabase
      .from("focus_sessions")
      .update({
        total_focus_seconds: totalFocusSeconds,
        total_break_seconds: totalBreakSeconds,
        total_cycles: totalCycles,
      })
      .eq("id", cycle.session_id);
    if (updateSessionError) return fail(updateSessionError.message, 500);

    return ok({ message: "จบ cycle สำเร็จ", cycle_id: cycleId });
  } catch (error) {
    return fail(toErrorMessage(error), 500);
  }
}
