import type { JSX } from "react";
import { Archive } from "@phosphor-icons/react/ssr";
import type { CabinetItem } from "@/app/_components/dashboard/types";

type CabinetsPanelProps = {
  cabinets: CabinetItem[];
};

export function CabinetsPanel({ cabinets }: CabinetsPanelProps): JSX.Element {
  return (
    <section
      aria-label="Cabinet status overview"
      className="rounded-2xl border border-emerald-900/20 bg-white p-5"
    >
      <div className="mb-4 flex items-center gap-2">
        <Archive size={22} className="text-emerald-900" />
        <h2 className="text-2xl font-medium text-emerald-900">Cabinets</h2>
      </div>

      <div className="space-y-4">
        {cabinets.map((cabinet) => {
          const usagePercent = Math.round(
            (cabinet.usedSlots / cabinet.totalSlots) * 100,
          );
          return (
            <article
              key={cabinet.id}
              className="rounded-xl border border-emerald-900/20 bg-white p-4"
            >
              <div className="mb-2 flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
                <div>
                  <p className="text-lg font-medium text-emerald-900">{cabinet.label}</p>
                  <p className="text-base font-normal text-emerald-800">{cabinet.zone}</p>
                </div>
                <span className="rounded-lg bg-emerald-900 px-3 py-1 text-sm font-medium text-white">
                  {cabinet.readiness === "ready" ? "Ready" : "Attention"}
                </span>
              </div>
              <div className="mb-2 h-3 w-full overflow-hidden rounded-full border border-emerald-900/20 bg-white">
                <div
                  className="h-full rounded-full bg-emerald-800"
                  style={{ width: `${usagePercent}%` }}
                />
              </div>
              <p className="text-base font-normal text-emerald-800">
                {cabinet.usedSlots} of {cabinet.totalSlots} slots used ({usagePercent}%)
              </p>
            </article>
          );
        })}
      </div>
    </section>
  );
}
