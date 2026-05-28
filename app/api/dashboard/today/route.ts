import { getSupabaseServerClient } from "@/lib/supabase/server";
import { fail, ok, toErrorMessage } from "@/lib/backend/http";
import { formatSecondsHuman } from "@/lib/backend/focus-helpers";

export async function GET(request: Request) {
  try {
    const supabase = getSupabaseServerClient();
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get("user_id");
    const date = searchParams.get("date") ?? new Date().toISOString().slice(0, 10);

    if (!userId) return fail("user_id is required", 400);

    const [{ data: summary, error: summaryError }, { data: points, error: pointsError }] =
      await Promise.all([
        supabase
          .from("daily_focus_summary")
          .select("*")
          .eq("user_id", userId)
          .eq("summary_date", date)
          .maybeSingle(),
        supabase
          .from("sensor_readings")
          .select("recorded_at,focus_score,focus_state")
          .eq("user_id", userId)
          .gte("recorded_at", `${date}T00:00:00.000Z`)
          .lte("recorded_at", `${date}T23:59:59.999Z`)
          .order("recorded_at", { ascending: true }),
      ]);

    if (summaryError) return fail(summaryError.message, 500);
    if (pointsError) return fail(pointsError.message, 500);

    const cyclesResult = await supabase
      .from("focus_cycles")
      .select("phase,planned_duration_minutes,cycle_no")
      .eq("user_id", userId)
      .gte("started_at", `${date}T00:00:00.000Z`)
      .lte("started_at", `${date}T23:59:59.999Z`)
      .order("started_at", { ascending: true })
      .limit(20);
    if (cyclesResult.error) return fail(cyclesResult.error.message, 500);

    const latestEmotionResult = await supabase
      .from("emotion_predictions")
      .select("emotion_label,valence,arousal,confidence")
      .eq("user_id", userId)
      .gte("recorded_at", `${date}T00:00:00.000Z`)
      .lte("recorded_at", `${date}T23:59:59.999Z`)
      .order("recorded_at", { ascending: false })
      .limit(1)
      .maybeSingle();
    if (latestEmotionResult.error) return fail(latestEmotionResult.error.message, 500);

    const emotion = latestEmotionResult.data;
    const focusSeconds = summary?.total_focus_seconds ?? 0;
    const breakSeconds = summary?.total_break_seconds ?? 0;
    const focusGoalSeconds = summary?.focus_goal_seconds ?? 10800;

    return ok({
      date,
      top_summary: {
        today_focus_score: summary?.latest_focus_score ?? summary?.avg_focus_score ?? 0,
        focus_score_max: 100,
      },
      focus_score_chart: {
        avg_focus_score: summary?.avg_focus_score ?? 0,
        points: (points ?? []).map((point) => ({
          time: new Date(point.recorded_at).toLocaleTimeString("th-TH", {
            hour: "2-digit",
            minute: "2-digit",
          }),
          focus_score: point.focus_score,
          state: point.focus_state,
        })),
      },
      cycle_summary: {
        completed_cycles: summary?.total_cycles ?? 0,
        recommended_cycles: summary?.cycle_goal ?? 4,
        phases: (cyclesResult.data ?? []).map((cycle) => ({
          phase: cycle.phase,
          label:
            cycle.phase === "focus"
              ? "Focus"
              : cycle.phase === "short_break"
              ? "Short Break"
              : "Long Rest",
          duration_minutes: cycle.planned_duration_minutes,
          cycle_no: cycle.cycle_no,
        })),
      },
      emotion_state: {
        label: emotion?.emotion_label ?? summary?.latest_emotion_label ?? "normal",
        valence: emotion?.valence ?? summary?.latest_valence ?? 0,
        arousal: emotion?.arousal ?? summary?.latest_arousal ?? 0,
        confidence: emotion?.confidence ?? null,
      },
      cards: {
        sessions_today: { value: summary?.sessions_count ?? 0, unit: "รอบ" },
        focus_time: {
          seconds: focusSeconds,
          display: formatSecondsHuman(focusSeconds),
          goal_seconds: focusGoalSeconds,
          progress_percent: Math.min(100, Math.round((focusSeconds / focusGoalSeconds) * 100)),
        },
        break_time: {
          seconds: breakSeconds,
          display: formatSecondsHuman(breakSeconds),
          status_text: breakSeconds <= 3600 ? "เหมาะสม" : "พักนานเกินไป",
        },
        current_state: {
          label: emotion?.emotion_label ?? summary?.latest_emotion_label ?? "normal",
          status_text: "ติดตามต่อเนื่อง",
        },
      },
    });
  } catch (error) {
    return fail(toErrorMessage(error), 500);
  }
}
