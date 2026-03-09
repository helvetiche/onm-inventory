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
  { id: "po", label: "Purchase orders", description: "", enabled: true },
  { id: "cab", label: "Cabinet layouts", description: "", enabled: true },
  { id: "aud", label: "Audit logs", description: "", enabled: true },
  { id: "alt", label: "Alerts", description: "", enabled: false },
];

const getIcon = (id: string): JSX.Element => {
  if (id === "po") return <NotePencil size={16} weight="bold" />;
  if (id === "cab") return <ChartBar size={16} weight="bold" />;
  if (id === "aud") return <ShieldCheck size={16} weight="bold" />;
  return <WarningCircle size={16} weight="bold" />;
};

export const DashboardShortcuts = (): JSX.Element => {
  const [shortcuts, setShortcuts] = useState(initialShortcuts);
  const [customize, setCustomize] = useState(false);

  const toggle = (id: string): void =>
    setShortcuts((s) =>
      s.map((x) => (x.id === id ? { ...x, enabled: !x.enabled } : x))
    );

  const visible = shortcuts.filter((s) => s.enabled);

  return (
    <section aria-label="Shortcuts" className="space-y-2">
      <div className="flex items-center justify-between">
        <h2 className="text-sm font-medium text-emerald-900">Shortcuts</h2>
        <button
          type="button"
          onClick={(): void => setCustomize(!customize)}
          className={`flex items-center gap-1 rounded px-2 py-0.5 text-[10px] ${
            customize ? "bg-emerald-900 text-white" : "bg-slate-100 text-slate-600 hover:bg-slate-200"
          }`}
        >
          <GearSix size={12} weight="bold" />
          {customize ? "Done" : "Customize"}
        </button>
      </div>
      <div className="rounded-lg border border-slate-200 bg-white p-3">
        <div className="flex flex-wrap gap-2">
          {visible.map((s) => (
            <button
              key={s.id}
              type="button"
              className="flex items-center gap-1.5 rounded-lg border border-slate-200 bg-slate-50 px-2.5 py-1.5 text-[11px] font-normal text-emerald-900 hover:bg-emerald-50"
            >
              <span className="flex h-6 w-6 items-center justify-center rounded bg-emerald-900 text-white">
                {getIcon(s.id)}
              </span>
              {s.label}
            </button>
          ))}
        </div>
        {customize && (
          <div className="mt-3 space-y-1 border-t border-slate-100 pt-3">
            {shortcuts.map((s) => (
              <label
                key={s.id}
                className="flex cursor-pointer items-center justify-between gap-2 rounded px-1 py-1 hover:bg-slate-50"
              >
                <span className="flex items-center gap-2 text-[11px] text-slate-700">
                  <span className="flex h-5 w-5 items-center justify-center rounded bg-emerald-50 text-emerald-900">
                    {getIcon(s.id)}
                  </span>
                  {s.label}
                </span>
                <input
                  type="checkbox"
                  checked={s.enabled}
                  onChange={(): void => toggle(s.id)}
                  className="rounded border-slate-200 accent-emerald-900"
                />
              </label>
            ))}
          </div>
        )}
      </div>
    </section>
  );
};
