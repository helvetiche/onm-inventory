"use client";

import type { JSX } from "react";
import {
  ArrowsLeftRight,
  Clock,
  Minus,
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
  sub?: string;
  trend: TrendDirection;
  trendLabel: string;
  icon: JSX.Element;
};

const stats: Stat[] = [
  { id: "skus", label: "Active SKUs", value: "2,847", sub: "across 12 cabinets", trend: "up", trendLabel: "+5.2%", icon: <Package size={20} weight="bold" /> },
  { id: "low", label: "Low stock alerts", value: "43", sub: "below threshold", trend: "down", trendLabel: "-8.1%", icon: <WarningCircle size={20} weight="bold" /> },
  { id: "pos", label: "Open purchase orders", value: "28", sub: "pending approval", trend: "up", trendLabel: "+12%", icon: <NotePencil size={20} weight="bold" /> },
  { id: "movements", label: "Today movements", value: "1,247", sub: "inbound & outbound", trend: "up", trendLabel: "+22%", icon: <ArrowsLeftRight size={20} weight="bold" /> },
  { id: "expiring", label: "Expiring in 30d", value: "156", sub: "items to rotate", trend: "down", trendLabel: "-4%", icon: <Clock size={20} weight="bold" /> },
  { id: "zones", label: "Storage zones", value: "8", sub: "cold, dry, quarantine", trend: "neutral", trendLabel: "Stable", icon: <Package size={20} weight="bold" /> },
  { id: "variance", label: "Cycle count variance", value: "0.3%", sub: "within tolerance", trend: "down", trendLabel: "-0.1pp", icon: <TrendDown size={20} weight="bold" /> },
];

const trendClasses: Record<TrendDirection, string> = {
  up: "text-emerald-600 bg-emerald-50",
  down: "text-red-600 bg-red-50",
  neutral: "text-slate-600 bg-slate-50",
};

const TrendIcon = ({ direction }: { direction: TrendDirection }): JSX.Element =>
  direction === "up" ? <TrendUp size={12} weight="duotone" /> : direction === "down" ? <TrendDown size={12} weight="duotone" /> : <Minus size={12} weight="duotone" />;

export const DashboardAnalytics = ({ selectedRange }: DashboardAnalyticsProps): JSX.Element => (
  <section aria-label="Analytics" className="space-y-2">
    <h2 className="text-sm font-medium text-emerald-900">Analytics</h2>
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 lg:grid-cols-7">
      {stats.map((s) => (
        <div
          key={s.id}
          className="flex items-start justify-between rounded-lg border border-slate-200 bg-white p-3"
        >
          <div>
            <p className="text-xs font-light text-slate-500">{s.label}</p>
            <p className="text-lg font-medium text-emerald-900">{s.value}</p>
            {s.sub && <p className="text-[10px] text-slate-400">{s.sub}</p>}
            <span className={`mt-1 inline-flex items-center gap-0.5 rounded px-1.5 py-0.5 text-[10px] font-normal ${trendClasses[s.trend]}`}>
              <TrendIcon direction={s.trend} aria-hidden />
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
