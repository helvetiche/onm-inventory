"use client";

import type { JSX } from "react";
import {
  ChartBar,
  ChartLine,
  ClipboardText,
  Layout,
  ListChecks,
  SlidersHorizontal,
  SquaresFour,
} from "@phosphor-icons/react";

export type DashboardComponentId =
  | "analytics"
  | "charts"
  | "cabinets"
  | "audit"
  | "insights"
  | "shortcuts";

export type ComponentVisibility = Record<DashboardComponentId, boolean>;

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
  { id: "shortcuts", label: "Shortcuts", icon: <SlidersHorizontal size={20} weight="bold" /> },
];

type DashboardSidebarProps = {
  visibility: ComponentVisibility;
  onToggle: (id: DashboardComponentId) => void;
};

export const DashboardSidebar = ({
  visibility,
  onToggle,
}: DashboardSidebarProps): JSX.Element => {
  return (
    <aside
      className="flex w-20 flex-shrink-0 flex-col border-r border-slate-200 bg-white"
      aria-label="Dashboard components"
    >
      <div className="flex flex-col gap-0.5 p-2">
        <div className="mb-2 flex items-center justify-center gap-1.5 px-2 py-1">
          <ChartBar size={18} weight="bold" className="text-emerald-900" />
          <span className="text-xs font-medium text-emerald-900">Swap</span>
        </div>
        {COMPONENT_CONFIG.map(({ id, label, icon }) => (
          <button
            key={id}
            type="button"
            onClick={(): void => onToggle(id)}
            className={`flex flex-col items-center gap-1 rounded-lg px-2 py-2 text-center transition-colors hover:bg-slate-50 ${
              visibility[id] ? "bg-emerald-50 text-emerald-900" : "text-slate-400 hover:text-slate-600"
            }`}
            title={`${visibility[id] ? "Hide" : "Show"} ${label}`}
            aria-label={`${visibility[id] ? "Hide" : "Show"} ${label}`}
            aria-pressed={visibility[id]}
          >
            {icon}
            <span className="text-[10px] font-normal leading-tight">{label}</span>
          </button>
        ))}
      </div>
    </aside>
  );
};
