import type { JSX } from "react";
import dynamic from "next/dynamic";

const Items = dynamic(
  () => import("@/app/components/items/Items").then((m) => ({ default: m.Items })),
  { ssr: false }
);

type TabContentProps = {
  tab: string;
};

const VALID_TABS = [
  "dashboard",
  "items",
  "stock",
  "movements",
  "locations",
  "reports",
  "settings",
] as const;

const TAB_HEADINGS: Record<string, string> = {
  dashboard: "Dashboard",
  items: "Items",
  stock: "Stock",
  movements: "Movements",
  locations: "Locations",
  reports: "Reports",
  settings: "Settings",
};

const TAB_DESCRIPTIONS: Record<string, string> = {
  dashboard:
    "Overview of your inventory. Add widgets and quick stats here.",
  items:
    "Manage inventory items (SKU, name, category, unit). Add and edit items here.",
  stock:
    "View and manage stock levels by location. Monitor quantities and safety stock.",
  movements:
    "Track IN, OUT, and ADJUSTMENT movements. View movement history.",
  locations:
    "Manage warehouses, stores, and storage locations. Configure where inventory is held.",
  reports:
    "Generate reports, export data, and view analytics across your inventory.",
  settings:
    "Configure preferences, users, notifications, and application settings.",
};

export function TabContent({ tab }: TabContentProps): JSX.Element {
  const validTab = VALID_TABS.includes(tab as (typeof VALID_TABS)[number])
    ? (tab as (typeof VALID_TABS)[number])
    : "dashboard";

  const heading = TAB_HEADINGS[validTab] ?? "Dashboard";

  return (
    <div className="p-8">
      <h1 className="mb-6 text-lg font-medium tracking-tight text-slate-900">
        {heading}
      </h1>
      <div className="rounded-lg border border-slate-100 bg-white p-6 shadow-[0_1px_3px_0_rgba(0,0,0,0.05)]">
        <p className="text-[14px] leading-relaxed text-slate-500">
          {TAB_DESCRIPTIONS[validTab]}
        </p>
      </div>
    </div>
  );
}
