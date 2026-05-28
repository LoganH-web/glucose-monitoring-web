"use client";

import { useMemo, useState } from "react";
import { formatReadingDateTime } from "@/lib/dates";

interface Reading {
  id: number;
  blood_sugar: number;
  trend: number | null;
  measured_at: string;
}

const PAGE = 50;

const TREND_MAP: Record<number, { icon: string; label: string; cls: string }> = {
  1: { icon: "->", label: "STABLE", cls: "text-slate-500" },
  2: { icon: "^", label: "RISING SLOW", cls: "text-amber-600" },
  3: { icon: "^", label: "RISING", cls: "text-amber-600" },
  4: { icon: "^", label: "RISING FAST", cls: "text-red-600" },
  5: { icon: "v", label: "FALLING SLOW", cls: "text-sky-600" },
  6: { icon: "v", label: "FALLING", cls: "text-sky-600" },
  7: { icon: "v", label: "FALLING FAST", cls: "text-red-600" },
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
    return <p className="text-sm text-slate-600">No readings yet.</p>;
  }

  return (
    <div className="overflow-x-auto rounded-[1.25rem] bg-white">
      <table className="min-w-full text-sm">
        <thead>
          <tr className="text-left text-xs font-bold uppercase tracking-[0.14em] text-slate-700">
            <th className="px-4 py-3">Time</th>
            <th className="px-4 py-3">Value</th>
            <th className="px-4 py-3">Trend</th>
          </tr>
        </thead>
        <tbody>
          {slice.map((reading) => (
            <tr key={reading.id} className="border-t border-blue-100">
              <td className="px-4 py-3 font-medium text-slate-700">
                {formatReadingDateTime(reading.measured_at)}
              </td>
              <td className="px-4 py-3">
                <GlucoseBadge value={Number(reading.blood_sugar)} />
              </td>
              <td className="px-4 py-3">
                <TrendBadge trend={reading.trend} />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      {totalPages > 1 && (
        <div className="flex items-center justify-between border-t border-blue-100 px-4 py-3 text-xs font-semibold text-slate-600">
          <span>
            Page {page + 1} of {totalPages}
          </span>
          <div className="space-x-2">
            <button
              disabled={page === 0}
              onClick={() => setPage((current) => Math.max(0, current - 1))}
              className="rounded-full border border-blue-100 bg-white px-3 py-1.5 transition hover:text-blue-700 disabled:opacity-40"
            >
              Prev
            </button>
            <button
              disabled={page >= totalPages - 1}
              onClick={() => setPage((current) => Math.min(totalPages - 1, current + 1))}
              className="rounded-full border border-blue-100 bg-white px-3 py-1.5 transition hover:text-blue-700 disabled:opacity-40"
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
  let className = "bg-blue-100 text-blue-800";
  if (value < 3.9) className = "bg-red-50 text-red-700";
  else if (value > 10) className = "bg-amber-50 text-amber-700";

  return (
    <span className={`inline-block rounded-full px-3 py-1 text-xs font-bold ${className}`}>
      {value}
    </span>
  );
}

function TrendBadge({ trend }: { trend: number | null }) {
  if (trend === null) return <span className="text-slate-500">-</span>;
  const entry = TREND_MAP[trend] ?? {
    icon: "-",
    label: String(trend),
    cls: "text-slate-500",
  };

  return (
    <span className={`inline-flex items-center gap-1 text-xs font-bold ${entry.cls}`}>
      <span>{entry.icon}</span>
      <span>{entry.label}</span>
    </span>
  );
}
