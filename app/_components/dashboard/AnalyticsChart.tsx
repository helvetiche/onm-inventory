"use client";

import type { JSX } from "react";
import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import type { TrendPoint } from "@/app/_components/dashboard/types";

type AnalyticsChartProps = {
  trend: TrendPoint[];
};

export function AnalyticsChart({ trend }: AnalyticsChartProps): JSX.Element {
  return (
    <section
      aria-label="Inventory movement trend"
      className="rounded-2xl border border-emerald-900/20 bg-white p-5"
    >
      <h2 className="text-2xl font-medium text-emerald-900">Movement Trend</h2>
      <p className="mt-1 text-base font-normal text-emerald-800">
        Weekly stock and movement activity (mock data).
      </p>
      <div className="mt-5 h-72 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart
            data={trend}
            margin={{ top: 8, right: 8, left: -12, bottom: 8 }}
          >
            <CartesianGrid stroke="#065f46" strokeDasharray="4 4" />
            <XAxis dataKey="day" stroke="#064e3b" tick={{ fontSize: 16 }} />
            <YAxis stroke="#064e3b" tick={{ fontSize: 16 }} />
            <Tooltip
              contentStyle={{
                backgroundColor: "#ffffff",
                borderColor: "#064e3b",
                color: "#064e3b",
                borderRadius: 12,
              }}
            />
            <Area
              type="monotone"
              dataKey="stock"
              stroke="#064e3b"
              fill="#065f46"
              fillOpacity={0.35}
              strokeWidth={3}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </section>
  );
}
