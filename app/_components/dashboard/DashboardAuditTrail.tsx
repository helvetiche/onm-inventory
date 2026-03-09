"use client";

import type { JSX, KeyboardEvent } from "react";
import { Funnel, ShieldCheck } from "@phosphor-icons/react";
import type { AuditCategory, AuditEvent } from "./DashboardShell";

type DashboardAuditTrailProps = {
  activeFilter: AuditCategory | "all";
  onChangeFilter: (category: AuditCategory | "all") => void;
  expandedAuditId: string | null;
  onChangeExpandedAuditId: (id: string | null) => void;
};

const mockAuditEvents: AuditEvent[] = [
  {
    id: "audit-01",
    time: "09:42",
    actor: "System",
    actorType: "system",
    category: "movement",
    summary:
      "Auto-reserved 45 units of SKU-0234 for Order #9321 (ICU cabinets).",
    detail:
      "Reservation created based on ICU safety stock rules and predicted admission volume for the next 48 hours.",
  },
  {
    id: "audit-02",
    time: "09:15",
    actor: "Alice K.",
    actorType: "user",
    category: "movement",
    summary:
      "Moved 12 units of SKU-1120 from Cold Storage → Quarantine (temperature excursion).",
    detail:
      "Shipment flagged after temperature probe reported 2.5°C deviation for 35 minutes. Items quarantined pending pharmacist review.",
  },
  {
    id: "audit-03",
    time: "08:58",
    actor: "System",
    actorType: "system",
    category: "adjustment",
    summary:
      "Reconciled 8 units of SKU-0450 after overnight cycle count.",
    detail:
      "Variance between expected and physical count was within tolerance. System snapshot updated and previous discrepancy closed.",
  },
  {
    id: "audit-04",
    time: "08:21",
    actor: "David R.",
    actorType: "user",
    category: "access",
    summary:
      "Accessed Cabinet Layouts for Emergency Response Kits (Outbound).",
    detail:
      "User reviewed configuration for outbound emergency carts ahead of scheduled disaster preparedness drill.",
  },
  {
    id: "audit-05",
    time: "07:56",
    actor: "System",
    actorType: "system",
    category: "adjustment",
    summary:
      "Downgraded alert severity for SKU-0581 after new receipt posted.",
    detail:
      "Delivery of 1,200 units posted to Dry Storage. Low-stock alert closed and threshold recalculated.",
  },
];

const categoryLabels: Record<AuditCategory | "all", string> = {
  all: "All",
  movement: "Movements",
  adjustment: "Adjustments",
  access: "Access",
};

const categoryBadgeClasses: Record<AuditCategory, string> = {
  movement: "bg-emerald-50 text-emerald-800 border-emerald-100",
  adjustment: "bg-amber-50 text-amber-800 border-amber-100",
  access: "bg-sky-50 text-sky-800 border-sky-100",
};

