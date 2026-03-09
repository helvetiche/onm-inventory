"use client";

import type { JSX } from "react";
import {
  FirstAidKit,
  Lightning,
  ShieldCheck,
  ShoppingCart,
  TrendDown,
  Warning,
} from "@phosphor-icons/react";
import type { Insight, InsightSeverity } from "./DashboardShell";

const insights: (Insight & { icon: JSX.Element })[] = [
  { id: "i1", title: "Restock Cold Storage in 3 days", description: "Vaccine/insulin trending +24% WoW. Critical levels in 3.2 days.", severity: "high", icon: <FirstAidKit size={16} weight="bold" /> },
  { id: "i2", title: "Consolidate gloves inventory", description: "Overstock in Dry Storage, flat in Outbound. Reduce handling costs.", severity: "medium", icon: <TrendDown size={16} weight="bold" /> },
  { id: "i3", title: "Tighten quarantine SLAs", description: "11.4h avg time-to-clear. Target 6h could unlock faster availability.", severity: "medium", icon: <ShieldCheck size={16} weight="bold" /> },
  { id: "i4", title: "Alcohol swabs below min", description: "SKU-0712 at 92 units. Reorder point 100. Create PO now.", severity: "high", icon: <Warning size={16} weight="bold" /> },
  { id: "i5", title: "Expired items in quarantine", description: "8 units acetaminophen (SKU-2156) to dispose. Schedule pick-up.", severity: "low", icon: <Lightning size={16} weight="bold" /> },
  { id: "i6", title: "Order #10482 pending", description: "120 units mRNA Vaccines. Approve to avoid stockout.", severity: "high", icon: <ShoppingCart size={16} weight="bold" /> },
];

const severityClasses: Record<InsightSeverity, string> = {
  high: "bg-red-50 text-red-800",
  medium: "bg-amber-50 text-amber-800",
  low: "bg-emerald-50 text-emerald-800",
};

export const DashboardInsights = (): JSX.Element => (
  <section aria-label="Insights" className="space-y-2">
    <h2 className="text-sm font-medium text-emerald-900">Insights</h2>
    <div className="max-h-64 overflow-y-auto rounded-lg border border-slate-200 bg-white p-3">
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
