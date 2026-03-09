"use client";

import type { JSX, KeyboardEvent } from "react";
import type { AuditCategory, AuditEvent } from "./DashboardShell";

type Props = {
  activeFilter: AuditCategory | "all";
  onChangeFilter: (v: AuditCategory | "all") => void;
  expandedAuditId: string | null;
  onChangeExpandedAuditId: (id: string | null) => void;
};

const events: AuditEvent[] = [
  { id: "a1", time: "09:42", actor: "System", actorType: "system", category: "movement", summary: "Auto-reserved 45 units SKU-0234 for Order #9321.", detail: "ICU safety stock rules." },
  { id: "a2", time: "09:15", actor: "Alice K.", actorType: "user", category: "movement", summary: "Moved 12 units SKU-1120 Cold → Quarantine.", detail: "Temperature excursion." },
  { id: "a3", time: "08:58", actor: "System", actorType: "system", category: "adjustment", summary: "Reconciled 8 units SKU-0450.", detail: "Cycle count variance." },
  { id: "a4", time: "08:21", actor: "David R.", actorType: "user", category: "access", summary: "Accessed Cabinet Layouts.", detail: "Emergency drill prep." },
];

const filters: (AuditCategory | "all")[] = ["all", "movement", "adjustment", "access"];
const labels: Record<AuditCategory | "all", string> = {
  all: "All",
  movement: "Movements",
  adjustment: "Adjustments",
  access: "Access",
};

export const DashboardAuditTrail = ({
  activeFilter,
  onChangeFilter,
  expandedAuditId,
  onChangeExpandedAuditId,
}: Props): JSX.Element => {
  const filtered = activeFilter === "all"
    ? events
    : events.filter((e) => e.category === activeFilter);

  const toggle = (id: string): void =>
    onChangeExpandedAuditId(expandedAuditId === id ? null : id);

  return (
    <section aria-label="Audit trail" className="space-y-2">
      <h2 className="text-sm font-medium text-emerald-900">Audit trail</h2>
      <div className="rounded-lg border border-slate-200 bg-white p-3">
        <div className="mb-2 flex flex-wrap gap-1">
          {filters.map((f) => (
            <button
              key={f}
              type="button"
              onClick={(): void => onChangeFilter(f)}
              className={`rounded px-2 py-0.5 text-[10px] ${
                activeFilter === f
                  ? "bg-emerald-900 text-white"
                  : "bg-slate-100 text-slate-600 hover:bg-slate-200"
              }`}
            >
              {labels[f]}
            </button>
          ))}
        </div>
        <div className="space-y-1">
          {filtered.map((e) => (
            <div
              key={e.id}
              className="flex cursor-pointer gap-2 rounded border border-transparent px-2 py-1.5 hover:border-slate-200 hover:bg-slate-50"
              onClick={(): void => toggle(e.id)}
              onKeyDown={(ev: KeyboardEvent<HTMLDivElement>): void => {
                if (ev.key === "Enter" || ev.key === " ") toggle(e.id);
              }}
              role="button"
              tabIndex={0}
              aria-expanded={expandedAuditId === e.id}
            >
              <span className="text-[10px] text-slate-500">{e.time}</span>
              <div className="min-w-0 flex-1">
                <p className="text-[11px] font-normal text-emerald-900">
                  {e.summary}
                </p>
                {expandedAuditId === e.id && (
                  <p className="mt-0.5 text-[10px] text-slate-500">{e.detail}</p>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