export const DashboardAuditTrail = ({
  activeFilter,
  onChangeFilter,
  expandedAuditId,
  onChangeExpandedAuditId,
}: DashboardAuditTrailProps): JSX.Element => {
  const filteredEvents =
    activeFilter === "all"
      ? mockAuditEvents
      : mockAuditEvents.filter((event) => event.category === activeFilter);

  const handleToggleExpand = (id: string): void => {
    onChangeExpandedAuditId(expandedAuditId === id ? null : id);
  };

  const handleToggleExpandWithKeyboard = (
    event: KeyboardEvent<HTMLDivElement>,
    id: string,
  ): void => {
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      handleToggleExpand(id);
    }
  };

  return (
    <section
      aria-label="Audit trail"
      className="space-y-3"
    >
      <div className="flex items-baseline justify-between gap-2">
        <div className="space-y-1">
          <h2 className="text-sm font-medium text-emerald-900 sm:text-base">
            Audit trail
          </h2>
          <p className="text-xs font-light text-slate-600 sm:text-sm">
            End-to-end traceability for movements, adjustments, and sensitive access.
          </p>
        </div>
        <div className="flex items-center gap-1.5 rounded-full border border-emerald-100 bg-white px-2 py-0.5 text-[10px] font-normal text-slate-600">
          <Funnel size={12} weight="bold" className="text-emerald-800" />
          <span>{categoryLabels[activeFilter]} events</span>
        </div>
      </div>
      <div className="rounded-2xl border border-emerald-100 bg-white px-3 py-3 shadow-sm shadow-emerald-900/5 lg:px-4 lg:py-4">
        <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
          <div className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-3 py-1 text-[11px] font-normal text-emerald-800">
            <ShieldCheck size={14} weight="bold" />
            <span>All actions are mock-only in this view.</span>
          </div>
          <div className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-2 py-0.5 text-[10px] font-normal text-emerald-800">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
            <span>Most recent first</span>
          </div>
        </div>
        <div className="mb-3 flex flex-wrap items-center gap-1.5">
          {(["all", "movement", "adjustment", "access"] as const).map((category) => (
            <button
              key={category}
              type="button"
              onClick={(): void => onChangeFilter(category)}
              className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-[10px] font-normal transition-colors ${
                activeFilter === category
                  ? "bg-emerald-900 text-white"
                  : "bg-emerald-50 text-emerald-800 hover:bg-emerald-100"
              }`}
              aria-label={`Show ${categoryLabels[category]} audit events`}
            >
              <span>{categoryLabels[category]}</span>
            </button>
          ))}
        </div>
        <div className="relative mt-1">
          <div className="absolute bottom-0 left-3 top-0 w-px bg-gradient-to-b from-emerald-100 via-emerald-200/80 to-transparent" />
          <div className="space-y-2">
            {filteredEvents.map((event, index) => {
              const isExpanded = expandedAuditId === event.id;
              const isLast = index === filteredEvents.length - 1;

              return (
                <div
                  key={event.id}
                  className="relative pl-6"
                >
                  <div className="absolute left-1.5 top-2 h-2 w-2 rounded-full bg-emerald-500 shadow shadow-emerald-500/40" />
                  {!isLast && (
                    <div className="absolute left-2 top-4 h-full w-px bg-emerald-100" />
                  )}
                  <div
                    className="group cursor-pointer rounded-xl border border-transparent px-2 py-2 transition-colors hover:border-emerald-100 hover:bg-emerald-50/60"
                    onClick={(): void => handleToggleExpand(event.id)}
                    onKeyDown={(keyboardEvent): void =>
                      handleToggleExpandWithKeyboard(keyboardEvent, event.id)
                    }
                    role="button"
                    tabIndex={0}
                    aria-expanded={isExpanded}
                    aria-label={`Audit event at ${event.time}: ${event.summary}`}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-start gap-2">
                        <span className="mt-0.5 text-[11px] font-light text-slate-500">
                          {event.time}
                        </span>
                        <div className="space-y-0.5">
                          <div className="flex flex-wrap items-center gap-1.5">
                            <span className="text-[11px] font-normal text-emerald-900">
                              {event.summary}
                            </span>
                          </div>
                          <div className="flex flex-wrap items-center gap-1">
                            <span className="rounded-full bg-emerald-900 px-1.5 py-0.5 text-[9px] font-normal text-white">
                              {event.actorType === "system" ? "System" : "User"}
                            </span>
                            <span className="rounded-full bg-emerald-50 px-1.5 py-0.5 text-[9px] font-normal text-emerald-800">
                              {event.actor}
                            </span>
                            <span
                              className={`rounded-full border px-1.5 py-0.5 text-[9px] font-normal ${
                                categoryBadgeClasses[event.category]
                              }`}
                            >
                              {categoryLabels[event.category]}
                            </span>
                          </div>
                        </div>
                      </div>
                      <span className="text-[10px] font-light text-slate-500">
                        {isExpanded ? "Hide" : "Details"}
                      </span>
                    </div>
                    {isExpanded && (
                      <p className="mt-1.5 text-[11px] font-light text-slate-700">
                        {event.detail}
                      </p>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
};

