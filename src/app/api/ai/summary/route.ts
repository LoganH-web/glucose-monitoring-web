import { NextResponse } from "next/server";
import { z } from "zod";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { geminiClient, geminiModelName } from "@/lib/gemini/client";
import { buildPrompt, type PromptKey } from "@/lib/gemini/prompts";
import { computeStats, downsample } from "@/lib/readings/stats";
import { fetchReadingsSince } from "@/lib/readings/query";

const Body = z.object({
  device_id: z.string().uuid(),
  prompt_key: z.enum(["how_so_far", "how_to_improve"]),
  days: z.number().int().min(1).max(90).default(14),
});

const SERIES_POINTS = 80;

export async function POST(req: Request) {
  const supabase = createSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "unauthorized" }, { status: 401 });

  const parsed = Body.safeParse(await req.json());
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }
  const { device_id, prompt_key, days } = parsed.data;

  const { data: device } = await supabase
    .from("devices")
    .select("id")
    .eq("id", device_id)
    .single();
  if (!device) return NextResponse.json({ error: "device not found" }, { status: 404 });

  const since = new Date(Date.now() - days * 24 * 60 * 60 * 1000).toISOString();
  const { readings, error: readingsError } = await fetchReadingsSince(
    supabase,
    device.id,
    since
  );
  if (readingsError) return NextResponse.json({ error: readingsError }, { status: 500 });
  if (readings.length === 0) {
    return NextResponse.json(
      { error: "No readings yet. Sync the device first." },
      { status: 400 }
    );
  }

  const stats = computeStats(readings);
  const series = downsample(readings, SERIES_POINTS);
  const prompt = buildPrompt(prompt_key as PromptKey, { stats, series });

  let responseText: string;
  try {
    const model = geminiClient().getGenerativeModel({ model: geminiModelName() });
    const result = await model.generateContent(prompt);
    responseText = result.response.text();
  } catch (e) {
    const msg = e instanceof Error ? e.message : "gemini call failed";
    return NextResponse.json({ error: msg }, { status: 502 });
  }

  await supabase.from("ai_summaries").insert({
    user_id: user.id,
    device_id: device.id,
    prompt_key,
    range_start: stats.rangeStart,
    range_end: stats.rangeEnd,
    response_md: responseText,
  });

  return NextResponse.json({ markdown: responseText, stats });
}
