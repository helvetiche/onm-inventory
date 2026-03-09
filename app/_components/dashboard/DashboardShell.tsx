"use client";

import type { JSX } from "react";
import { useState } from "react";
import { DashboardHeader } from "./DashboardHeader";
import { DashboardAnalytics } from "./DashboardAnalytics";
import { DashboardCharts } from "./DashboardCharts";
import { DashboardCabinets } from "./DashboardCabinets";
import { DashboardAuditTrail } from "./DashboardAuditTrail";
import { DashboardInsights } from "./DashboardInsights";
import { DashboardShortcuts } from "./DashboardShortcuts";

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

export type Shortcut = {
  id: string;
  label: string;
  description: string;
  enabled: boolean;
};

export const DashboardShell = (): JSX.Element => {
  const [selectedRange, setSelectedRange] = useState<DateRangeKey>("7d");
  const [activeAuditFilter, setActiveAuditFilter] =
    useState<AuditCategory | "all">("all");
  const [expandedAuditId, setExpandedAuditId] = useState<string | null>(null);

  return (
    <div className="mx-auto flex min-h-screen max-w-7xl flex-col gap-6 px-4 pb-8 pt-6 lg:gap-8 lg:px-8 lg:pb-10 lg:pt-8">
      <DashboardHeader
        selectedRange={selectedRange}
        onChangeRange={setSelectedRange}
      />

      <DashboardAnalytics selectedRange={selectedRange} />

      <section
        aria-label="Inventory layout and audit"
        className="grid grid-cols-1 gap-6 lg:grid-cols-[minmax(0,2fr)_minmax(0,1.25fr)] lg:gap-8"
      >
        <div className="space-y-6 lg:space-y-8">
          <DashboardCharts selectedRange={selectedRange} />
          <DashboardCabinets />
          <DashboardInsights />
        </div>
        <div className="space-y-6 lg:space-y-8">
          <DashboardAuditTrail
            activeFilter={activeAuditFilter}
            onChangeFilter={setActiveAuditFilter}
            expandedAuditId={expandedAuditId}
            onChangeExpandedAuditId={setExpandedAuditId}
          />
          <DashboardShortcuts />
        </div>
      </section>
    </div>
  );
};

