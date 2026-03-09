"use client";

import type { JSX } from "react";
import { ChartBar, ChartLine, DotsThreeOutline, Funnel } from "@phosphor-icons/react";
import type { DateRangeKey } from "./DashboardShell";

type DashboardChartsProps = {
  selectedRange: DateRangeKey;
};

type LegendItem = {
  id: string;
  label: string;
  tone: "primary" | "muted";
};

const stockMovementLegends: LegendItem[] = [
  { id: "legend-inbound", label: "Inbound", tone: "primary" },
  { id: "legend-outbound", label: "Outbound", tone: "muted" },
];

const stockByCabinetLegends: LegendItem[] = [
  { id: "legend-available", label: "Available capacity", tone: "primary" },
  { id: "legend-used", label: "Used capacity", tone: "muted" },
];

const legendToneClasses: Record<LegendItem["tone"], string> = {
  primary: "bg-emerald-500",
  muted: "bg-emerald-200",
};

const getRangeDescriptor = (range: DateRangeKey): string => {
  if (range === "today") return "today";
  if (range === "7d") return "the last 7 days";
  return "the last 30 days";
};

export const DashboardCharts = ({
  selectedRange,
}: DashboardChartsProps): JSX.Element => {
  return (
    <section
      aria-label="Inventory performance charts"
      className="grid grid-cols-1 gap-4 md:grid-cols-2 md:gap-6"
    >
      <article className="flex flex-col rounded-2xl border border-emerald-100 bg-white px-4 py-3 shadow-sm shadow-emerald-900/5 lg:px-5 lg:py-4">
        <header className="mb-3 flex items-start justify-between gap-2">
          <div className="space-y-1">
            <div className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-2 py-0.5 text-[10px] font-normal text-emerald-800">
              <ChartLine size={12} weight="bold" />
              <span>Time series</span>
            </div>
            <h3 className="text-sm font-medium text-emerald-900">
              Stock movements over time
            </h3>
            <p className="text-[11px] font-light text-slate-600">
              Inbound and outbound movements across all cabinets for {getRangeDescriptor(selectedRange)}.
            </p>
          </div>
          <button
            type="button"
            className="inline-flex h-7 w-7 items-center justify-center rounded-full text-slate-500 transition-colors hover:bg-emerald-50 hover:text-emerald-900"
            aria-label="Open chart actions (mock only)"
          >
            <DotsThreeOutline size={16} weight="bold" />
          </button>
        </header>
        <div className="relative mt-1 flex-1 rounded-xl border border-dashed border-emerald-100 bg-emerald-50/40 px-3 py-3">
          <div className="absolute inset-x-3 top-3 flex justify-between text-[9px] font-light text-slate-400">
            <span>High</span>
            <span>Low</span>
          </div>
          <div className="mt-4 flex h-32 flex-col justify-between">
            {[0, 1, 2, 3].map((index) => (
              <div
                key={index}
                className="h-px w-full bg-gradient-to-r from-emerald-100/80 via-emerald-50 to-transparent"
              />
            ))}
          </div>
          <div className="pointer-events-none absolute inset-x-6 bottom-6 flex items-end justify-between gap-2">
            {[60, 40, 72, 36, 64, 52, 80].map((height, index) => (
              <div
                // eslint-disable-next-line react/no-array-index-key
                key={index}
                className="flex w-full flex-col items-center gap-1"
              >
                <div className="flex w-full items-end justify-center gap-0.5">
                  <div
                    className="w-1 rounded-t-full bg-emerald-500/80"
                    style={{ height: `${height}%` }}
                  />
                  <div
                    className="w-1 rounded-t-full bg-emerald-300/80"
                    style={{ height: `${Math.max(15, height - 22)}%` }}
                  />
                </div>
                <div className="h-3 w-full rounded-full bg-emerald-900/5" />
              </div>
            ))}
          </div>
          <div className="absolute inset-x-3 bottom-2 flex justify-between text-[9px] font-light text-slate-400">
            <span>Day 1</span>
            <span>Day 4</span>
            <span>Day 7</span>
          </div>
        </div>
        <footer className="mt-3 flex items-center justify-between gap-3">
          <div className="flex flex-wrap items-center gap-2">
            {stockMovementLegends.map((item) => (
              <div
                key={item.id}
                className="inline-flex items-center gap-1.5 text-[10px] font-normal text-slate-600"
              >
                <span
                  className={`inline-flex h-2 w-2 rounded-full ${legendToneClasses[item.tone]}`}
                />
                <span>{item.label}</span>
              </div>
            ))}
          </div>
          <button
            type="button"
            className="inline-flex items-center gap-1 rounded-full border border-emerald-100 bg-emerald-50 px-2 py-0.5 text-[10px] font-normal text-emerald-800 hover:border-emerald-200"
            aria-label="Export stock movement chart (mock only)"
          >
            <Funnel size={12} weight="bold" />
            <span>Segment</span>
          </button>
        </footer>
      </article>

      <article className="flex flex-col rounded-2xl border border-emerald-100 bg-white px-4 py-3 shadow-sm shadow-emerald-900/5 lg:px-5 lg:py-4">
        <header className="mb-3 flex items-start justify-between gap-2">
          <div className="space-y-1">
            <div className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-2 py-0.5 text-[10px] font-normal text-emerald-800">
              <ChartBar size={12} weight="bold" />
              <span>Capacity</span>
            </div>
            <h3 className="text-sm font-medium text-emerald-900">
              Utilization by cabinet
            </h3>
            <p className="text-[11px] font-light text-slate-600">
              Cabinet-level capacity and usage snapshot to guide placement decisions.
            </p>
          </div>
          <button
            type="button"
            className="inline-flex h-7 w-7 items-center justify-center rounded-full text-slate-500 transition-colors hover:bg-emerald-50 hover:text-emerald-900"
            aria-label="Open cabinet chart actions (mock only)"
          >
            <DotsThreeOutline size={16} weight="bold" />
          </button>
        </header>
        <div className="mt-1 flex flex-1 flex-col justify-between gap-4">
          <div className="flex h-40 items-end justify-between gap-3">
            {[
              { label: "Cold", used: 72, available: 28 },
              { label: "Dry", used: 64, available: 36 },
              { label: "Quarantine", used: 48, available: 52 },
              { label: "Outbound", used: 58, available: 42 },
            ].map((cabinet) => (
              <div key={cabinet.label} className="flex w-full flex-col items-center gap-1">
                <div className="flex w-full flex-1 flex-col justify-end gap-1 rounded-full bg-emerald-50/80 p-1">
                  <div
                    className="w-full rounded-full bg-emerald-500"
                    style={{ height: `${cabinet.used}%` }}
                    aria-hidden
                  />
                  <div
                    className="w-full rounded-full bg-emerald-200"
                    style={{ height: `${cabinet.available}%` }}
                    aria-hidden
                  />
                </div>
                <span className="text-[11px] font-light text-slate-600">
                  {cabinet.label}
                </span>
              </div>
            ))}
          </div>
          <div className="flex items-center justify-between gap-3">
            <div className="flex flex-wrap items-center gap-2">
              {stockByCabinetLegends.map((item) => (
                <div
                  key={item.id}
                  className="inline-flex items-center gap-1.5 text-[10px] font-normal text-slate-600"
                >
                  <span
                    className={`inline-flex h-2 w-2 rounded-full ${legendToneClasses[item.tone]}`}
                  />
                  <span>{item.label}</span>
                </div>
              ))}
            </div>
            <p className="text-[11px] font-light text-slate-500">
              Hover and drag mock data for layout experiments.
            </p>
          </div>
        </div>
      </article>
    </section>
  );
};

