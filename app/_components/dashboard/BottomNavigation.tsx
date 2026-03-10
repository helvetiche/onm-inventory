"use client";

import { useState, type JSX } from "react";
import { DashboardIcon } from "@/app/_components/dashboard/IconLibrary";
import type { BottomNavItem } from "@/app/_components/dashboard/types";

type BottomNavigationProps = {
  items: BottomNavItem[];
};

export function BottomNavigation({ items }: BottomNavigationProps): JSX.Element {
  const [activeItemId, setActiveItemId] = useState<string>(items[0]?.id ?? "");

  return (
    <nav
      aria-label="Bottom navigation"
      className="fixed inset-x-0 bottom-0 z-50 border-t border-emerald-900/20 bg-white"
    >
      <ul className="mx-auto grid w-full max-w-5xl grid-cols-4 px-2 py-2">
        {items.map((item) => {
          const isActive = item.id === activeItemId;
          const stateClass = isActive
            ? "bg-emerald-900 text-white"
            : "bg-white text-emerald-900 hover:bg-emerald-800 hover:text-white";
          return (
            <li key={item.id}>
              <button
                type="button"
                aria-label={`Open ${item.label}`}
                aria-pressed={isActive}
                onClick={() => {
                  setActiveItemId(item.id);
                }}
                className={`flex min-h-11 w-full flex-col items-center justify-center rounded-xl px-2 py-2 text-sm font-medium transition-colors duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-900 focus-visible:ring-offset-2 focus-visible:ring-offset-white ${stateClass}`}
              >
                <DashboardIcon iconKey={item.iconKey} size={20} />
                <span>{item.label}</span>
              </button>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
