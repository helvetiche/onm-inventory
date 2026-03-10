import type { JSX } from "react";
import { ClockCounterClockwise } from "@phosphor-icons/react/ssr";
import type { AuditItem } from "@/app/_components/dashboard/types";

type AuditTrailPanelProps = {
  items: AuditItem[];
};

export function AuditTrailPanel({ items }: AuditTrailPanelProps): JSX.Element {
  return (
    <section
      aria-label="Audit trail history"
      className="rounded-2xl border border-emerald-900/20 bg-white p-5"
    >
      <div className="mb-4 flex items-center gap-2">
        <ClockCounterClockwise size={22} className="text-emerald-900" />
        <h2 className="text-2xl font-medium text-emerald-900">Audit Trail</h2>
      </div>
      <div className="space-y-3">
        {items.map((item) => {
          const isImportant = item.severity === "important";
          const severityClass = isImportant
            ? "bg-emerald-900 text-white"
            : "border border-emerald-900/20 bg-white text-emerald-900";
          const severityLabel = isImportant ? "Needs review" : "Normal";

          return (
            <article
              key={item.id}
              className="rounded-xl border border-emerald-900/20 bg-white p-4"
            >
              <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                <div className="space-y-1">
                  <p className="text-lg font-medium text-emerald-900">{item.action}</p>
                  <p className="text-base font-normal text-emerald-800">
                    {item.actor} • {item.cabinet}
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  <span className="rounded-lg bg-emerald-900 px-3 py-1 text-sm font-medium text-white">
                    {item.timeLabel}
                  </span>
                  <span
                    className={`rounded-lg px-3 py-1 text-sm font-medium ${severityClass}`}
                  >
                    {severityLabel}
                  </span>
                </div>
              </div>
            </article>
          );
        })}
      </div>
    </section>
  );
}
