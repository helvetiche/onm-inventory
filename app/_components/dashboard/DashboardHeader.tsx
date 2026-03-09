"use client";

import type { JSX } from "react";
import { CalendarBlank, GearSix, MagnifyingGlass, UserCircle } from "@phosphor-icons/react";
import type { DateRangeKey } from "./DashboardShell";

type DashboardHeaderProps = {
  selectedRange: DateRangeKey;
  onChangeRange: (range: DateRangeKey) => void;
};

export const DashboardHeader = ({
  selectedRange,
  onChangeRange,
}: DashboardHeaderProps): JSX.Element => {
  const handleChangeRange = (range: DateRangeKey): void => {
    onChangeRange(range);
  };

  return (
    <header className="sticky top-4 z-20">
      <div className="rounded-2xl border border-emerald-100 bg-white/95 px-4 py-3 shadow-sm shadow-emerald-900/5 backdrop-blur lg:px-6 lg:py-4">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex items-start gap-3">
            <div className="mt-0.5 h-8 w-8 rounded-xl bg-emerald-900 text-white shadow-sm shadow-emerald-900/40" />
            <div className="space-y-1">
              <div className="flex flex-wrap items-center gap-2">
                <h1 className="text-base font-medium text-emerald-900 sm:text-lg lg:text-xl">
                  ONM Inventory Dashboard
                </h1>
                <span className="inline-flex items-center rounded-full border border-emerald-100 bg-emerald-50 px-2.5 py-0.5 text-xs font-normal text-emerald-800">
                  <span className="mr-1.5 h-1.5 w-1.5 rounded-full bg-emerald-500" />
                  Live mock environment
                </span>
              </div>
              <p className="text-xs font-light text-slate-600 sm:text-sm">
                Routeless, single-screen control center for cabinets, analytics, and audit visibility. All values are illustrative only.
              </p>
            </div>
          </div>
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-end">
            <div className="flex items-center gap-1.5 rounded-full border border-emerald-100 bg-emerald-50/60 p-0.5">
              {(["today", "7d", "30d"] as const).map((value) => (
                <button
                  key={value}
                  type="button"
                  onClick={(): void => handleChangeRange(value)}
                  className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-normal transition-colors ${
                    selectedRange === value
                      ? "bg-emerald-900 text-white"
                      : "text-emerald-900/80 hover:bg-emerald-900/5"
                  }`}
                  aria-label={`Filter analytics to ${
                    value === "today"
                      ? "today"
                      : value === "7d"
                        ? "the last 7 days"
                        : "the last 30 days"
                  }`}
                >
                  <CalendarBlank size={14} weight="bold" />
                  <span>
                    {value === "today"
                      ? "Today"
                      : value === "7d"
                        ? "7 days"
                        : "30 days"}
                  </span>
                </button>
              ))}
            </div>
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-2 rounded-full border border-slate-200 bg-white px-3 py-1.5 shadow-sm shadow-emerald-900/5">
                <MagnifyingGlass
                  size={16}
                  weight="bold"
                  className="text-emerald-800"
                />
                <input
                  type="search"
                  placeholder="Search SKUs, cabinets, users..."
                  className="w-40 bg-transparent text-xs font-light text-slate-900 placeholder:text-slate-400 focus:outline-none sm:w-56 lg:w-64"
                  aria-label="Global inventory search (mock only)"
                />
                <kbd className="hidden rounded-full bg-emerald-50 px-2 py-0.5 text-[10px] font-normal text-emerald-800 sm:inline-flex">
                  ⌘K
                </kbd>
              </div>
              <button
                type="button"
                className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-700 shadow-sm shadow-emerald-900/5 transition-colors hover:border-emerald-200 hover:text-emerald-900"
                aria-label="Open global settings (mock only)"
              >
                <GearSix size={18} weight="bold" />
              </button>
              <button
                type="button"
                className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-emerald-100 bg-emerald-900 text-white shadow-sm shadow-emerald-900/40 transition-colors hover:bg-emerald-800"
                aria-label="Open profile menu (mock only)"
              >
                <UserCircle size={20} weight="bold" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};

