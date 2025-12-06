import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

export const runtime = "edge";            // Cloudflare Pages 推荐
export const dynamic = "force-dynamic";   // 防止构建阶段执行 API 代码

export async function POST(req: NextRequest) {
  try {
    // 1) 读取环境变量（仅在运行时，而不是构建时）
    const BAZI_API_URL = process.env.BAZI_API_URL;
    const SUPABASE_URL = process.env.SUPABASE_URL;
    const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
    const LLM_API_KEY = process.env.LLM_API_KEY;
    const LLM_API_BASE = process.env.LLM_API_BASE || "https://api.openai.com/v1";

    // ⚠️ 构建阶段/缺少环境变量时返回（避免构建报错）
    if (!BAZI_API_URL || !SUPABASE_URL || !SUPABASE_SERVICE_KEY || !LLM_API_KEY) {
      return NextResponse.json(
        { error: "Environment variables not loaded (build skip)" },
        { status: 500 }
      );
    }

    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

    // 2) 获取 Body
    const body = await req.json();
    const {
      gender,
      birthDate,
      birthTime,
      birthplace,
      recentEvent,
      question,
      name,
    } = body;

    // 3) 校验输入
    if (!gender || !birthDate || !birthTime || !birthplace || !recentEvent || !name) {
      return NextResponse.json({ error: "缺少必填字段" }, { status: 400 });
    }

    const datetime_local = `${birthDate} ${birthTime}`;

    // 4) 调用 BaZi API
    const baziRes = await fetch(BAZI_API_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        datetime_local,
        gender,
        birthplace,
        zi_split: "late",
      }),
    });

    if (!baziRes.ok) {
      return NextResponse.json({ error: "八字服务调用失败" }, { status: 500 });
    }

    const baziData = await baziRes.json();
    const { year_pillar, month_pillar, day_pillar, hour_pillar, meta } = baziData;

    // 5) 调用 LLM（DeepSeek / OpenAI）
    const systemPrompt = `
你是一个专业的命理分析师。
请根据用户提供的八字、发生的事件、及其疑问，
生成真实、有逻辑、有洞察力的命理分析。
务必有：分析 → 解释 → 建议。
`;

    const userPrompt = `
性别：${gender}
八字：${year_pillar}${month_pillar}${day_pillar}${hour_pillar}
最近发生的事情：${recentEvent}
用户的问题：${question || "未特别指定"}
`;

    const llmRes = await fetch(`${LLM_API_BASE}/chat/completions`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LLM_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "deepseek-chat",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt },
        ],
      }),
    });

    if (!llmRes.ok) {
      return NextResponse.json({ error: "命理分析生成失败" }, { status: 500 });
    }

    const llmJson = await llmRes.json();
    const analysisText = llmJson.choices?.[0]?.message?.content || "";

    // 6) 写入 Supabase
    const { error } = await supabase.from("fortune_logs").insert({
      name,
      gender,
      birth_date: birthDate,
      birth_time: birthTime,
      birthplace,
      recent_event: recentEvent,
      question,
      year_pillar,
      month_pillar,
      day_pillar,
      hour_pillar,
      analysis_text: analysisText,
      bazi_meta: meta,
    });

    if (error) {
      console.error("Supabase insert error:", error);
    }

    // 7) 返回结果
    return NextResponse.json({ analysisText });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "服务器内部错误" }, { status: 500 });
  }
}
