"use client";

import type { JSX } from "react";
import {
  ChartBar,
  ChartLine,
  ChartPieSlice,
  TrendUp,
} from "@phosphor-icons/react";
import type { DateRangeKey } from "./DashboardShell";

type DashboardChartsProps = {
  selectedRange: DateRangeKey;
};

const PIE_DATA = [
  { label: "Cold", value: 22, color: "bg-emerald-600" },
  { label: "Dry", value: 38, color: "bg-emerald-500" },
  { label: "Quarantine", value: 12, color: "bg-amber-400" },
  { label: "Outbound", value: 18, color: "bg-emerald-400" },
  { label: "Receiving", value: 10, color: "bg-slate-300" },
];

export const DashboardCharts = ({ selectedRange }: DashboardChartsProps): JSX.Element => (
  <section aria-label="Charts" className="space-y-3">
    <h2 className="text-sm font-medium text-emerald-900">Charts</h2>
    <div className="grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-4">
      <div className="rounded-lg border border-slate-200 bg-white p-3">
        <div className="mb-2 flex items-center gap-2">
          <ChartLine size={16} weight="bold" className="text-emerald-900" />
          <h3 className="text-xs font-medium text-emerald-900">Stock movements</h3>
        </div>
        <div className="flex h-28 items-end justify-between gap-0.5 rounded border border-slate-100 bg-slate-50/50 p-2">
          {[60, 40, 72, 36, 64, 52, 80, 45, 68, 55].map((h, i) => (
            <div key={i} className="flex flex-1 flex-col items-center gap-0.5">
              <div className="w-full rounded-t bg-emerald-500" style={{ height: `${h}%` }} />
              <span className="text-[8px] text-slate-400">{i + 1}</span>
            </div>
          ))}
        </div>
        <div className="mt-2 flex gap-3 text-[10px] text-slate-500">
          <span className="flex items-center gap-1"><span className="h-1.5 w-1.5 rounded-full bg-emerald-500" /> Inbound</span>
          <span className="flex items-center gap-1"><span className="h-1.5 w-1.5 rounded-full bg-emerald-200" /> Outbound</span>
        </div>
      </div>

      <div className="rounded-lg border border-slate-200 bg-white p-3">
        <div className="mb-2 flex items-center gap-2">
          <ChartBar size={16} weight="bold" className="text-emerald-900" />
          <h3 className="text-xs font-medium text-emerald-900">Cabinet utilization</h3>
        </div>
        <div className="flex h-28 items-end justify-between gap-2 rounded border border-slate-100 bg-slate-50/50 p-3">
          {[
            { label: "Cold", used: 72 },
            { label: "Dry", used: 64 },
            { label: "Quarantine", used: 48 },
            { label: "Outbound", used: 58 },
            { label: "Recv", used: 41 },
          ].map((c) => (
            <div key={c.label} className="flex flex-1 flex-col items-center gap-1">
              <div className="flex h-20 w-full flex-col justify-end rounded bg-emerald-100">
                <div className="w-full rounded-t bg-emerald-600" style={{ height: `${c.used}%` }} />
              </div>
              <span className="text-[10px] text-slate-500">{c.label}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="rounded-lg border border-slate-200 bg-white p-3">
        <div className="mb-2 flex items-center gap-2">
          <ChartPieSlice size={16} weight="bold" className="text-emerald-900" />
          <h3 className="text-xs font-medium text-emerald-900">Stock by zone</h3>
        </div>
        <div className="flex h-28 items-center gap-3">
          <div
            className="flex h-24 w-24 flex-shrink-0 items-center justify-center rounded-full"
            style={{
              background: "conic-gradient(#059669 0deg 79deg, #10b981 79deg 221deg, #fbbf24 221deg 264deg, #34d399 264deg 329deg, #cbd5e1 329deg 365deg)",
            }}
          >
            <div className="h-14 w-14 rounded-full bg-white" />
          </div>
          <div className="flex flex-1 flex-wrap gap-x-2 gap-y-0.5">
            {PIE_DATA.map((d) => (
              <span key={d.label} className="flex items-center gap-1 text-[10px] text-slate-600">
                <span className={`h-2 w-2 rounded-full ${d.color}`} />
                {d.label} {d.value}%
              </span>
            ))}
          </div>
        </div>
      </div>

      <div className="rounded-lg border border-slate-200 bg-white p-3">
        <div className="mb-2 flex items-center gap-2">
          <TrendUp size={16} weight="bold" className="text-emerald-900" />
          <h3 className="text-xs font-medium text-emerald-900">Demand forecast</h3>
        </div>
        <div className="flex h-28 items-end justify-between gap-0.5 rounded border border-slate-100 bg-slate-50/50 p-2">
          {[45, 52, 58, 62, 55, 68, 72, 78, 75, 82].map((h, i) => (
            <div key={i} className="flex flex-1 flex-col items-center gap-0.5">
              <div className="w-full rounded-t bg-emerald-400/80" style={{ height: `${h}%` }} />
              <span className="text-[8px] text-slate-400">W{i + 1}</span>
            </div>
          ))}
        </div>
        <p className="mt-1 text-[10px] text-slate-500">Next 10 weeks projected</p>
      </div>
    </div>
  </section>
);
