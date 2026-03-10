import type { JSX } from "react";
import type { AnalyticMetric } from "@/app/_components/dashboard/types";

type AnalyticsCardsProps = {
  metrics: AnalyticMetric[];
};

export function AnalyticsCards({ metrics }: AnalyticsCardsProps): JSX.Element {
  return (
    <section aria-label="Inventory analytics cards">
      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        {metrics.map((metric) => (
          <article
            key={metric.id}
            className="rounded-2xl border border-emerald-900/20 bg-white p-5"
          >
            <p className="text-base font-medium text-emerald-800">{metric.title}</p>
            <p className="mt-3 text-4xl font-medium text-emerald-900">{metric.value}</p>
            <p className="mt-2 text-base font-normal text-emerald-800">{metric.context}</p>
            <p className="mt-3 inline-flex rounded-lg bg-emerald-900 px-3 py-1 text-sm font-medium text-white">
              {metric.delta}
            </p>
          </article>
        ))}
      </div>
    </section>
  );
}
