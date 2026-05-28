import type { CreateFocusSessionInput, FocusSession } from "@/lib/focus/types";

type ApiOk<T> = { ok: true; data: T };
type ApiErr = { ok: false; error: string };

async function parseJson(response: Response) {
  const json = (await response.json()) as ApiOk<unknown> | ApiErr;
  if (!response.ok || !json.ok) {
    const message = "error" in json ? json.error : "Request failed";
    throw new Error(message);
  }
  return json;
}

export async function getHelloApiMessage() {
  const response = await fetch("/api/hello", { method: "GET" });
  const json = (await response.json()) as { message?: string; at?: string };
  return `${json.message ?? "Hello"} (${json.at ?? "-"})`;
}

export async function createFocusSession(input: CreateFocusSessionInput) {
  const response = await fetch("/api/focus-sessions", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(input),
  });
  const json = await parseJson(response);
  return json.data as FocusSession;
}

export async function listFocusSessions() {
  const response = await fetch("/api/focus-sessions", { method: "GET" });
  const json = await parseJson(response);
  return json.data as FocusSession[];
}
