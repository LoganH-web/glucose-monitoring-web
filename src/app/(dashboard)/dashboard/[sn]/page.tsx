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
    <div className="space-y-6">
      <header className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <Link href="/dashboard" className="text-sm text-brand-500 hover:text-brand-400 transition-colors">
            ← All devices
          </Link>
          <h1 className="mt-1 text-2xl font-semibold text-[#286f52]">
            {device.label || device.sn}
          </h1>
          <p className="text-sm text-slate-400">SN: {device.sn}</p>
        </div>
        <SyncButton sn={device.sn} />
      </header>

      <section className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <Stat label="Readings (14d)" value={stats.count.toString()} />
        <Stat label="Mean mmol/L" value={stats.count ? stats.mean.toString() : "—"} />
        <Stat
          label="Time in range"
          value={stats.count ? `${stats.tirPct}%` : "—"}
          accent={stats.count && stats.tirPct >= 70 ? "green" : undefined}
        />
        <Stat
          label="Hypo / Hyper"
          value={stats.count ? `${stats.hypoCount} / ${stats.hyperCount}` : "—"}
          accent={stats.count && stats.hypoCount > 0 ? "amber" : undefined}
        />
      </section>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="space-y-6 lg:col-span-2">
          <section className="rounded-lg border border-surface-border bg-surface-800 p-5">
            <h2 className="font-semibold text-[#286f52]">
              14-day trend
              <span className="ml-2 text-xs font-normal uppercase tracking-wider text-slate-500">mmol/L</span>
            </h2>
            {rows.length === 0 ? (
              <p className="mt-3 text-sm text-slate-500">
                No readings yet. Click <strong className="text-[#286f52]">Sync now</strong> to pull from Eaglenos.
              </p>
            ) : (
              <div className="mt-3">
                <ReadingsChart data={rows} />
              </div>
            )}
          </section>

          <section className="rounded-lg border border-surface-border bg-surface-800 p-5">
            <h2 className="font-semibold text-[#286f52]">
              Recent logs
              <span className="ml-2 text-xs font-normal text-slate-500">({rows.length})</span>
            </h2>
            <div className="mt-3">
              <ReadingsTable data={rows} />
            </div>
          </section>
        </div>

        <div className="lg:col-span-1">
          <div className="sticky top-4">
            <section className="rounded-lg border border-surface-border bg-surface-800 p-5">
              <h2 className="flex items-center gap-2 font-semibold text-[#286f52]">
                <span className="flex h-5 w-5 items-center justify-center rounded-full bg-brand-500/20">
                  <span className="h-2 w-2 rounded-full bg-brand-500" />
                </span>
                AI analysis
              </h2>
              <AiInsights deviceId={device.id} disabled={rows.length === 0} />
            </section>
          </div>
        </div>
      </div>
    </div>
  );
}

function Stat({
  label,
  value,
  accent,
}: {
  label: string;
  value: string;
  accent?: "green" | "amber" | "red";
}) {
  const valueColor =
    accent === "green"
      ? "text-brand-500"
      : accent === "amber"
      ? "text-amber-400"
      : accent === "red"
      ? "text-red-400"
      : "text-[#286f52]";
  return (
    <div className="rounded-lg border border-surface-border bg-surface-800 p-4">
      <p className="text-xs uppercase tracking-wide text-slate-500">{label}</p>
      <p className={`mt-1 text-xl font-semibold ${valueColor}`}>{value}</p>
    </div>
  );
}
