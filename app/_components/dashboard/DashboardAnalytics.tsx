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

type Stat = {
  id: string;
  label: string;
  value: string;
  trend: TrendDirection;
  trendLabel: string;
  icon: JSX.Element;
};

const stats: Stat[] = [
  {
    id: "skus",
    label: "Active SKUs",
    value: "1,482",
    trend: "up",
    trendLabel: "+3.1%",
    icon: <Package size={20} weight="bold" />,
  },
  {
    id: "low",
    label: "Low stock",
    value: "37",
    trend: "down",
    trendLabel: "-12.4%",
    icon: <WarningCircle size={20} weight="bold" />,
  },
  {
    id: "pos",
    label: "Open POs",
    value: "12",
    trend: "neutral",
    trendLabel: "Stable",
    icon: <NotePencil size={20} weight="bold" />,
  },
  {
    id: "movements",
    label: "Today movements",
    value: "284",
    trend: "up",
    trendLabel: "+18.2%",
    icon: <ArrowsLeftRight size={20} weight="bold" />,
  },
];

const trendClasses: Record<TrendDirection, string> = {
  up: "text-emerald-600 bg-emerald-50",
  down: "text-red-600 bg-red-50",
  neutral: "text-slate-600 bg-slate-50",
};

const TrendIcon = ({ direction }: { direction: TrendDirection }): JSX.Element | null =>
  direction === "up" ? (
    <TrendUp size={12} weight="bold" />
  ) : direction === "down" ? (
    <TrendDown size={12} weight="bold" />
  ) : null;

export const DashboardAnalytics = ({
  selectedRange,
}: DashboardAnalyticsProps): JSX.Element => (
  <section aria-label="Analytics" className="space-y-2">
    <h2 className="text-sm font-medium text-emerald-900">Analytics</h2>
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
      {stats.map((s) => (
        <div
          key={s.id}
          className="flex items-start justify-between rounded-lg border border-slate-200 bg-white p-3"
        >
          <div>
            <p className="text-xs font-light text-slate-500">{s.label}</p>
            <p className="text-lg font-medium text-emerald-900">{s.value}</p>
            <span
              className={`mt-1 inline-flex items-center gap-0.5 rounded px-1.5 py-0.5 text-[10px] font-normal ${trendClasses[s.trend]}`}
            >
              <TrendIcon direction={s.trend} />
              {s.trendLabel}
            </span>
          </div>
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-50 text-emerald-900">
            {s.icon}
          </div>
        </div>
      ))}
    </div>
  </section>
);
