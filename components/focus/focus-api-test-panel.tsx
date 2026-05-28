"use client";

import { useState } from "react";
import {
  createFocusSession,
  getHelloApiMessage,
  listFocusSessions,
} from "@/lib/focus/api";
import type { FocusSession } from "@/lib/focus/types";

export default function FocusApiTestPanel() {
  const [helloResult, setHelloResult] = useState<string>("-");
  const [loading, setLoading] = useState(false);
  const [sessions, setSessions] = useState<FocusSession[]>([]);
  const [error, setError] = useState<string>("");

  async function testHelloApi() {
    setError("");
    setLoading(true);
    try {
      const message = await getHelloApiMessage();
      setHelloResult(message);
    } catch {
      setError("เรียก /api/hello ไม่สำเร็จ");
    } finally {
      setLoading(false);
    }
  }

  async function createSession() {
    setError("");
    setLoading(true);
    try {
      await createFocusSession({
        user_id: "demo-user-001",
        duration_sec: 1500,
        source: "manual",
        status: "active",
      });
      await fetchSessions();
    } catch (err) {
      setError(err instanceof Error ? err.message : "สร้างข้อมูลไม่สำเร็จ");
    } finally {
      setLoading(false);
    }
  }

  async function fetchSessions() {
    setError("");
    setLoading(true);
    try {
      const data = await listFocusSessions();
      setSessions(data ?? []);
    } catch (err) {
      setError(err instanceof Error ? err.message : "ดึงข้อมูลไม่สำเร็จ");
    } finally {
      setLoading(false);
    }
  }

  return (
    <section className="mt-6 rounded-2xl border border-slate-200 bg-white p-4 sm:p-5">
      <h2 className="text-lg font-medium text-slate-800">Supabase API Test</h2>
      <p className="mt-1 text-sm text-slate-500">
        เทสทั้ง API ปกติของ Next และ API ที่เชื่อม Supabase
      </p>

      <div className="mt-4 flex flex-wrap gap-2">
        <button
          type="button"
          onClick={testHelloApi}
          className="rounded-lg bg-slate-900 px-3 py-2 text-sm text-white hover:bg-slate-700"
        >
          Test /api/hello
        </button>
        <button
          type="button"
          onClick={createSession}
          className="rounded-lg bg-emerald-500 px-3 py-2 text-sm text-white hover:bg-emerald-600"
        >
          Create Session
        </button>
        <button
          type="button"
          onClick={fetchSessions}
          className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700 hover:bg-slate-50"
        >
          Fetch Sessions
        </button>
      </div>

      <div className="mt-4 space-y-2 text-sm">
        <p>
          <span className="font-medium text-slate-700">Hello API:</span>{" "}
          <span className="text-slate-600">{helloResult}</span>
        </p>
        {loading ? <p className="text-slate-500">Loading...</p> : null}
        {error ? <p className="text-rose-600">{error}</p> : null}
      </div>

      <div className="mt-4 overflow-x-auto rounded-xl border border-slate-200">
        <table className="min-w-full text-left text-sm">
          <thead className="bg-slate-50 text-slate-600">
            <tr>
              <th className="px-3 py-2 font-medium">user_id</th>
              <th className="px-3 py-2 font-medium">duration</th>
              <th className="px-3 py-2 font-medium">source</th>
              <th className="px-3 py-2 font-medium">status</th>
              <th className="px-3 py-2 font-medium">created_at</th>
            </tr>
          </thead>
          <tbody>
            {sessions.map((item) => (
              <tr key={item.id} className="border-t border-slate-100 text-slate-700">
                <td className="px-3 py-2">{item.user_id}</td>
                <td className="px-3 py-2">{item.duration_sec}s</td>
                <td className="px-3 py-2">{item.source}</td>
                <td className="px-3 py-2">{item.status}</td>
                <td className="px-3 py-2">{new Date(item.created_at).toLocaleString()}</td>
              </tr>
            ))}
            {sessions.length === 0 ? (
              <tr>
                <td className="px-3 py-3 text-slate-500" colSpan={5}>
                  ยังไม่มีข้อมูล
                </td>
              </tr>
            ) : null}
          </tbody>
        </table>
      </div>
    </section>
  );
}
