"use client";

import type { JSX } from "react";
import {
  ArrowsLeftRight,
  NotePencil,
  Package,
  TrendDown,
  TrendUp,
  WarningCircle,
} from "@phosphor-icons/react";
import type { DateRangeKey, TrendDirection } from "./DashboardShell";

type DashboardAnalyticsProps = {
  selectedRange: DateRangeKey;
};

type AnalyticsStat = {
  id: string;
  label: string;
  value: string;
  helper: string;
  trendDirection: TrendDirection;
  trendLabel: string;
  icon: JSX.Element;
};

const getTrendClasses = (direction: TrendDirection): string => {
  if (direction === "up") {
    return "text-emerald-700 bg-emerald-50 border-emerald-100";
  }
  if (direction === "down") {
    return "text-red-700 bg-red-50 border-red-100";
  }
  return "text-slate-600 bg-slate-50 border-slate-100";
};

const getTrendIcon = (direction: TrendDirection): JSX.Element | null => {
  if (direction === "up") {
    return <TrendUp size={16} weight="bold" />;
  }
  if (direction === "down") {
    return <TrendDown size={16} weight="bold" />;
  }
  return null;
};

const analyticsStats: AnalyticsStat[] = [
  {
    id: "stat-total-skus",
    label: "Active SKUs",
    value: "1,482",
    helper: "Across all cabinets",
    trendDirection: "up",
    trendLabel: "+3.1% vs last period",
    icon: <Package size={22} weight="bold" />,
  },
  {
    id: "stat-low-stock",
    label: "Low-stock items",
    value: "37",
    helper: "Below safety threshold",
    trendDirection: "down",
    trendLabel: "-12.4% vs last period",
    icon: <WarningCircle size={22} weight="bold" />,
  },
  {
    id: "stat-open-pos",
    label: "Open purchase orders",
    value: "12",
    helper: "Awaiting confirmation",
    trendDirection: "neutral",
    trendLabel: "Stable vs last period",
    icon: <NotePencil size={22} weight="bold" />,
  },
  {
    id: "stat-today-movements",
    label: "Today’s movements",
    value: "284",
    helper: "Across inbound & outbound",
    trendDirection: "up",
    trendLabel: "+18.2% vs average",
    icon: <ArrowsLeftRight size={22} weight="bold" />,
  },
];

const getRangeLabel = (range: DateRangeKey): string => {
  if (range === "today") return "today";
  if (range === "7d") return "the last 7 days";
  return "the last 30 days";
};

export const DashboardAnalytics = ({
  selectedRange,
}: DashboardAnalyticsProps): JSX.Element => {
  return (
    <section
      aria-label="Inventory analytics overview"
      className="space-y-3"
    >
      <div className="flex items-baseline justify-between gap-2">
        <div className="space-y-1">
          <h2 className="text-sm font-medium text-emerald-900 sm:text-base">
            Analytics overview
          </h2>
          <p className="text-xs font-light text-slate-600 sm:text-sm">
            High-level inventory and movement signals for {getRangeLabel(selectedRange)}.
          </p>
        </div>
      </div>
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
        {analyticsStats.map((stat) => (
          <article
            key={stat.id}
            className="group flex cursor-pointer flex-col justify-between rounded-2xl border border-emerald-100 bg-white px-4 py-3 shadow-sm shadow-emerald-900/5 transition-colors hover:border-emerald-200 hover:bg-emerald-50/60 lg:px-5 lg:py-4"
            aria-label={`${stat.label} analytics card`}
            tabIndex={0}
          >
            <div className="flex items-start justify-between gap-3">
              <div className="space-y-1">
                <p className="text-xs font-light text-slate-600">
                  {stat.label}
                </p>
                <p className="text-lg font-medium text-emerald-900 sm:text-xl">
                  {stat.value}
                </p>
              </div>
              <div className="inline-flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-50 text-emerald-900">
                {stat.icon}
              </div>
            </div>
            <div className="mt-3 flex items-center justify-between gap-2">
              <p className="truncate text-[11px] font-light text-slate-500 sm:text-xs">
                {stat.helper}
              </p>
              <span
                className={`inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[10px] font-normal ${getTrendClasses(
                  stat.trendDirection,
                )}`}
              >
                {getTrendIcon(stat.trendDirection)}
                <span className="truncate">{stat.trendLabel}</span>
              </span>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
};

