"use client";

import {
  CartesianGrid,
  Line,
  LineChart,
  ReferenceArea,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

interface Reading {
  blood_sugar: number;
  measured_at: string;
}

export function ReadingsChart({ data }: { data: Reading[] }) {
  const formatted = data.map((d) => ({
    t: new Date(d.measured_at).getTime(),
    bg: Number(d.blood_sugar),
  }));
  return (
    <div className="h-64 w-full">
      <ResponsiveContainer>
        <LineChart data={formatted} margin={{ top: 8, right: 16, bottom: 8, left: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
          <ReferenceArea y1={3.9} y2={10} fill="#34d399" fillOpacity={0.08} />
          <XAxis
            dataKey="t"
            type="number"
            domain={["dataMin", "dataMax"]}
            tickFormatter={(v) =>
              new Date(v).toLocaleDateString(undefined, {
                month: "short",
                day: "numeric",
              })
            }
            stroke="#64748b"
            fontSize={12}
          />
          <YAxis
            domain={[2, "dataMax + 2"]}
            stroke="#64748b"
            fontSize={12}
            label={{ value: "mmol/L", angle: -90, position: "insideLeft", fontSize: 11 }}
          />
          <Tooltip
            labelFormatter={(v) => new Date(Number(v)).toLocaleString()}
            formatter={(v: number) => [`${v} mmol/L`, "Glucose"]}
          />
          <Line
            type="monotone"
            dataKey="bg"
            stroke="#2563eb"
            dot={false}
            strokeWidth={1.5}
            isAnimationActive={false}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
