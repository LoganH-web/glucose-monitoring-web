export interface ReadingRow {
  blood_sugar: number;
  measured_at: string | Date;
}

export interface ReadingStats {
  count: number;
  mean: number;
  sd: number;
  min: number;
  max: number;
  tirPct: number;        // time-in-range 3.9–10.0 mmol/L
  hypoCount: number;     // < 3.9
  hyperCount: number;    // > 10.0
  last24hMean: number | null;
  rangeStart: string;
  rangeEnd: string;
}

const TIR_LOW = 3.9;
const TIR_HIGH = 10.0;

export function computeStats(readings: ReadingRow[]): ReadingStats {
  if (readings.length === 0) {
    const now = new Date().toISOString();
    return {
      count: 0, mean: 0, sd: 0, min: 0, max: 0,
      tirPct: 0, hypoCount: 0, hyperCount: 0,
      last24hMean: null, rangeStart: now, rangeEnd: now,
    };
  }

  const values = readings.map((r) => Number(r.blood_sugar));
  const times = readings.map((r) =>
    typeof r.measured_at === "string" ? new Date(r.measured_at) : r.measured_at
  );

  const sum = values.reduce((a, b) => a + b, 0);
  const mean = sum / values.length;
  const variance =
    values.reduce((acc, v) => acc + (v - mean) ** 2, 0) / values.length;
  const sd = Math.sqrt(variance);

  const inRange = values.filter((v) => v >= TIR_LOW && v <= TIR_HIGH).length;
  const hypoCount = values.filter((v) => v < TIR_LOW).length;
  const hyperCount = values.filter((v) => v > TIR_HIGH).length;

  const cutoff = Date.now() - 24 * 60 * 60 * 1000;
  const last24h = readings
    .filter((r, i) => times[i].getTime() >= cutoff)
    .map((r) => Number(r.blood_sugar));
  const last24hMean =
    last24h.length > 0
      ? last24h.reduce((a, b) => a + b, 0) / last24h.length
      : null;

  const sortedTimes = [...times].sort((a, b) => a.getTime() - b.getTime());

  return {
    count: values.length,
    mean: round2(mean),
    sd: round2(sd),
    min: Math.min(...values),
    max: Math.max(...values),
    tirPct: round2((inRange / values.length) * 100),
    hypoCount,
    hyperCount,
    last24hMean: last24hMean === null ? null : round2(last24hMean),
    rangeStart: sortedTimes[0].toISOString(),
    rangeEnd: sortedTimes[sortedTimes.length - 1].toISOString(),
  };
}

function round2(n: number): number {
  return Math.round(n * 100) / 100;
}

/**
 * Downsample to ~`targetPoints` rows for sending to the LLM without blowing context.
 * Keeps the chronological shape while bounding token cost.
 */
export function downsample<T>(rows: T[], targetPoints: number): T[] {
  if (rows.length <= targetPoints) return rows;
  const step = rows.length / targetPoints;
  const out: T[] = [];
  for (let i = 0; i < targetPoints; i++) {
    out.push(rows[Math.floor(i * step)]);
  }
  return out;
}
