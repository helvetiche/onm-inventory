import type { JSX } from "react";
import { FunnelSimple, MagnifyingGlass } from "@phosphor-icons/react/ssr";

export function DashboardHeader(): JSX.Element {
  return (
    <header className="rounded-2xl border border-emerald-900/20 bg-white p-5">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div className="space-y-1">
          <p className="text-sm font-medium text-emerald-800">Inventory Dashboard</p>
          <h1 className="text-3xl font-medium text-emerald-900">
            Good day, here is your overview
          </h1>
          <p className="text-base font-normal text-emerald-800">
            Everything below is a mockup to help you review layout and flow.
          </p>
        </div>
        <div className="flex flex-col gap-3 sm:flex-row">
          <button
            type="button"
            aria-label="Search inventory records"
            className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl border border-emerald-900/20 bg-white px-4 text-base font-medium text-emerald-900 transition-colors duration-200 hover:bg-emerald-900 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-900 focus-visible:ring-offset-2 focus-visible:ring-offset-white"
          >
            <MagnifyingGlass size={20} weight="bold" />
            Search
          </button>
          <button
            type="button"
            aria-label="Open dashboard filters"
            className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl bg-emerald-900 px-4 text-base font-medium text-white transition-colors duration-200 hover:bg-emerald-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-900 focus-visible:ring-offset-2 focus-visible:ring-offset-white"
          >
            <FunnelSimple size={20} weight="bold" />
            Filters
          </button>
        </div>
      </div>
    </header>
  );
}
