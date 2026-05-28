import { NextRequest, NextResponse } from "next/server";
import { getSupabaseServerClient } from "@/lib/supabase/server";
import type { FocusStatus, FocusSource } from "@/lib/focus/types";

type FocusSessionInsert = {
  user_id: string;
  duration_sec: number;
  source: FocusSource;
  status: FocusStatus;
};

export async function GET() {
  try {
    // อ่านล่าสุด 20 รายการไว้ใช้แสดง dashboard
    const supabase = getSupabaseServerClient();
    const { data, error } = await supabase
      .from("focus_sessions")
      .select("id,user_id,duration_sec,source,status,created_at")
      .order("created_at", { ascending: false })
      .limit(20);

    if (error) {
      return NextResponse.json({ ok: false, error: error.message }, { status: 500 });
    }

    return NextResponse.json({ ok: true, data });
  } catch (error) {
    return NextResponse.json(
      { ok: false, error: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = (await request.json()) as Partial<FocusSessionInsert>;

    if (!body.user_id || !body.duration_sec) {
      return NextResponse.json(
        { ok: false, error: "user_id and duration_sec are required" },
        { status: 400 }
      );
    }

    const supabase = getSupabaseServerClient();
    // ใส่ค่า default ให้ request ที่ส่งมาไม่ครบ
    const payload: FocusSessionInsert = {
      user_id: body.user_id,
      duration_sec: body.duration_sec,
      source: body.source ?? "manual",
      status: body.status ?? "active",
    };

    const { data, error } = await supabase
      .from("focus_sessions")
      .insert(payload)
      .select("id,user_id,duration_sec,source,status,created_at")
      .single();

    if (error) {
      return NextResponse.json({ ok: false, error: error.message }, { status: 500 });
    }

    return NextResponse.json({ ok: true, data }, { status: 201 });
  } catch (error) {
    return NextResponse.json(
      { ok: false, error: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 }
    );
  }
}
