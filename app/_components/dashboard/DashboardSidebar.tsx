"use client";

import type { JSX } from "react";
import {
  ArrowsLeftRight,
  ChartLine,
  ClipboardText,
  Layout,
  ListChecks,
  SquaresFour,
} from "@phosphor-icons/react";

export type DashboardComponentId =
  | "analytics"
  | "charts"
  | "cabinets"
  | "audit"
  | "insights";

const COMPONENT_CONFIG: {
  id: DashboardComponentId;
  label: string;
  icon: JSX.Element;
}[] = [
  { id: "analytics", label: "Analytics", icon: <SquaresFour size={20} weight="bold" /> },
  { id: "charts", label: "Charts", icon: <ChartLine size={20} weight="bold" /> },
  { id: "cabinets", label: "Cabinets", icon: <Layout size={20} weight="bold" /> },
  { id: "audit", label: "Audit trail", icon: <ClipboardText size={20} weight="bold" /> },
  { id: "insights", label: "Insights", icon: <ListChecks size={20} weight="bold" /> },
];

type DashboardSidebarProps = {
  componentOrder: DashboardComponentId[];
  selectedId: DashboardComponentId | null;
  onSelect: (id: DashboardComponentId) => void;
};

export const DashboardSidebar = ({
  componentOrder,
  selectedId,
  onSelect,
}: DashboardSidebarProps): JSX.Element => {
  const handleClick = (id: DashboardComponentId): void => {
    onSelect(id);
  };

  return (
    <aside
      className="flex w-20 flex-shrink-0 flex-col border-r border-slate-200 bg-white"
      aria-label="Swap dashboard components"
    >
      <div className="flex flex-col gap-0.5 p-2">
        <div className="mb-2 flex items-center justify-center gap-1 px-2 py-1">
          <ArrowsLeftRight size={18} weight="bold" className="text-emerald-900" />
          <span className="text-xs font-medium text-emerald-900">Swap</span>
        </div>
        <p className="mb-1 px-1 text-[9px] text-slate-500">
          Pick two to swap
        </p>
        {COMPONENT_CONFIG.map(({ id, label, icon }) => {
          const position = componentOrder.indexOf(id) + 1;
          const isSelected = selectedId === id;
          return (
            <button
              key={id}
              type="button"
              onClick={(): void => handleClick(id)}
              className={`flex flex-col items-center gap-0.5 rounded-lg px-2 py-2 text-center transition-colors hover:bg-slate-50 ${
                isSelected
                  ? "bg-emerald-900 text-white ring-2 ring-emerald-600 ring-offset-1"
                  : "text-slate-700"
              }`}
              title={`Swap with ${label}. Slot ${position}`}
              aria-label={`Select ${label} to swap (slot ${position})`}
              aria-pressed={isSelected}
            >
              {icon}
              <span className="text-[10px] font-normal leading-tight">{label}</span>
              <span className={`text-[9px] ${isSelected ? "text-emerald-200" : "text-slate-400"}`}>
                #{position}
              </span>
            </button>
          );
        })}
      </div>
    </aside>
  );
};
