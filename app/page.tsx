"use client";

import { useState } from "react";

export default function Home() {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setResult(null);

    const formData = new FormData(e.currentTarget);

    const payload = {
      gender: formData.get("gender"),
      birthDate: formData.get("birthDate"),
      birthTime: formData.get("birthTime"),
      birthplace: formData.get("birthplace"),
      recentEvent: formData.get("recentEvent"),
      question: formData.get("question"),
      name: formData.get("name"),
    };

    try {
      const res = await fetch("/api/fortune", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) throw new Error("请求失败，请稍后再试");

      const data = await res.json();
      setResult(data.analysisText);
    } catch (err: any) {
      setError(err.message || "服务器错误");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="min-h-screen bg-slate-950 text-slate-50 flex items-center justify-center p-4">
      <div className="w-full max-w-2xl bg-slate-900/70 rounded-2xl shadow-xl p-6 space-y-4">
        <h1 className="text-2xl font-bold text-center">命理大师 · 八字测算</h1>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm mb-1">性别</label>
            <div className="flex gap-6">
              <label className="flex items-center gap-2">
                <input type="radio" name="gender" value="male" defaultChecked />
                男
              </label>
              <label className="flex items-center gap-2">
                <input type="radio" name="gender" value="female" />
                女
              </label>
            </div>
          </div>

          <div>
            <label className="block text-sm mb-1">出生日期</label>
            <input
              type="date"
              name="birthDate"
              required
              className="w-full rounded-lg bg-slate-800 border border-slate-700 px-3 py-2"
            />
          </div>

          <div>
            <label className="block text-sm mb-1">出生时间（几点几分）</label>
            <input
              type="time"
              name="birthTime"
              required
              className="w-full rounded-lg bg-slate-800 border border-slate-700 px-3 py-2"
            />
          </div>

          <div>
            <label className="block text-sm mb-1">出生地</label>
            <input
              name="birthplace"
              placeholder="如：北京 / Shanghai / London"
              required
              className="w-full rounded-lg bg-slate-800 border border-slate-700 px-3 py-2"
            />
          </div>

          <div>
            <label className="block text-sm mb-1">你最近在意的一件事</label>
            <textarea
              name="recentEvent"
              required
              className="w-full rounded-lg bg-slate-800 border border-slate-700 px-3 py-2 min-h-[80px]"
            />
          </div>

          <div>
            <label className="block text-sm mb-1">你想知道什么（选填）</label>
            <textarea
              name="question"
              className="w-full rounded-lg bg-slate-800 border border-slate-700 px-3 py-2 min-h-[60px]"
            />
          </div>

          <div>
            <label className="block text-sm mb-1">姓名</label>
            <input
              name="name"
              required
              placeholder="请填写你的名字"
              className="w-full rounded-lg bg-slate-800 border border-slate-700 px-3 py-2"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-emerald-500 hover:bg-emerald-400 rounded-lg py-2 font-semibold disabled:opacity-70"
          >
            {loading ? "正在推演..." : "开始测算"}
          </button>
        </form>

        {error && (
          <div className="text-red-400 text-sm border border-red-500/50 rounded p-3">
            {error}
          </div>
        )}

        {result && (
          <div className="mt-4 bg-slate-900/80 border border-emerald-400/40 rounded-xl p-4 whitespace-pre-line text-sm">
            {result}
          </div>
        )}
      </div>
    </main>
  );
}
