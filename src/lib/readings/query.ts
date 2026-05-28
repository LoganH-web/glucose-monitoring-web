import type { createSupabaseServerClient } from "@/lib/supabase/server";

const READINGS_BATCH_SIZE = 1000;
const MAX_READINGS_PER_WINDOW = 10000;

export interface ReadingRecord {
  id: number;
  blood_sugar: number;
  trend: number | null;
  measured_at: string;
}

type ServerSupabaseClient = ReturnType<typeof createSupabaseServerClient>;

export async function fetchReadingsSince(
  supabase: ServerSupabaseClient,
  deviceId: string,
  since: string
): Promise<{ readings: ReadingRecord[]; error: string | null }> {
  const readings: ReadingRecord[] = [];

  for (
    let from = 0;
    from < MAX_READINGS_PER_WINDOW;
    from += READINGS_BATCH_SIZE
  ) {
    const to = Math.min(from + READINGS_BATCH_SIZE - 1, MAX_READINGS_PER_WINDOW - 1);
    const { data, error } = await supabase
      .from("readings")
      .select("id, blood_sugar, trend, measured_at")
      .eq("device_id", deviceId)
      .gte("measured_at", since)
      .order("measured_at", { ascending: true })
      .range(from, to);

    if (error) return { readings, error: error.message };

    const batch = (data ?? []) as ReadingRecord[];
    readings.push(...batch);

    if (batch.length < READINGS_BATCH_SIZE) break;
  }

  return { readings, error: null };
}
