"use client";

import type { DragEvent, JSX } from "react";
import {
  CheckCircle,
  FirstAidKit,
  Package,
  ShieldCheck,
  Thermometer,
  TrendDown,
  TrendUp,
  Warning,
  WarningCircle,
} from "@phosphor-icons/react";
import { useState } from "react";
import type {
  CabinetZone,
  InventoryCard,
  InventoryCardPriority,
  InventoryCardStatus,
} from "./DashboardShell";

const initialZones: CabinetZone[] = [
  {
    id: "zone-cold",
    title: "Cold Storage",
    description: "Pharmaceuticals, vaccines.",
    capacity: 32,
    items: [
      { id: "c1", code: "SKU-0234", name: "mRNA Vaccines", priority: "critical", status: "low", units: 48 },
      { id: "c2", code: "SKU-1120", name: "Insulin Type B", priority: "high", status: "healthy", units: 96 },
      { id: "c3", code: "SKU-1145", name: "Heparin vials", priority: "critical", status: "low", units: 24 },
      { id: "c4", code: "SKU-1189", name: "IV Fluids 0.9%", priority: "high", status: "healthy", units: 180 },
    ],
  },
  {
    id: "zone-dry",
    title: "Dry Storage",
    description: "Consumables, room temp.",
    capacity: 48,
    items: [
      { id: "c5", code: "SKU-0450", name: "Surgical Masks", priority: "normal", status: "healthy", units: 520 },
      { id: "c6", code: "SKU-0581", name: "Nitrile Gloves M", priority: "normal", status: "overstock", units: 1280 },
      { id: "c7", code: "SKU-0623", name: "Bandages assorted", priority: "normal", status: "healthy", units: 340 },
      { id: "c8", code: "SKU-0712", name: "Alcohol swabs", priority: "normal", status: "low", units: 92 },
      { id: "c9", code: "SKU-0789", name: "Gauze pads 4x4", priority: "high", status: "healthy", units: 256 },
    ],
  },
  {
    id: "zone-quarantine",
    title: "Quarantine",
    description: "Quality-check items.",
    capacity: 20,
    items: [
      { id: "c10", code: "SKU-2094", name: "Antibiotics Batch Q3", priority: "high", status: "low", units: 22 },
      { id: "c11", code: "SKU-2156", name: "Expired acetaminophen", priority: "normal", status: "low", units: 8 },
    ],
  },
  {
    id: "zone-outbound",
    title: "Outbound",
    description: "Staged for wards.",
    capacity: 24,
    items: [
      { id: "c12", code: "SKU-3140", name: "Emergency Kits", priority: "high", status: "healthy", units: 40 },
      { id: "c13", code: "SKU-3201", name: "OR packs", priority: "high", status: "healthy", units: 18 },
      { id: "c14", code: "SKU-3287", name: "ICU consumables", priority: "critical", status: "healthy", units: 64 },
    ],
  },
];

const priorityClasses: Record<InventoryCardPriority, string> = {
  critical: "bg-red-50 text-red-700",
  high: "bg-amber-50 text-amber-800",
  normal: "bg-emerald-50 text-emerald-800",
};

const statusClasses: Record<InventoryCardStatus, string> = {
  low: "bg-red-50 text-red-700",
  overstock: "bg-sky-50 text-sky-800",
  healthy: "bg-emerald-50 text-emerald-800",
};

const priorityIcons: Record<InventoryCardPriority, JSX.Element> = {
  critical: <Warning size={12} weight="duotone" />,
  high: <TrendUp size={12} weight="duotone" />,
  normal: <CheckCircle size={12} weight="duotone" />,
};

const statusIcons: Record<InventoryCardStatus, JSX.Element> = {
  low: <TrendDown size={12} weight="duotone" />,
  healthy: <CheckCircle size={12} weight="duotone" />,
  overstock: <Package size={12} weight="duotone" />,
};

