import { getSupabaseServerClient } from "@/lib/supabase/server";
import { fail, ok, toErrorMessage } from "@/lib/backend/http";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get("user_id");
    if (!userId) return fail("user_id is required", 400);

    const supabase = getSupabaseServerClient();
    const { data, error } = await supabase
      .from("daily_focus_summary")
      .select("*")
      .eq("user_id", userId)
      .order("summary_date", { ascending: false })
      .limit(30);
    if (error) return fail(error.message, 500);
    return ok({ items: data ?? [] });
  } catch (error) {
    return fail(toErrorMessage(error), 500);
  }
}
