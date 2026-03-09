"use client";

import type { JSX } from "react";
import { useState } from "react";
import {
  DashboardSidebar,
  type ComponentVisibility,
  type DashboardComponentId,
} from "./DashboardSidebar";
import { DashboardHeader } from "./DashboardHeader";
import { DashboardAnalytics } from "./DashboardAnalytics";
import { DashboardCharts } from "./DashboardCharts";
import { DashboardCabinets } from "./DashboardCabinets";
import { DashboardAuditTrail } from "./DashboardAuditTrail";
import { DashboardInsights } from "./DashboardInsights";

export type DateRangeKey = "today" | "7d" | "30d";

export type TrendDirection = "up" | "down" | "neutral";

export type InventoryCardPriority = "critical" | "high" | "normal";

export type InventoryCardStatus = "low" | "healthy" | "overstock";

export type InventoryCard = {
  id: string;
  code: string;
  name: string;
  priority: InventoryCardPriority;
  status: InventoryCardStatus;
  units: number;
};

export type CabinetZone = {
  id: string;
  title: string;
  description: string;
  capacity: number;
  items: InventoryCard[];
};

export type AuditCategory = "movement" | "adjustment" | "access";

export type AuditEvent = {
  id: string;
  time: string;
  actor: string;
  actorType: "user" | "system";
  category: AuditCategory;
  summary: string;
  detail: string;
};

export type InsightSeverity = "high" | "medium" | "low";

export type Insight = {
  id: string;
  title: string;
  description: string;
  severity: InsightSeverity;
};

const INITIAL_VISIBILITY: ComponentVisibility = {
  analytics: true,
  charts: true,
  cabinets: true,
  audit: true,
  insights: true,
};

export const DashboardShell = (): JSX.Element => {
  const [selectedRange, setSelectedRange] = useState<DateRangeKey>("7d");
  const [activeAuditFilter, setActiveAuditFilter] =
    useState<AuditCategory | "all">("all");
  const [expandedAuditId, setExpandedAuditId] = useState<string | null>(null);
  const [visibility, setVisibility] =
    useState<ComponentVisibility>(INITIAL_VISIBILITY);

  const handleToggleComponent = (id: DashboardComponentId): void => {
    setVisibility((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  return (
    <div className="flex min-h-screen w-full">
      <DashboardSidebar visibility={visibility} onToggle={handleToggleComponent} />

      <div className="flex flex-1 flex-col gap-4 overflow-auto px-3 py-4 lg:px-5 lg:py-5">
        <DashboardHeader
          selectedRange={selectedRange}
          onChangeRange={setSelectedRange}
        />

        {visibility.analytics && (
          <DashboardAnalytics selectedRange={selectedRange} />
        )}

        <section
          aria-label="Dashboard content"
          className="grid grid-cols-1 gap-4 lg:grid-cols-[1fr_320px] lg:gap-6"
        >
          <div className="flex flex-col gap-4 lg:gap-6">
            {visibility.charts && (
              <DashboardCharts selectedRange={selectedRange} />
            )}
            {visibility.cabinets && <DashboardCabinets />}
            {visibility.insights && <DashboardInsights />}
          </div>
          <div className="flex flex-col gap-4 lg:gap-6">
            {visibility.audit && (
              <DashboardAuditTrail
                activeFilter={activeAuditFilter}
                onChangeFilter={setActiveAuditFilter}
                expandedAuditId={expandedAuditId}
                onChangeExpandedAuditId={setExpandedAuditId}
              />
            )}
          </div>
        </section>
      </div>
    </div>
  );
};
