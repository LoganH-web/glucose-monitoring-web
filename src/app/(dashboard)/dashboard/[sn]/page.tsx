import { notFound } from "next/navigation";
import Link from "next/link";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { ReadingsChart } from "@/components/ReadingsChart";
import { ReadingsTable } from "@/components/ReadingsTable";
import { AiInsights } from "@/components/AiInsights";
import { SyncButton } from "@/components/SyncButton";
import { computeStats } from "@/lib/readings/stats";

const RANGE_DAYS = 14;

export default async function DevicePage({
  params,
}: {
  params: { sn: string };
}) {
  const supabase = createSupabaseServerClient();
  const sn = decodeURIComponent(params.sn);

  const { data: device } = await supabase
    .from("devices")
    .select("id, sn, label, linked_at")
    .eq("sn", sn)
    .maybeSingle();

  if (!device) notFound();

  const since = new Date(Date.now() - RANGE_DAYS * 24 * 60 * 60 * 1000).toISOString();
  const { data: readings } = await supabase
    .from("readings")
    .select("id, blood_sugar, trend, measured_at")
    .eq("device_id", device.id)
    .gte("measured_at", since)
    .order("measured_at", { ascending: true });

  const rows = readings ?? [];
  const stats = computeStats(rows);

  return (
    <div className="space-y-8">
      <header className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <Link href="/dashboard" className="text-sm text-brand-700 hover:underline">
            ← All devices
          </Link>
          <h1 className="mt-1 text-2xl font-semibold">
            {device.label || device.sn}
          </h1>
          <p className="text-sm text-slate-500">SN: {device.sn}</p>
        </div>
        <SyncButton sn={device.sn} />
      </header>

      <section className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <Stat label="Readings (14d)" value={stats.count.toString()} />
        <Stat label="Mean mmol/L" value={stats.count ? stats.mean.toString() : "—"} />
        <Stat label="Time in range" value={stats.count ? `${stats.tirPct}%` : "—"} />
        <Stat
          label="Hypo / Hyper"
          value={stats.count ? `${stats.hypoCount} / ${stats.hyperCount}` : "—"}
        />
      </section>

      <section className="rounded-lg border bg-white p-5">
        <h2 className="font-medium">Last {RANGE_DAYS} days</h2>
        {rows.length === 0 ? (
          <p className="mt-3 text-sm text-slate-500">
            No readings yet. Click <strong>Sync now</strong> to pull from Eaglenos.
          </p>
        ) : (
          <div className="mt-3">
            <ReadingsChart data={rows} />
          </div>
        )}
      </section>

      <section className="rounded-lg border bg-white p-5">
        <h2 className="font-medium">AI insights</h2>
        <AiInsights deviceId={device.id} disabled={rows.length === 0} />
      </section>

      <section className="rounded-lg border bg-white p-5">
        <h2 className="font-medium">All readings ({rows.length})</h2>
        <div className="mt-3">
          <ReadingsTable data={rows} />
        </div>
      </section>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg border bg-white p-4">
      <p className="text-xs uppercase tracking-wide text-slate-500">{label}</p>
      <p className="mt-1 text-xl font-semibold">{value}</p>
    </div>
  );
}
