import { NextResponse } from "next/server";
import { z } from "zod";
import { createSupabaseServerClient } from "@/lib/supabase/server";

const Query = z.object({
  sn: z.string().min(1),
  days: z.coerce.number().int().min(1).max(90).default(14),
});

export async function GET(req: Request) {
  const supabase = createSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "unauthorized" }, { status: 401 });

  const url = new URL(req.url);
  const parsed = Query.safeParse({
    sn: url.searchParams.get("sn"),
    days: url.searchParams.get("days") ?? undefined,
  });
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  const { data: device } = await supabase
    .from("devices")
    .select("id")
    .eq("sn", parsed.data.sn)
    .single();
  if (!device) return NextResponse.json({ error: "device not found" }, { status: 404 });

  const since = new Date(
    Date.now() - parsed.data.days * 24 * 60 * 60 * 1000
  ).toISOString();

  const { data, error } = await supabase
    .from("readings")
    .select("id, blood_sugar, trend, measured_at")
    .eq("device_id", device.id)
    .gte("measured_at", since)
    .order("measured_at", { ascending: true });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ readings: data });
}
