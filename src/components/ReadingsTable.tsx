"use client";

import { useMemo, useState } from "react";

interface Reading {
  id: number;
  blood_sugar: number;
  trend: number | null;
  measured_at: string;
}

const PAGE = 50;

const TREND_MAP: Record<number, { icon: string; label: string; cls: string }> = {
  1: { icon: "→", label: "STABLE",       cls: "text-slate-400" },
  2: { icon: "↗", label: "RISING SLOW",  cls: "text-amber-400" },
  3: { icon: "↑", label: "RISING",       cls: "text-amber-500" },
  4: { icon: "↑", label: "RISING FAST",  cls: "text-red-400"   },
  5: { icon: "↘", label: "FALLING SLOW", cls: "text-sky-400"   },
  6: { icon: "↓", label: "FALLING",      cls: "text-sky-500"   },
  7: { icon: "↓", label: "FALLING FAST", cls: "text-red-400"   },
};

export function ReadingsTable({ data }: { data: Reading[] }) {
  const sorted = useMemo(
    () =>
      [...data].sort(
        (a, b) =>
          new Date(b.measured_at).getTime() - new Date(a.measured_at).getTime()
      ),
    [data]
  );
  const [page, setPage] = useState(0);
  const start = page * PAGE;
  const slice = sorted.slice(start, start + PAGE);
  const totalPages = Math.max(1, Math.ceil(sorted.length / PAGE));

  if (data.length === 0) {
    return <p className="text-sm text-slate-500">No readings yet.</p>;
  }

  return (
    <div className="overflow-x-auto">
      <table className="min-w-full text-sm">
        <thead>
          <tr className="text-left text-xs uppercase tracking-wide text-slate-500">
            <th className="px-2 py-2">Time</th>
            <th className="px-2 py-2">Value</th>
            <th className="px-2 py-2">Trend</th>
          </tr>
        </thead>
        <tbody>
          {slice.map((r) => (
            <tr key={r.id} className="border-t border-surface-border">
              <td className="px-2 py-1.5 text-slate-400">
                {new Date(r.measured_at).toLocaleString()}
              </td>
              <td className="px-2 py-1.5">
                <GlucoseBadge value={Number(r.blood_sugar)} />
              </td>
              <td className="px-2 py-1.5">
                <TrendBadge trend={r.trend} />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      {totalPages > 1 && (
        <div className="mt-3 flex items-center justify-between text-xs text-slate-400">
          <span>
            Page {page + 1} of {totalPages}
          </span>
          <div className="space-x-2">
            <button
              disabled={page === 0}
              onClick={() => setPage((p) => Math.max(0, p - 1))}
              className="rounded border border-surface-border px-2 py-1 hover:border-brand-500 hover:text-white disabled:opacity-40 transition-colors"
            >
              Prev
            </button>
            <button
              disabled={page >= totalPages - 1}
              onClick={() => setPage((p) => Math.min(totalPages - 1, p + 1))}
              className="rounded border border-surface-border px-2 py-1 hover:border-brand-500 hover:text-white disabled:opacity-40 transition-colors"
            >
              Next
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

function GlucoseBadge({ value }: { value: number }) {
  let cls = "bg-brand-500/15 text-brand-400";
  if (value < 3.9) cls = "bg-red-500/15 text-red-400";
  else if (value > 10) cls = "bg-amber-500/15 text-amber-400";
  return (
    <span className={`inline-block rounded-full px-2 py-0.5 text-xs font-semibold ${cls}`}>
      {value}
    </span>
  );
}

function TrendBadge({ trend }: { trend: number | null }) {
  if (trend === null) return <span className="text-slate-500">—</span>;
  const entry = TREND_MAP[trend] ?? { icon: "—", label: String(trend), cls: "text-slate-400" };
  return (
    <span className={`inline-flex items-center gap-1 text-xs font-medium ${entry.cls}`}>
      <span>{entry.icon}</span>
      <span>{entry.label}</span>
    </span>
  );
}
