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
          <CartesianGrid strokeDasharray="3 3" stroke="#d7e8e4" />
          <ReferenceArea
            y1={3.9}
            y2={10}
            fill="#66c99a"
            fillOpacity={0.12}
            label={{
              value: "Target Range",
              fill: "#286f52",
              fontSize: 11,
              position: "insideTopLeft",
            }}
          />
          <XAxis
            dataKey="t"
            type="number"
            domain={["dataMin", "dataMax"]}
            tickFormatter={(value) =>
              new Date(value).toLocaleDateString(undefined, {
                month: "short",
                day: "numeric",
              })
            }
            stroke="#9ab0aa"
            tick={{ fill: "#68736f", fontSize: 12 }}
          />
          <YAxis
            domain={[2, "dataMax + 2"]}
            stroke="#9ab0aa"
            tick={{ fill: "#68736f", fontSize: 12 }}
            label={{
              value: "mmol/L",
              angle: -90,
              position: "insideLeft",
              fontSize: 11,
              fill: "#68736f",
            }}
          />
          <Tooltip
            contentStyle={{
              backgroundColor: "#ffffff",
              border: "1px solid #d8e8e4",
              borderRadius: "14px",
              color: "#17201d",
              fontSize: 12,
              boxShadow: "0 18px 45px rgba(27,78,66,0.12)",
            }}
            labelStyle={{ color: "#68736f" }}
            labelFormatter={(value) => new Date(Number(value)).toLocaleString()}
            formatter={(value: number) => [`${value} mmol/L`, "Glucose"]}
          />
          <Line
            type="monotone"
            dataKey="bg"
            stroke="#4fbf82"
            dot={false}
            strokeWidth={2.5}
            isAnimationActive={false}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
