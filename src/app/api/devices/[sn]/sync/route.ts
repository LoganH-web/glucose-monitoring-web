import { NextResponse } from "next/server";
import {
  createSupabaseServerClient,
  createSupabaseServiceClient,
} from "@/lib/supabase/server";
import { syncAll } from "@/lib/eaglenos/client";

export async function POST(
  _req: Request,
  { params }: { params: { sn: string } }
) {
  const supabase = createSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "unauthorized" }, { status: 401 });

  const sn = decodeURIComponent(params.sn).trim();

  const { data: device, error: devErr } = await supabase
    .from("devices")
    .select("id, sn")
    .eq("sn", sn)
    .single();
  if (devErr || !device) {
    return NextResponse.json({ error: "device not found" }, { status: 404 });
  }

  // Cursor: highest eaglenos_id we've already stored.
  const { data: maxRow } = await supabase
    .from("readings")
    .select("eaglenos_id")
    .eq("device_id", device.id)
    .order("eaglenos_id", { ascending: false })
    .limit(1)
    .maybeSingle();
  const startingMaxId = maxRow?.eaglenos_id ?? 0;

  // Use the user's stable Eaglenos UUID issued at signup.
  let eaglenosUuid = user.user_metadata?.eaglenos_uuid as string | undefined;
  if (!eaglenosUuid) {
    eaglenosUuid = crypto.randomUUID();
    await supabase.auth.updateUser({
      data: { ...user.user_metadata, eaglenos_uuid: eaglenosUuid },
    });
  }

  let result;
  try {
    result = await syncAll(sn, startingMaxId, { uuid: eaglenosUuid });
  } catch (e) {
    const msg = e instanceof Error ? e.message : "sync failed";
    return NextResponse.json({ error: msg }, { status: 502 });
  }

  if (result.readings.length === 0) {
    return NextResponse.json({
      inserted: 0,
      pagesFetched: result.pagesFetched,
      deviceInfo: result.deviceInfo ?? null,
    });
  }

  // Service client bypasses RLS for the bulk insert. The device_id is already
  // scoped to this user by the lookup above.
  const admin = createSupabaseServiceClient();
  const rows = result.readings.map((r) => ({
    device_id: device.id,
    eaglenos_id: r.id,
    blood_sugar: r.blood_sugar,
    trend: r.trend,
    measured_at: new Date(r.create_time * 1000).toISOString(),
  }));

  const { error: insErr, count } = await admin
    .from("readings")
    .upsert(rows, { onConflict: "device_id,eaglenos_id", ignoreDuplicates: true, count: "exact" });

  if (insErr) {
    return NextResponse.json({ error: insErr.message }, { status: 500 });
  }

  return NextResponse.json({
    inserted: count ?? rows.length,
    pagesFetched: result.pagesFetched,
    deviceInfo: result.deviceInfo ?? null,
  });
}
