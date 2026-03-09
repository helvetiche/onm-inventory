"use client";

import type { JSX } from "react";
import {
  ChartBar,
  GearSix,
  NotePencil,
  ShieldCheck,
  WarningCircle,
} from "@phosphor-icons/react";
import { useState } from "react";
import type { Shortcut } from "./DashboardShell";

const initialShortcuts: Shortcut[] = [
  {
    id: "shortcut-purchase-orders",
    label: "Purchase orders",
    description: "Draft and approve new orders.",
    enabled: true,
  },
  {
    id: "shortcut-cabinet-layouts",
    label: "Cabinet layouts",
    description: "Manage physical cabinet configurations.",
    enabled: true,
  },
  {
    id: "shortcut-audit-logs",
    label: "Audit logs",
    description: "Review sensitive actions and overrides.",
    enabled: true,
  },
  {
    id: "shortcut-alerts",
    label: "Alerts & thresholds",
    description: "Tune alerts for critical inventory.",
    enabled: false,
  },
];

const getShortcutIcon = (id: string): JSX.Element => {
  if (id === "shortcut-purchase-orders") {
    return <NotePencil size={18} weight="bold" />;
  }
  if (id === "shortcut-cabinet-layouts") {
    return <ChartBar size={18} weight="bold" />;
  }
  if (id === "shortcut-audit-logs") {
    return <ShieldCheck size={18} weight="bold" />;
  }
  return <WarningCircle size={18} weight="bold" />;
};

export const DashboardShortcuts = (): JSX.Element => {
  const [shortcuts, setShortcuts] = useState<Shortcut[]>(initialShortcuts);
  const [isCustomizeMode, setIsCustomizeMode] = useState(false);

  const handleToggleShortcut = (shortcutId: string): void => {
    setShortcuts((currentShortcuts) =>
      currentShortcuts.map((shortcut) =>
        shortcut.id === shortcutId
          ? { ...shortcut, enabled: !shortcut.enabled }
          : shortcut,
      ),
    );
  };

  const handleToggleCustomizeMode = (): void => {
    setIsCustomizeMode((previous) => !previous);
  };

  const visibleShortcuts = shortcuts.filter((shortcut) => shortcut.enabled);

  return (
    <section
      aria-label="Workspace shortcuts"
      className="space-y-3"
    >
      <div className="flex items-baseline justify-between gap-2">
        <div className="space-y-1">
          <h2 className="text-sm font-medium text-emerald-900 sm:text-base">
            Workspace shortcuts
          </h2>
          <p className="text-xs font-light text-slate-600 sm:text-sm">
            Pin the actions you reach for most across the inventory workspace.
          </p>
        </div>
        <button
          type="button"
          onClick={handleToggleCustomizeMode}
          className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-[10px] font-normal transition-colors ${
            isCustomizeMode
              ? "border-emerald-900 bg-emerald-900 text-white"
              : "border-emerald-100 bg-white text-emerald-900 hover:border-emerald-200 hover:bg-emerald-50"
          }`}
          aria-pressed={isCustomizeMode}
          aria-label="Toggle shortcut customization mode"
        >
          <GearSix size={12} weight="bold" />
          <span>{isCustomizeMode ? "Done" : "Customize"}</span>
        </button>
      </div>
      <div className="rounded-2xl border border-emerald-100 bg-white px-3 py-3 shadow-sm shadow-emerald-900/5 lg:px-4 lg:py-4">
        <div className="flex flex-wrap items-center gap-2">
          {visibleShortcuts.length === 0 && (
            <p className="text-[11px] font-light text-slate-600">
              No shortcuts selected yet. Enable at least one to keep navigation snappy.
            </p>
          )}
          {visibleShortcuts.map((shortcut) => (
            <button
              key={shortcut.id}
              type="button"
              className="inline-flex items-center gap-1.5 rounded-full border border-emerald-100 bg-emerald-50 px-3 py-1 text-[11px] font-normal text-emerald-900 hover:border-emerald-200 hover:bg-emerald-100"
              aria-label={`${shortcut.label} shortcut (mock only)`}
            >
              <span className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-emerald-900 text-white">
                {getShortcutIcon(shortcut.id)}
              </span>
              <span>{shortcut.label}</span>
            </button>
          ))}
        </div>
        {isCustomizeMode && (
          <div className="mt-3 border-t border-emerald-50 pt-3">
            <p className="mb-2 text-[11px] font-light text-slate-600">
              Toggle which shortcuts appear by default on the dashboard.
            </p>
            <div className="space-y-1.5">
              {shortcuts.map((shortcut) => (
                <label
                  key={shortcut.id}
                  className="flex cursor-pointer items-center justify-between gap-2 rounded-lg px-1.5 py-1.5 text-[11px] hover:bg-emerald-50/70"
                >
                  <span className="flex items-center gap-1.5 text-slate-700">
                    <span className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-emerald-50 text-emerald-900">
                      {getShortcutIcon(shortcut.id)}
                    </span>
                    <span>{shortcut.label}</span>
                  </span>
                  <input
                    type="checkbox"
                    checked={shortcut.enabled}
                    onChange={(): void => handleToggleShortcut(shortcut.id)}
                    className="h-3.5 w-3.5 rounded border border-emerald-200 text-emerald-900 accent-emerald-900"
                    aria-label={`Toggle shortcut ${shortcut.label}`}
                  />
                </label>
              ))}
            </div>
          </div>
        )}
      </div>
    </section>
  );
};

