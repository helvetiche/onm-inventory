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
  { id: "a1", time: "10:23", actor: "System", actorType: "system", category: "movement", summary: "Auto-reserved 120 units SKU-0234 for Order #10482 (ICU).", detail: "Safety stock rules triggered. 48h prediction window." },
  { id: "a2", time: "10:15", actor: "Maria L.", actorType: "user", category: "adjustment", summary: "Adjusted SKU-0581 quantity: 1280 → 1295 after cycle count.", detail: "Variance +15 units. Supervisor approved." },
  { id: "a3", time: "10:08", actor: "System", actorType: "system", category: "movement", summary: "Inbound received: 840 units SKU-0450 (Surgical Masks).", detail: "Shipment #7821. Posted to Dry Storage." },
  { id: "a4", time: "09:42", actor: "System", actorType: "system", category: "movement", summary: "Auto-reserved 45 units SKU-0234 for Order #9321.", detail: "ICU safety stock rules." },
  { id: "a5", time: "09:28", actor: "Alice K.", actorType: "user", category: "movement", summary: "Moved 12 units SKU-1120 Cold → Quarantine.", detail: "Temperature excursion. 2.5°C deviation for 35 min." },
  { id: "a6", time: "09:15", actor: "David R.", actorType: "user", category: "access", summary: "Accessed Cabinet Layouts for Emergency Kits.", detail: "Emergency drill prep. Outbound config reviewed." },
  { id: "a7", time: "08:58", actor: "System", actorType: "system", category: "adjustment", summary: "Reconciled 8 units SKU-0450 after overnight cycle count.", detail: "Variance within tolerance. Previous discrepancy closed." },
  { id: "a8", time: "08:34", actor: "James T.", actorType: "user", category: "movement", summary: "Outbound: 24 units SKU-3140 to Ward 3A.", detail: "Nurse station restock. Signed by J. Smith." },
  { id: "a9", time: "08:21", actor: "David R.", actorType: "user", category: "access", summary: "Accessed Cabinet Layouts.", detail: "Emergency drill prep." },
  { id: "a10", time: "07:56", actor: "System", actorType: "system", category: "adjustment", summary: "Downgraded alert severity for SKU-0581 after new receipt.", detail: "1,200 units posted. Low-stock alert closed." },
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
        <div className="max-h-72 space-y-1 overflow-y-auto">
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
              <span className="flex-shrink-0 text-[10px] text-slate-500">{e.time}</span>
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
