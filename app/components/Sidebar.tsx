"use client";

import type { JSX } from "react";
import { useState, useMemo } from "react";
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
  MagnifyingGlass,
  SquaresFour,
  List,
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

const ALL_TABS = [...INVENTORY_TABS, ...SYSTEM_TABS] as const;

const ALL_TAB_IDS = ALL_TABS.map((t) => t.id);

type SidebarTabId = (typeof ALL_TAB_IDS)[number];

const getActiveTab = (searchParams: URLSearchParams | null): SidebarTabId => {
  const tab = searchParams?.get("tab");
  if (ALL_TAB_IDS.includes(tab as SidebarTabId)) {
    return tab as SidebarTabId;
  }
  return "dashboard";
};

const matchesSearch = (query: string, tab: (typeof ALL_TABS)[number]): boolean => {
  if (!query.trim()) return true;
  const q = query.toLowerCase();
  return (
    tab.label.toLowerCase().includes(q) ||
    tab.description.toLowerCase().includes(q) ||
    tab.id.toLowerCase().includes(q)
  );
};

type SidebarProps = {
  isIconOnly: boolean;
  onToggleIconOnly: () => void;
};

export function Sidebar({
  isIconOnly,
  onToggleIconOnly,
}: SidebarProps): JSX.Element {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const activeTab = getActiveTab(searchParams);
  const [searchQuery, setSearchQuery] = useState("");

  const filteredTabs = useMemo(() => {
    return ALL_TABS.filter((tab) => matchesSearch(searchQuery, tab));
  }, [searchQuery]);

  const isActive = (tabId: SidebarTabId) => activeTab === tabId;

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
  };

  return (
    <aside
      className="fixed inset-y-0 left-0 z-20 flex flex-col border-r border-slate-100 bg-white shadow-[4px_0_24px_-4px_rgba(0,0,0,0.04)] transition-[width] duration-200 ease-in-out"
      style={{ width: isIconOnly ? "6rem" : "20rem" }}
      aria-label="Inventory navigation"
    >
      <div className="flex h-16 shrink-0 items-center justify-between border-b border-slate-100 px-4">
        {!isIconOnly && (
          <span className="truncate text-[15px] font-medium tracking-tight text-emerald-900">
            ONM Inventory
          </span>
        )}
        <button
          type="button"
          onClick={onToggleIconOnly}
          className="flex h-9 w-9 shrink-0 cursor-pointer items-center justify-center rounded-md bg-emerald-900 text-white transition-colors hover:bg-emerald-800 focus:outline-none focus:ring-2 focus:ring-emerald-300 focus:ring-offset-2"
          aria-label={isIconOnly ? "Expand sidebar" : "Collapse to icons only"}
        >
          {isIconOnly ? (
            <List size={18} weight="regular" aria-hidden />
          ) : (
            <SquaresFour size={18} weight="regular" aria-hidden />
          )}
        </button>
      </div>

      {!isIconOnly && (
        <div className="shrink-0 border-b border-slate-100 px-3 py-3">
          <div className="relative">
            <MagnifyingGlass
              size={18}
              weight="regular"
              className="absolute left-3 top-1/2 -translate-y-1/2 text-emerald-900/50"
              aria-hidden
            />
            <input
              type="search"
              placeholder="Search..."
              value={searchQuery}
              onChange={handleSearchChange}
              className="w-full rounded-md border border-slate-200 bg-slate-50/50 py-2 pl-9 pr-3 text-[14px] text-emerald-900 placeholder:text-emerald-900/40 focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
              aria-label="Search navigation"
            />
          </div>
        </div>
      )}

      <nav
        className="flex flex-1 flex-col gap-0.5 overflow-y-auto px-3 py-4"
        role="navigation"
      >
        {isIconOnly ? (
          <div className="grid grid-cols-3 gap-2">
            {filteredTabs.map((tab) => {
              const Icon = tab.icon;
              const active = isActive(tab.id);

              return (
                <Link
                  key={tab.id}
                  href={pathname === "/" ? tab.href : `/?tab=${tab.id}`}
                  title={tab.label}
                  className={`flex flex-col items-center gap-1 rounded-md p-2 transition-colors focus:outline-none focus:ring-2 focus:ring-emerald-300 focus:ring-offset-2 ${
                    active
                      ? "bg-emerald-50/50"
                      : "hover:bg-emerald-50/50"
                  }`}
                  aria-current={active ? "page" : undefined}
                  aria-label={tab.label}
                >
                  <div
                    className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-md ${
                      active ? "bg-emerald-900" : "bg-emerald-900/80"
                    }`}
                  >
                    <Icon
                      size={16}
                      weight={active ? "fill" : "regular"}
                      className="text-white"
                      aria-hidden
                    />
                  </div>
                  <span className="truncate max-w-full text-[10px] text-emerald-900">
                    {tab.label}
                  </span>
                </Link>
              );
            })}
          </div>
        ) : (
          <>
            {filteredTabs.length > 0 && (
              <>
                <div className="mb-1 px-3 py-1.5">
                  <span className="text-[11px] font-medium uppercase tracking-wider text-emerald-900/50">
                    {INVENTORY_TABS.some((t) =>
                      filteredTabs.some((f) => f.id === t.id)
                    )
                      ? "Inventory"
                      : "System"}
                  </span>
                </div>
                {filteredTabs.map((tab) => {
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
              </>
            )}
            {filteredTabs.length === 0 && (
              <p className="px-4 py-6 text-[13px] text-emerald-900/60">
                No results for &quot;{searchQuery}&quot;
              </p>
            )}
          </>
        )}
      </nav>
    </aside>
  );
}
