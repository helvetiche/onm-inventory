"use client";

import type { JSX } from "react";
import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import {
  House,
  Package,
  Warehouse,
  ArrowsLeftRight,
  MapPin,
  ChartBar,
  Gear,
} from "@phosphor-icons/react";

const INVENTORY_TABS = [
  {
    id: "dashboard",
    label: "Dashboard",
    description: "View your inventory overview with quick stats and key metrics",
    href: "/",
    icon: House,
  },
  {
    id: "items",
    label: "Items",
    description: "Manage your inventory items, SKU, and product catalog here",
    href: "/?tab=items",
    icon: Package,
  },
  {
    id: "stock",
    label: "Stock",
    description: "View and manage stock levels across all your warehouse locations",
    href: "/?tab=stock",
    icon: Warehouse,
  },
  {
    id: "movements",
    label: "Movements",
    description: "Track all inventory movements including in, out, and adjustment transactions",
    href: "/?tab=movements",
    icon: ArrowsLeftRight,
  },
  {
    id: "locations",
    label: "Locations",
    description: "Manage warehouses, stores, and storage locations in your system",
    href: "/?tab=locations",
    icon: MapPin,
  },
] as const;

const SYSTEM_TABS = [
  {
    id: "reports",
    label: "Reports",
    description: "View analytics, export data, and generate inventory reports",
    href: "/?tab=reports",
    icon: ChartBar,
  },
  {
    id: "settings",
    label: "Settings",
    description: "Configure preferences, users, and application settings",
    href: "/?tab=settings",
    icon: Gear,
  },
] as const;

const ALL_TAB_IDS = [
  ...INVENTORY_TABS.map((t) => t.id),
  ...SYSTEM_TABS.map((t) => t.id),
] as const;

type SidebarTabId = (typeof ALL_TAB_IDS)[number];

const getActiveTab = (searchParams: URLSearchParams | null): SidebarTabId => {
  const tab = searchParams?.get("tab");
  if (ALL_TAB_IDS.includes(tab as SidebarTabId)) {
    return tab as SidebarTabId;
  }
  return "dashboard";
};

export function Sidebar(): JSX.Element {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const activeTab = getActiveTab(searchParams);

  const isActive = (tabId: SidebarTabId) => activeTab === tabId;

  return (
    <aside
      className="fixed inset-y-0 left-0 z-20 flex w-80 flex-col border-r border-slate-100 bg-white shadow-[4px_0_24px_-4px_rgba(0,0,0,0.04)]"
      aria-label="Inventory navigation"
    >
      <div className="flex h-16 items-center border-b border-slate-100 px-6">
        <span className="text-[15px] font-medium tracking-tight text-emerald-900">
          ONM Inventory
        </span>
      </div>

      <nav className="flex flex-1 flex-col gap-0.5 overflow-y-auto px-4 py-4" role="navigation">
        <div className="mb-1 px-3 py-1.5">
          <span className="text-[11px] font-medium uppercase tracking-wider text-emerald-900/50">
            Inventory
          </span>
        </div>
        {INVENTORY_TABS.map((tab) => {
          const Icon = tab.icon;
          const active = isActive(tab.id);

          return (
            <Link
              key={tab.id}
              href={pathname === "/" ? tab.href : `/?tab=${tab.id}`}
              className={`relative flex items-start gap-3 rounded-md px-4 py-3 transition-colors duration-150 focus:outline-none focus:ring-2 focus:ring-emerald-300 focus:ring-offset-2 ${
                active
                  ? "bg-emerald-50/50 text-emerald-900"
                  : "text-emerald-900/80 hover:bg-emerald-50/50"
              }`}
              aria-current={active ? "page" : undefined}
            >
              {active && (
                <span
                  className="absolute -left-3 top-1/2 h-5 w-0.5 -translate-y-1/2 rounded-full bg-emerald-900"
                  aria-hidden
                />
              )}
              <div className="flex gap-3">
                <div
                  className="flex h-9 w-9 shrink-0 items-center justify-center rounded-md bg-emerald-900"
                  aria-hidden
                >
                  <Icon
                    size={18}
                    weight={active ? "fill" : "regular"}
                    className="text-white"
                    aria-hidden
                  />
                </div>
                <div className="flex min-w-0 flex-col gap-0.5">
                  <span className="text-[14px] font-normal tracking-[0.01em]">
                    {tab.label}
                  </span>
                  <span
                    className={`text-[12px] leading-snug ${
                      active ? "text-emerald-900/70" : "text-emerald-900/60"
                    }`}
                  >
                    {tab.description}
                  </span>
                </div>
              </div>
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}
