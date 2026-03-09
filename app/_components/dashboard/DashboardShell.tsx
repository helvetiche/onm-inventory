"use client";

import type { JSX } from "react";
import { useCallback, useState } from "react";
import {
  DashboardSidebar,
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

const INITIAL_ORDER: DashboardComponentId[] = [
  "analytics",
  "charts",
  "cabinets",
  "insights",
  "audit",
];


export const DashboardShell = (): JSX.Element => {
  const [selectedRange, setSelectedRange] = useState<DateRangeKey>("7d");
  const [activeAuditFilter, setActiveAuditFilter] =
    useState<AuditCategory | "all">("all");
  const [expandedAuditId, setExpandedAuditId] = useState<string | null>(null);
  const [componentOrder, setComponentOrder] =
    useState<DashboardComponentId[]>(INITIAL_ORDER);
  const [selectedForSwap, setSelectedForSwap] =
    useState<DashboardComponentId | null>(null);

  const handleSelectForSwap = useCallback((id: DashboardComponentId): void => {
    setSelectedForSwap((prev) => {
      if (prev === null) return id;
      if (prev === id) return null;
      setComponentOrder((order) => {
        const a = order.indexOf(prev);
        const b = order.indexOf(id);
        if (a === -1 || b === -1) return order;
        const next = [...order];
        next[a] = order[b];
        next[b] = order[a];
        return next;
      });
      return null;
    });
  }, []);

  const topId = componentOrder[0];
  const leftIds = componentOrder.slice(1, 4);
  const rightId = componentOrder[4];

  const renderComponent = (id: DashboardComponentId): JSX.Element | null => {
    if (id === "analytics") {
      return <DashboardAnalytics selectedRange={selectedRange} />;
    }
    if (id === "charts") {
      return <DashboardCharts selectedRange={selectedRange} />;
    }
    if (id === "cabinets") {
      return <DashboardCabinets />;
    }
    if (id === "insights") {
      return <DashboardInsights />;
    }
    if (id === "audit") {
      return (
        <DashboardAuditTrail
          activeFilter={activeAuditFilter}
          onChangeFilter={setActiveAuditFilter}
          expandedAuditId={expandedAuditId}
          onChangeExpandedAuditId={setExpandedAuditId}
        />
      );
    }
    return null;
  };

  return (
    <div className="flex min-h-screen w-full">
      <DashboardSidebar
        componentOrder={componentOrder}
        selectedId={selectedForSwap}
        onSelect={handleSelectForSwap}
      />

      <div className="flex flex-1 flex-col gap-4 overflow-auto px-3 py-4 lg:px-5 lg:py-5">
        <DashboardHeader
          selectedRange={selectedRange}
          onChangeRange={setSelectedRange}
        />

        {renderComponent(topId)}

        <section
          aria-label="Dashboard content"
          className="grid grid-cols-1 gap-4 lg:grid-cols-[1fr_320px] lg:gap-6"
        >
          <div className="flex flex-col gap-4 lg:gap-6">
            {leftIds.map((id) => (
              <div key={id}>{renderComponent(id)}</div>
            ))}
          </div>
          <div className="flex flex-col gap-4 lg:gap-6">
            {rightId ? renderComponent(rightId) : null}
          </div>
        </section>
      </div>
    </div>
  );
};
