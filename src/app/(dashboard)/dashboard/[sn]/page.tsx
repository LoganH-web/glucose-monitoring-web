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
      <header className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <Link
            href="/dashboard"
            className="text-sm font-semibold text-[#286f52] transition hover:text-[#225f47]"
          >
            &larr; All devices
          </Link>
          <h1 className="mt-4 text-3xl font-bold tracking-tight text-[#286f52]">
            {device.label || device.sn}
          </h1>
          <p className="mt-1 text-base font-medium text-[#7a8d88]">SN: {device.sn}</p>
        </div>
        <SyncButton sn={device.sn} />
      </header>

      <section className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        <Stat label="Readings (14d)" value={stats.count.toString()} />
        <Stat label="Mean mmol/L" value={stats.count ? stats.mean.toString() : "-"} />
        <Stat
          label="Time in range"
          value={stats.count ? `${stats.tirPct}%` : "-"}
          accent={stats.count && stats.tirPct >= 70 ? "green" : undefined}
        />
        <Stat
          label="Hypo / Hyper"
          value={stats.count ? `${stats.hypoCount} / ${stats.hyperCount}` : "-"}
          accent={stats.count && stats.hypoCount > 0 ? "amber" : undefined}
        />
      </section>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="space-y-6 lg:col-span-2">
          <section className="rounded-[2rem] border border-[#d8e8e4] bg-white/60 p-6 shadow-[0_24px_80px_rgba(27,78,66,0.08)] backdrop-blur">
            <h2 className="text-2xl font-bold text-[#286f52]">
              14-day trend
              <span className="ml-2 text-sm font-semibold uppercase tracking-[0.14em] text-[#7a8d88]">
                mmol/L
              </span>
            </h2>
            {rows.length === 0 ? (
              <p className="mt-4 text-sm text-[#68736f]">
                No readings yet. Click <strong className="text-[#286f52]">Sync now</strong> to pull from your CGM device.
              </p>
            ) : (
              <div className="mt-5">
                <ReadingsChart data={rows} />
              </div>
            )}
          </section>

          <section className="rounded-[2rem] border border-[#d8e8e4] bg-white/60 p-6 shadow-[0_24px_80px_rgba(27,78,66,0.08)] backdrop-blur">
            <h2 className="text-2xl font-bold text-[#286f52]">
              Recent logs
              <span className="ml-2 text-sm font-semibold text-[#7a8d88]">
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
            <section className="rounded-[2rem] border border-[#d8e8e4] bg-white/60 p-6 shadow-[0_24px_80px_rgba(27,78,66,0.08)] backdrop-blur">
              <h2 className="flex items-center gap-3 text-2xl font-bold text-[#286f52]">
                <span className="flex h-8 w-8 items-center justify-center rounded-full bg-[#dcefe9]">
                  <span className="h-3 w-3 rounded-full bg-[#4fbf82]" />
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
      ? "text-[#33a56b]"
      : accent === "amber"
        ? "text-amber-600"
        : accent === "red"
          ? "text-red-600"
          : "text-[#286f52]";

  return (
    <div className="rounded-[1.25rem] border border-[#d8e8e4] bg-white/65 p-5 shadow-[0_18px_60px_rgba(27,78,66,0.07)]">
      <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[#7a8d88]">
        {label}
      </p>
      <p className={`mt-3 text-2xl font-bold ${valueColor}`}>{value}</p>
    </div>
  );
}
