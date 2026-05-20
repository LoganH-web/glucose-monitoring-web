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
          <CartesianGrid strokeDasharray="3 3" stroke="#2a3f34" />
          <ReferenceArea y1={3.9} y2={10} fill="#22c55e" fillOpacity={0.07} label={{ value: "Target Range", fill: "#4ade80", fontSize: 10, position: "insideTopLeft" }} />
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
            stroke="#4b6b5a"
            tick={{ fill: "#6b8a78", fontSize: 12 }}
          />
          <YAxis
            domain={[2, "dataMax + 2"]}
            stroke="#4b6b5a"
            tick={{ fill: "#6b8a78", fontSize: 12 }}
            label={{ value: "mmol/L", angle: -90, position: "insideLeft", fontSize: 11, fill: "#6b8a78" }}
          />
          <Tooltip
            contentStyle={{
              backgroundColor: "#1b2b23",
              border: "1px solid #2a3f34",
              borderRadius: "6px",
              color: "#f1f5f2",
              fontSize: 12,
            }}
            labelStyle={{ color: "#94a3b8" }}
            labelFormatter={(v) => new Date(Number(v)).toLocaleString()}
            formatter={(v: number) => [`${v} mmol/L`, "Glucose"]}
          />
          <Line
            type="monotone"
            dataKey="bg"
            stroke="#22c55e"
            dot={false}
            strokeWidth={2}
            isAnimationActive={false}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
