"use client";

import type { JSX } from "react";
import { FirstAidKit, ShieldCheck, TrendDown } from "@phosphor-icons/react";
import type { Insight, InsightSeverity } from "./DashboardShell";

const insights: Insight[] = [
  {
    id: "insight-01",
    title: "Restock Cold Storage within 3 days",
    description:
      "Vaccine and insulin movements are trending +24% week-over-week. Cold Storage will hit critical levels in 3.2 days.",
    severity: "high",
  },
  {
    id: "insight-02",
    title: "Consolidate gloves inventory across cabinets",
    description:
      "Nitrile gloves are overstocked in Dry Storage but trending flat in Outbound. Consider consolidating to reduce handling.",
    severity: "medium",
  },
  {
    id: "insight-03",
    title: "Tighten quarantine review SLAs",
    description:
      "Average time-to-clear for quarantined items increased to 11.4 hours. A tighter SLA could unlock earlier availability.",
    severity: "medium",
  },
];

const getSeverityClasses = (severity: InsightSeverity): string => {
  if (severity === "high") {
    return "bg-red-50 text-red-800 border-red-100";
  }
  if (severity === "medium") {
    return "bg-amber-50 text-amber-800 border-amber-100";
  }
  return "bg-emerald-50 text-emerald-800 border-emerald-100";
};

const getSeverityLabel = (severity: InsightSeverity): string => {
  if (severity === "high") return "High impact";
  if (severity === "medium") return "Medium impact";
  return "Low impact";
};

const getInsightIcon = (id: string): JSX.Element => {
  if (id === "insight-01") {
    return <FirstAidKit size={18} weight="bold" />;
  }
  if (id === "insight-02") {
    return <TrendDown size={18} weight="bold" />;
  }
  return <ShieldCheck size={18} weight="bold" />;
};

export const DashboardInsights = (): JSX.Element => {
  return (
    <section
      aria-label="Smart insights"
      className="space-y-3"
    >
      <div className="flex items-baseline justify-between gap-2">
        <div className="space-y-1">
          <h2 className="text-sm font-medium text-emerald-900 sm:text-base">
            Smart insights
          </h2>
          <p className="text-xs font-light text-slate-600 sm:text-sm">
            System-suggested actions to keep cabinets healthy and predictable.
          </p>
        </div>
      </div>
      <div className="rounded-2xl border border-emerald-100 bg-white px-3 py-3 shadow-sm shadow-emerald-900/5 lg:px-4 lg:py-4">
        <div className="space-y-2">
          {insights.map((insight) => (
            <article
              key={insight.id}
              className="flex items-start gap-3 rounded-xl border border-transparent px-2 py-2 transition-colors hover:border-emerald-100 hover:bg-emerald-50/60"
            >
              <div className="mt-0.5 inline-flex h-8 w-8 items-center justify-center rounded-xl bg-emerald-50 text-emerald-900">
                {getInsightIcon(insight.id)}
              </div>
              <div className="flex-1 space-y-1">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <h3 className="text-xs font-medium text-emerald-900 sm:text-sm">
                      {insight.title}
                    </h3>
                    <p className="mt-0.5 text-[11px] font-light text-slate-700 sm:text-xs">
                      {insight.description}
                    </p>
                  </div>
                  <span
                    className={`inline-flex items-center gap-1 rounded-full border px-1.5 py-0.5 text-[10px] font-normal ${getSeverityClasses(
                      insight.severity,
                    )}`}
                  >
                    <span className="h-1.5 w-1.5 rounded-full bg-current" />
                    <span>{getSeverityLabel(insight.severity)}</span>
                  </span>
                </div>
                <div className="mt-1 flex flex-wrap items-center gap-1.5">
                  <button
                    type="button"
                    className="inline-flex items-center gap-1 rounded-full bg-emerald-900 px-2 py-0.5 text-[10px] font-normal text-white hover:bg-emerald-800"
                    aria-label={`Accept insight: ${insight.title} (mock only)`}
                  >
                    <span>Apply suggestion</span>
                  </button>
                  <button
                    type="button"
                    className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2 py-0.5 text-[10px] font-normal text-emerald-800 hover:bg-emerald-100"
                    aria-label={`Snooze insight: ${insight.title} (mock only)`}
                  >
                    <span>Snooze</span>
                  </button>
                </div>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
};

