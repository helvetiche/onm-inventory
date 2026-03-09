"use client";

import type { JSX } from "react";
import {
  CalendarBlank,
  GearSix,
  MagnifyingGlass,
  UserCircle,
} from "@phosphor-icons/react";
import type { DateRangeKey } from "./DashboardShell";

type DashboardHeaderProps = {
  selectedRange: DateRangeKey;
  onChangeRange: (range: DateRangeKey) => void;
};

export const DashboardHeader = ({
  selectedRange,
  onChangeRange,
}: DashboardHeaderProps): JSX.Element => {
  return (
    <header className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
      <div className="flex items-center gap-3">
        <div className="h-8 w-8 rounded-lg bg-emerald-900" />
        <div>
          <h1 className="text-base font-medium text-emerald-900 sm:text-lg">
            ONM Inventory
          </h1>
          <p className="text-xs font-light text-slate-500">
            Mock dashboard. All data illustrative only.
          </p>
        </div>
      </div>
      <div className="flex items-center gap-2">
        <div className="flex rounded-lg border border-slate-200 bg-slate-50/50 p-0.5">
          {(["today", "7d", "30d"] as const).map((value) => (
            <button
              key={value}
              type="button"
              onClick={(): void => onChangeRange(value)}
              className={`rounded-md px-2.5 py-1 text-xs font-normal transition-colors ${
                selectedRange === value
                  ? "bg-emerald-900 text-white"
                  : "text-slate-600 hover:bg-slate-100"
              }`}
              aria-label={`Filter to ${value === "today" ? "today" : value === "7d" ? "7 days" : "30 days"}`}
            >
              <span className="flex items-center gap-1.5">
                <CalendarBlank size={14} weight="bold" />
                {value === "today" ? "Today" : value === "7d" ? "7d" : "30d"}
              </span>
            </button>
          ))}
        </div>
        <div className="flex items-center gap-1 rounded-lg border border-slate-200 bg-white px-2.5 py-1.5">
          <MagnifyingGlass size={16} weight="bold" className="text-slate-500" />
          <input
            type="search"
            placeholder="Search..."
            className="w-28 bg-transparent text-xs font-light text-slate-900 placeholder:text-slate-400 focus:outline-none sm:w-40"
            aria-label="Search"
          />
        </div>
        <button
          type="button"
          className="flex h-8 w-8 items-center justify-center rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50"
          aria-label="Settings"
        >
          <GearSix size={18} weight="bold" />
        </button>
        <button
          type="button"
          className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-900 text-white hover:bg-emerald-800"
          aria-label="Profile"
        >
          <UserCircle size={18} weight="bold" />
        </button>
      </div>
    </header>
  );
};