const getItemIcon = (item: InventoryCard): JSX.Element => {
  if (item.id === "c1" || item.id === "c3") return <Thermometer size={16} weight="bold" />;
  if (item.id === "c2" || item.id === "c4") return <Thermometer size={16} weight="bold" />;
  if (item.id === "c12" || item.id === "c14") return <FirstAidKit size={16} weight="bold" />;
  if (["c5", "c6", "c7", "c8", "c9"].includes(item.id)) return <Package size={16} weight="bold" />;
  if (item.id === "c10" || item.id === "c11") return <ShieldCheck size={16} weight="bold" />;
  return <ShieldCheck size={16} weight="bold" />;
};

export const DashboardCabinets = (): JSX.Element => {
  const [zones, setZones] = useState<CabinetZone[]>(initialZones);
  const [draggedId, setDraggedId] = useState<string | null>(null);
  const [activeZone, setActiveZone] = useState<string | null>(null);

  const handleDragStart = (e: DragEvent<HTMLDivElement>, cardId: string): void => {
    e.dataTransfer.effectAllowed = "move";
    e.dataTransfer.setData("text/plain", cardId);
    setDraggedId(cardId);
  };

  const handleDrop = (zoneId: string): void => {
    if (!draggedId) return;
    setZones((prev) => {
      let item: InventoryCard | null = null;
      const without = prev.map((z) => {
        const found = z.items.find((i) => i.id === draggedId);
        if (found) {
          item = found;
          return { ...z, items: z.items.filter((i) => i.id !== draggedId) };
        }
        return z;
      });
      if (!item) return prev;
      return without.map((z) =>
        z.id === zoneId ? { ...z, items: [...z.items, item!] } : z
      );
    });
    setDraggedId(null);
    setActiveZone(null);
  };

  return (
    <section aria-label="Cabinets" className="space-y-2">
      <h2 className="text-sm font-medium text-emerald-900">Cabinets</h2>
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {zones.map((zone) => {
          const isActive = activeZone === zone.id;
          return (
            <div
              key={zone.id}
              className={`flex flex-col rounded-lg border bg-white p-2 transition-colors ${
                isActive ? "border-emerald-400 bg-emerald-50/50" : "border-slate-200"
              }`}
              onDragOver={(e): void => {
                e.preventDefault();
                e.dataTransfer.dropEffect = "move";
                setActiveZone(zone.id);
              }}
              onDragLeave={(): void => setActiveZone((z) => (z === zone.id ? null : z))}
              onDrop={(): void => handleDrop(zone.id)}
            >
              <div className="mb-2 flex items-center justify-between">
                <div>
                  <h3 className="text-xs font-medium text-emerald-900">
                    {zone.title}
                  </h3>
                  <p className="text-[10px] text-slate-500">{zone.description}</p>
                </div>
                <span className="text-[10px] text-slate-500">
                  {zone.items.length}/{zone.capacity}
                </span>
              </div>
              <div className="flex min-h-[80px] max-h-48 flex-col gap-1.5 overflow-y-auto rounded border border-dashed border-slate-200 bg-slate-50/30 p-2">
                {zone.items.map((item) => (
                  <div
                    key={item.id}
                    draggable
                    onDragStart={(e): void => handleDragStart(e, item.id)}
                    className={`flex cursor-grab items-center gap-2 rounded border bg-white p-2 ${
                      draggedId === item.id ? "opacity-60" : ""
                    }`}
                  >
                    <div className="flex h-6 w-6 flex-shrink-0 items-center justify-center rounded bg-emerald-50 text-emerald-900">
                      {getItemIcon(item)}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-[11px] font-medium text-emerald-900">
                        {item.code}
                      </p>
                      <p className="truncate text-[10px] text-slate-500">
                        {item.name}
                      </p>
                    </div>
                    <div className="flex flex-shrink-0 items-center gap-0.5">
                      <span className={`inline-flex items-center gap-0.5 rounded px-1 py-0.5 text-[9px] ${priorityClasses[item.priority]}`}>
                        {priorityIcons[item.priority]}
                        {item.priority}
                      </span>
                      <span className={`inline-flex items-center gap-0.5 rounded px-1 py-0.5 text-[9px] ${statusClasses[item.status]}`}>
                        {statusIcons[item.status]}
                        {item.status}
                      </span>
                    </div>
                  </div>
                ))}
                {zone.items.length === 0 && (
                  <p className="py-4 text-center text-[10px] text-slate-400">
                    Drop here
                  </p>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
};
