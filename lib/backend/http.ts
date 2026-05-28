import { NextResponse } from "next/server";

export function ok<T>(data: T, status = 200) {
  return NextResponse.json({ ok: true, data }, { status });
}

export function fail(error: string, status = 400) {
  return NextResponse.json({ ok: false, error }, { status });
}

export function toErrorMessage(error: unknown) {
  return error instanceof Error ? error.message : "Unknown error";
}
