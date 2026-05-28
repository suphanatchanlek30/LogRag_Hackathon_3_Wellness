import { getSupabaseServerClient } from "@/lib/supabase/server";
import { fail, ok, toErrorMessage } from "@/lib/backend/http";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get("user_id");
    const date = searchParams.get("date") ?? new Date().toISOString().slice(0, 10);
    if (!userId) return fail("user_id is required", 400);

    const supabase = getSupabaseServerClient();
    const { data, error } = await supabase
      .from("emotion_predictions")
      .select("*")
      .eq("user_id", userId)
      .gte("recorded_at", `${date}T00:00:00.000Z`)
      .lte("recorded_at", `${date}T23:59:59.999Z`)
      .order("recorded_at", { ascending: true });
    if (error) return fail(error.message, 500);
    return ok({ date, emotions: data ?? [] });
  } catch (error) {
    return fail(toErrorMessage(error), 500);
  }
}
