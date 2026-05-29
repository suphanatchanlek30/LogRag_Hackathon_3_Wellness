import { getSupabaseServerClient } from "@/lib/supabase/server";
import { fail, ok, toErrorMessage } from "@/lib/backend/http";
import { parseDeviceReadingPayload } from "@/lib/backend/focus-helpers";

export async function POST(request: Request) {
  try {
    const payload = parseDeviceReadingPayload(await request.json());
    const supabase = getSupabaseServerClient();

    const { data: device, error: deviceError } = await supabase
      .from("devices")
      .select("id,user_id,is_active")
      .eq("device_code", payload.device_code)
      .maybeSingle();
    if (deviceError) return fail(deviceError.message, 500);
    if (!device || !device.is_active) return fail("device not found or inactive", 404);

    const sessionDate = payload.recorded_at.slice(0, 10);
    const { data: activeSession, error: sessionFindError } = await supabase
      .from("focus_sessions")
      .select("id")
      .eq("user_id", device.user_id)
      .eq("device_id", device.id)
      .eq("session_date", sessionDate)
      .eq("status", "active")
      .order("started_at", { ascending: false })
      .limit(1)
      .maybeSingle();
    if (sessionFindError) return fail(sessionFindError.message, 500);

    let sessionId = activeSession?.id as string | undefined;
    if (!sessionId) {
      const { data: createdSession, error: createSessionError } = await supabase
        .from("focus_sessions")
        .insert({
          user_id: device.user_id,
          device_id: device.id,
          session_date: sessionDate,
          started_at: payload.recorded_at,
          status: "active",
        })
        .select("id")
        .single();
      if (createSessionError) return fail(createSessionError.message, 500);
      sessionId = createdSession.id;
    }

    const { data: reading, error: readingError } = await supabase
      .from("sensor_readings")
      .insert({
        user_id: device.user_id,
        device_id: device.id,
        session_id: sessionId,
        recorded_at: payload.recorded_at,
        focus_score: payload.focus.score,
        focus_state: payload.focus.state,
        heart_rate: payload.sensors?.heart_rate,
        motion_level: payload.sensors?.motion_level,
        accel_x: payload.sensors?.accel_x,
        accel_y: payload.sensors?.accel_y,
        accel_z: payload.sensors?.accel_z,
        gyro_x: payload.sensors?.gyro_x,
        gyro_y: payload.sensors?.gyro_y,
        gyro_z: payload.sensors?.gyro_z,
        pressure_level: payload.sensors?.pressure_level,
        touch_count: payload.sensors?.touch_count,
        room_connected: payload.room?.connected,
        room_source: payload.room?.source,
        room_updated_at: payload.room?.updated_at,
        noise_level: payload.room?.noise_level ?? payload.sensors?.noise_level,
        light_lux: payload.room?.light_lux ?? payload.sensors?.light_lux,
        brightness: payload.room?.brightness ?? payload.sensors?.brightness,
        noise_state: payload.room?.noise_state,
        light_state: payload.room?.light_state,
        room_score: payload.room?.room_score,
        room_state: payload.room?.room_state,
        room_recommendation: payload.room?.recommendation,
        focus_probability: payload.focus.probability,
        distraction_probability: payload.focus.distraction_probability,
        model_confidence: payload.focus.confidence,
        model_version: payload.focus.model_version,
        raw_payload: payload,
      })
      .select("id")
      .single();
    if (readingError) return fail(readingError.message, 500);

    const { error: emotionError } = await supabase.from("emotion_predictions").insert({
      user_id: device.user_id,
      device_id: device.id,
      session_id: sessionId,
      reading_id: reading.id,
      recorded_at: payload.recorded_at,
      valence: payload.emotion.valence,
      arousal: payload.emotion.arousal,
      emotion_label: payload.emotion.label,
      confidence: payload.emotion.confidence,
      model_version: payload.emotion.model_version,
    });
    if (emotionError) return fail(emotionError.message, 500);

    // Keep summary table up to date for fast dashboard loading.
    const { error: summaryError } = await supabase.rpc("refresh_daily_focus_summary", {
      p_user_id: device.user_id,
      p_summary_date: sessionDate,
    });
    if (summaryError) return fail(summaryError.message, 500);

    return ok(
      {
        message: "บันทึกข้อมูลสำเร็จ",
        reading_id: reading.id,
        session_id: sessionId,
        dashboard_updated: true,
      },
      201
    );
  } catch (error) {
    return fail(toErrorMessage(error), 500);
  }
}
