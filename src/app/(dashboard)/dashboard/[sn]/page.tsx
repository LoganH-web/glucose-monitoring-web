import { notFound } from "next/navigation";
import Link from "next/link";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { ReadingsChart } from "@/components/ReadingsChart";
import { ReadingsTable } from "@/components/ReadingsTable";
import { AiInsights } from "@/components/AiInsights";
import { SyncButton } from "@/components/SyncButton";
import { computeStats } from "@/lib/readings/stats";
import { fetchReadingsSince } from "@/lib/readings/query";

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
  const { readings: rows } = await fetchReadingsSince(supabase, device.id, since);
  const stats = computeStats(rows);

  return (
    <div className="space-y-8">
      <header className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <Link
            href="/dashboard"
            className="text-sm font-semibold text-blue-700 transition hover:text-blue-800"
          >
            &larr; All devices
          </Link>
          <h1 className="mt-4 text-3xl font-bold tracking-tight text-slate-950">
            {device.label || device.sn}
          </h1>
          <p className="mt-1 text-base font-medium text-slate-600">SN: {device.sn}</p>
        </div>
        <SyncButton sn={device.sn} />
      </header>

      <section className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        <Stat label="Readings (14d)" value={stats.count.toString()} />
        <Stat label="Mean mmol/L" value={stats.count ? stats.mean.toString() : "-"} />
        <Stat
          label="Time in range"
          value={stats.count ? `${stats.tirPct}%` : "-"}
          accent={stats.count && stats.tirPct >= 70 ? "blue" : undefined}
        />
        <Stat
          label="Hypo / Hyper"
          value={stats.count ? `${stats.hypoCount} / ${stats.hyperCount}` : "-"}
          accent={stats.count && stats.hypoCount > 0 ? "amber" : undefined}
        />
      </section>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="space-y-6 lg:col-span-2">
          <section className="rounded-[2rem] border border-blue-100 bg-white p-6 shadow-[0_24px_80px_rgba(37,99,235,0.08)] backdrop-blur">
            <h2 className="text-2xl font-bold text-slate-950">
              14-day trend
              <span className="ml-2 text-sm font-semibold uppercase tracking-[0.14em] text-slate-500">
                mmol/L
              </span>
            </h2>
            {rows.length === 0 ? (
              <p className="mt-4 text-sm text-slate-600">
                No readings yet. Click <strong className="text-blue-700">Sync now</strong> to pull from your CGM device.
              </p>
            ) : (
              <div className="mt-5">
                <ReadingsChart data={rows} />
              </div>
            )}
          </section>

          <section className="rounded-[2rem] border border-blue-100 bg-white p-6 shadow-[0_24px_80px_rgba(37,99,235,0.08)] backdrop-blur">
            <h2 className="text-2xl font-bold text-slate-950">
              Recent logs
              <span className="ml-2 text-sm font-semibold text-slate-500">
                ({rows.length})
              </span>
            </h2>
            <div className="mt-5">
              <ReadingsTable data={rows} />
            </div>
          </section>
        </div>

        <div className="lg:col-span-1">
          <div className="sticky top-4">
            <section className="rounded-[2rem] border border-blue-100 bg-white p-6 shadow-[0_24px_80px_rgba(37,99,235,0.08)] backdrop-blur">
              <h2 className="flex items-center gap-3 text-2xl font-bold text-slate-950">
                <span className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-50">
                  <span className="h-3 w-3 rounded-full bg-blue-700" />
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
  accent?: "blue" | "amber" | "red";
}) {
  const valueColor =
    accent === "blue"
      ? "text-blue-700"
      : accent === "amber"
        ? "text-amber-600"
        : accent === "red"
          ? "text-red-600"
          : "text-slate-950";

  return (
    <div className="rounded-[1.25rem] border border-blue-100 bg-white p-5 shadow-[0_18px_60px_rgba(37,99,235,0.07)]">
      <p className="text-xs font-semibold uppercase tracking-[0.14em] text-slate-500">
        {label}
      </p>
      <p className={`mt-3 text-2xl font-bold ${valueColor}`}>{value}</p>
    </div>
  );
}
