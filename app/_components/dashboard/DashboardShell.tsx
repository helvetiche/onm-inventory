import type { JSX } from "react";
import { AnalyticsCards } from "@/app/_components/dashboard/AnalyticsCards";
import { AnalyticsChart } from "@/app/_components/dashboard/AnalyticsChart";
import { AuditTrailPanel } from "@/app/_components/dashboard/AuditTrailPanel";
import { BottomNavigation } from "@/app/_components/dashboard/BottomNavigation";
import { CabinetsPanel } from "@/app/_components/dashboard/CabinetsPanel";
import { DashboardHeader } from "@/app/_components/dashboard/DashboardHeader";
import {
  analyticsMetrics,
  analyticsTrend,
  auditItems,
  bottomNavItems,
  cabinetItems,
  widgetIconOptions,
  widgetItems,
} from "@/app/_components/dashboard/mockData";
import { SortableWidgetGrid } from "@/app/_components/dashboard/SortableWidgetGrid";

export function DashboardShell(): JSX.Element {
  return (
    <main className="min-h-screen bg-white pb-24">
      <div className="mx-auto flex w-full max-w-5xl flex-col gap-6 px-4 py-5 md:px-6 md:py-8">
        <DashboardHeader />
        <AnalyticsCards metrics={analyticsMetrics} />
        <section
          aria-label="Detailed analytics"
          className="grid grid-cols-1 gap-6 lg:grid-cols-[1.4fr_1fr]"
        >
          <AnalyticsChart trend={analyticsTrend} />
          <CabinetsPanel cabinets={cabinetItems} />
        </section>
        <section
          aria-label="Audit and personalization sections"
          className="grid grid-cols-1 gap-6"
        >
          <AuditTrailPanel items={auditItems} />
          <SortableWidgetGrid
            initialItems={widgetItems}
            iconOptions={widgetIconOptions}
          />
        </section>
      </div>
      <BottomNavigation items={bottomNavItems} />
    </main>
  );
}
