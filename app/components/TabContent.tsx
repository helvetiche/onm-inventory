import type { JSX } from "react";

type TabContentProps = {
  tab: string;
};

const VALID_TABS = ["dashboard", "items", "stock", "movements"] as const;

const TAB_HEADINGS: Record<string, string> = {
  dashboard: "Dashboard",
  items: "Items",
  stock: "Stock",
  movements: "Movements",
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
          {validTab === "dashboard" &&
            "Overview of your inventory. Add widgets and quick stats here."}
          {validTab === "items" &&
            "Manage inventory items (SKU, name, category, unit). Add and edit items here."}
          {validTab === "stock" &&
            "View and manage stock levels by location. Monitor quantities and safety stock."}
          {validTab === "movements" &&
            "Track IN, OUT, and ADJUSTMENT movements. View movement history."}
        </p>
      </div>
    </div>
  );
}
