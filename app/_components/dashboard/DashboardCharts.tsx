"use client";

import type { JSX } from "react";
import {
  ChartBar,
  ChartLine,
} from "@phosphor-icons/react";
import type { DateRangeKey } from "./DashboardShell";

type DashboardChartsProps = {
  selectedRange: DateRangeKey;
};

export const DashboardCharts = ({
  selectedRange,
}: DashboardChartsProps): JSX.Element => (
  <section aria-label="Charts" className="space-y-3">
    <h2 className="text-sm font-medium text-emerald-900">Charts</h2>
    <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
      <div className="rounded-lg border border-slate-200 bg-white p-3">
        <div className="mb-2 flex items-center gap-2">
          <ChartLine size={16} weight="bold" className="text-emerald-900" />
          <h3 className="text-xs font-medium text-emerald-900">
            Stock movements
          </h3>
        </div>
        <div className="flex h-28 items-end justify-between gap-1 rounded border border-slate-100 bg-slate-50/50 p-2">
          {[60, 40, 72, 36, 64, 52, 80].map((h, i) => (
            <div
              key={i}
              className="flex flex-1 flex-col items-center gap-0.5"
            >
              <div
                className="w-full rounded-t bg-emerald-500"
                style={{ height: `${h}%` }}
              />
              <span className="text-[9px] text-slate-400">D{i + 1}</span>
            </div>
          ))}
        </div>
        <div className="mt-2 flex items-center gap-3 text-[10px] text-slate-500">
          <span className="flex items-center gap-1">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
            Inbound
          </span>
          <span className="flex items-center gap-1">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-200" />
            Outbound
          </span>
        </div>
      </div>
      <div className="rounded-lg border border-slate-200 bg-white p-3">
        <div className="mb-2 flex items-center gap-2">
          <ChartBar size={16} weight="bold" className="text-emerald-900" />
          <h3 className="text-xs font-medium text-emerald-900">
            Cabinet utilization
          </h3>
        </div>
        <div className="flex h-28 items-end justify-between gap-3 rounded border border-slate-100 bg-slate-50/50 p-3">
          {[
            { label: "Cold", used: 72 },
            { label: "Dry", used: 64 },
            { label: "Quarantine", used: 48 },
            { label: "Outbound", used: 58 },
          ].map((c) => (
            <div key={c.label} className="flex flex-1 flex-col items-center gap-1">
              <div className="flex h-20 w-full flex-col justify-end rounded bg-emerald-100">
                <div
                  className="w-full rounded-t bg-emerald-600"
                  style={{ height: `${c.used}%` }}
                />
              </div>
              <span className="text-[10px] text-slate-500">{c.label}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  </section>
);
