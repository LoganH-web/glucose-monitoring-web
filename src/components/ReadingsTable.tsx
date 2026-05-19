"use client";

import { useMemo, useState } from "react";

interface Reading {
  id: number;
  blood_sugar: number;
  trend: number | null;
  measured_at: string;
}

const PAGE = 50;

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
            <th className="px-2 py-2">Glucose (mmol/L)</th>
            <th className="px-2 py-2">Trend</th>
          </tr>
        </thead>
        <tbody>
          {slice.map((r) => (
            <tr key={r.id} className="border-t">
              <td className="px-2 py-1.5">{new Date(r.measured_at).toLocaleString()}</td>
              <td className={`px-2 py-1.5 font-medium ${cls(r.blood_sugar)}`}>
                {r.blood_sugar}
              </td>
              <td className="px-2 py-1.5 text-slate-500">{r.trend ?? "—"}</td>
            </tr>
          ))}
        </tbody>
      </table>
      {totalPages > 1 && (
        <div className="mt-3 flex items-center justify-between text-xs text-slate-600">
          <span>
            Page {page + 1} of {totalPages}
          </span>
          <div className="space-x-2">
            <button
              disabled={page === 0}
              onClick={() => setPage((p) => Math.max(0, p - 1))}
              className="rounded border px-2 py-1 disabled:opacity-40"
            >
              Prev
            </button>
            <button
              disabled={page >= totalPages - 1}
              onClick={() => setPage((p) => Math.min(totalPages - 1, p + 1))}
              className="rounded border px-2 py-1 disabled:opacity-40"
            >
              Next
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

function cls(v: number): string {
  if (v < 3.9) return "text-red-600";
  if (v > 10) return "text-amber-600";
  return "text-emerald-700";
}
