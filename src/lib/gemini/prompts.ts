import type { ReadingStats } from "../readings/stats";

export type PromptKey = "how_so_far" | "how_to_improve";

const DISCLAIMER =
  "Note: this is general lifestyle information drawn from the user's recent CGM readings. It is not medical advice. The user should consult a licensed healthcare professional before changing diet, exercise, or medication.";

const SYSTEM_PREFACE = `You are a friendly diabetes-coaching assistant talking to a user who is wearing a continuous glucose monitor.
Be concrete, warm, and brief. Use markdown with short headings and bullet points. Numbers are in mmol/L.
${DISCLAIMER}`;

interface PromptInput {
  stats: ReadingStats;
  series: Array<{ measured_at: string | Date; blood_sugar: number }>;
}

function statsBlock(stats: ReadingStats): string {
  return [
    `Readings analysed: ${stats.count}`,
    `Window: ${stats.rangeStart} → ${stats.rangeEnd}`,
    `Mean: ${stats.mean} mmol/L (SD ${stats.sd})`,
    `Min: ${stats.min}  Max: ${stats.max}`,
    `Time in range 3.9–10.0 mmol/L: ${stats.tirPct}%`,
    `Hypos (<3.9): ${stats.hypoCount}   Hypers (>10.0): ${stats.hyperCount}`,
    `Last 24h mean: ${stats.last24hMean ?? "n/a"}`,
  ].join("\n");
}

function seriesBlock(input: PromptInput): string {
  const rows = input.series
    .map((r) => {
      const t =
        typeof r.measured_at === "string"
          ? r.measured_at
          : r.measured_at.toISOString();
      return `${t}\t${r.blood_sugar}`;
    })
    .join("\n");
  return "time\tblood_sugar_mmol_L\n" + rows;
}

export function buildPrompt(key: PromptKey, input: PromptInput): string {
  const stats = statsBlock(input.stats);
  const series = seriesBlock(input);

  const question =
    key === "how_so_far"
      ? `## Question\nHow's the measurement going so far? Give a quick read on overall control, notable spikes or lows, and any patterns by time of day. Three to five bullet points max.`
      : `## Question\nGiven the recent readings, what are the two or three highest-leverage things the user could try this week to improve their numbers? Be specific (timing of meals, sleep, walking after meals, hydration, etc.). Avoid generic advice.`;

  return `${SYSTEM_PREFACE}

## Summary statistics
${stats}

## Recent readings (downsampled)
${series}

${question}

End your response with a one-line reminder that this is not medical advice.`;
}
