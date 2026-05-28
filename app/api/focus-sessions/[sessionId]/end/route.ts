import { getSupabaseServerClient } from "@/lib/supabase/server";
import { fail, ok, toErrorMessage } from "@/lib/backend/http";
import { parseSessionEndBody, secondsBetween } from "@/lib/backend/focus-helpers";

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ sessionId: string }> }
) {
  try {
    const { sessionId } = await params;
    const body = parseSessionEndBody(await request.json());
    const supabase = getSupabaseServerClient();

    const { data: session, error: findError } = await supabase
      .from("focus_sessions")
      .select("id,user_id,session_date,started_at")
      .eq("id", sessionId)
      .maybeSingle();
    if (findError) return fail(findError.message, 500);
    if (!session) return fail("session not found", 404);

    const totalSessionSeconds = secondsBetween(session.started_at, body.ended_at);
    const { error: updateError } = await supabase
      .from("focus_sessions")
      .update({
        ended_at: body.ended_at,
        status: body.status,
      })
      .eq("id", sessionId);
    if (updateError) return fail(updateError.message, 500);

    // Refresh daily summary after session close.
    const { error: summaryError } = await supabase.rpc("refresh_daily_focus_summary", {
      p_user_id: session.user_id,
      p_summary_date: session.session_date,
    });
    if (summaryError) return fail(summaryError.message, 500);

    return ok({
      message: "จบ session สำเร็จ",
      session_id: sessionId,
      elapsed_seconds: totalSessionSeconds,
    });
  } catch (error) {
    return fail(toErrorMessage(error), 500);
  }
}
