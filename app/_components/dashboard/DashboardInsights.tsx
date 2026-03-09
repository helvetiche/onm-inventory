"use client";

import type { JSX } from "react";
import { FirstAidKit, ShieldCheck, TrendDown } from "@phosphor-icons/react";
import type { Insight, InsightSeverity } from "./DashboardShell";

const insights: (Insight & { icon: JSX.Element })[] = [
  { id: "i1", title: "Restock Cold Storage in 3 days", description: "Vaccine/insulin trending +24% WoW.", severity: "high", icon: <FirstAidKit size={16} weight="bold" /> },
  { id: "i2", title: "Consolidate gloves", description: "Overstock in Dry, flat in Outbound.", severity: "medium", icon: <TrendDown size={16} weight="bold" /> },
  { id: "i3", title: "Tighten quarantine SLAs", description: "11.4h avg time-to-clear.", severity: "medium", icon: <ShieldCheck size={16} weight="bold" /> },
];

const severityClasses: Record<InsightSeverity, string> = {
  high: "bg-red-50 text-red-800",
  medium: "bg-amber-50 text-amber-800",
  low: "bg-emerald-50 text-emerald-800",
};

export const DashboardInsights = (): JSX.Element => (
  <section aria-label="Insights" className="space-y-2">
    <h2 className="text-sm font-medium text-emerald-900">Insights</h2>
    <div className="rounded-lg border border-slate-200 bg-white p-3">
      <div className="space-y-2">
        {insights.map((insight) => (
          <div
            key={insight.id}
            className="flex items-start gap-2 rounded border border-transparent p-2 hover:border-slate-200 hover:bg-slate-50/50"
          >
            <div className="flex h-7 w-7 flex-shrink-0 items-center justify-center rounded bg-emerald-50 text-emerald-900">
              {insight.icon}
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-xs font-medium text-emerald-900">
                {insight.title}
              </p>
              <p className="text-[10px] text-slate-500">{insight.description}</p>
              <div className="mt-1 flex gap-1">
                <span
                  className={`rounded px-1.5 py-0.5 text-[9px] ${severityClasses[insight.severity]}`}
                >
                  {insight.severity}
                </span>
                <button
                  type="button"
                  className="rounded bg-emerald-900 px-1.5 py-0.5 text-[9px] text-white hover:bg-emerald-800"
                >
                  Apply
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  </section>
);
