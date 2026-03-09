"use client";

import type { DragEvent, JSX } from "react";
import {
  ArrowsLeftRight,
  FirstAidKit,
  Package,
  ShieldCheck,
  Thermometer,
  WarningCircle,
} from "@phosphor-icons/react";
import { useMemo, useState } from "react";
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
    description: "Temperature-controlled pharmaceuticals and vaccines.",
    capacity: 24,
    items: [
      {
        id: "card-vaccine-01",
        code: "SKU-0234",
        name: "mRNA Vaccines – Lot A92",
        priority: "critical",
        status: "low",
        units: 48,
      },
      {
        id: "card-insulin-01",
        code: "SKU-1120",
        name: "Insulin – Type B",
        priority: "high",
        status: "healthy",
        units: 96,
      },
    ],
  },
  {
    id: "zone-dry",
    title: "Dry Storage",
    description: "Everyday consumables and room-temperature cabinets.",
    capacity: 32,
    items: [
      {
        id: "card-masks-01",
        code: "SKU-0450",
        name: "Surgical Masks – Box of 50",
        priority: "normal",
        status: "healthy",
        units: 520,
      },
      {
        id: "card-gloves-01",
        code: "SKU-0581",
        name: "Nitrile Gloves – Medium",
        priority: "normal",
        status: "overstock",
        units: 1280,
      },
    ],
  },
  {
    id: "zone-quarantine",
    title: "Quarantine",
    description: "Delayed, expired, or quality-check items.",
    capacity: 14,
    items: [
      {
        id: "card-antibiotic-01",
        code: "SKU-2094",
        name: "Antibiotics – Batch Q3",
        priority: "high",
        status: "low",
        units: 22,
      },
    ],
  },
  {
    id: "zone-outbound",
    title: "Outbound",
    description: "Staged for wards and external partners.",
    capacity: 18,
    items: [
      {
        id: "card-kit-01",
        code: "SKU-3140",
        name: "Emergency Response Kits",
        priority: "high",
        status: "healthy",
        units: 40,
      },
    ],
  },
];

const getPriorityLabel = (priority: InventoryCardPriority): string => {
  if (priority === "critical") return "Critical";
  if (priority === "high") return "High";
  return "Normal";
};

const getPriorityClasses = (priority: InventoryCardPriority): string => {
  if (priority === "critical") {
    return "bg-red-50 text-red-700 border-red-100";
  }
  if (priority === "high") {
    return "bg-amber-50 text-amber-800 border-amber-100";
  }
  return "bg-emerald-50 text-emerald-800 border-emerald-100";
};

const getStatusLabel = (status: InventoryCardStatus): string => {
  if (status === "low") return "Low stock";
  if (status === "overstock") return "Overstock";
  return "Healthy";
};

const getStatusClasses = (status: InventoryCardStatus): string => {
  if (status === "low") {
    return "bg-red-50 text-red-700 border-red-100";
  }
  if (status === "overstock") {
    return "bg-sky-50 text-sky-800 border-sky-100";
  }
  return "bg-emerald-50 text-emerald-800 border-emerald-100";
};

const getItemIcon = (item: InventoryCard): JSX.Element => {
  if (item.id.includes("vaccine")) {
    return <Thermometer size={18} weight="bold" />;
  }
  if (item.id.includes("kit")) {
    return <FirstAidKit size={18} weight="bold" />;
  }
  if (item.id.includes("gloves") || item.id.includes("masks")) {
    return <Package size={18} weight="bold" />;
  }
  return <ShieldCheck size={18} weight="bold" />;
};

export const DashboardCabinets = (): JSX.Element => {
  const [zones, setZones] = useState<CabinetZone[]>(initialZones);
  const [draggedCardId, setDraggedCardId] = useState<string | null>(null);
  const [activeZoneId, setActiveZoneId] = useState<string | null>(null);

  const totalSlots = useMemo(
    () => zones.reduce((accumulator, zone) => accumulator + zone.capacity, 0),
    [zones],
  );

  const usedSlots = useMemo(
    () => zones.reduce((accumulator, zone) => accumulator + zone.items.length, 0),
    [zones],
  );

  const handleDragStart = (
    event: DragEvent<HTMLDivElement>,
    cardId: string,
  ): void => {
    event.dataTransfer.effectAllowed = "move";
    event.dataTransfer.setData("text/plain", cardId);
    setDraggedCardId(cardId);
  };

  const handleDragOver = (
    event: DragEvent<HTMLDivElement>,
    zoneId: string,
  ): void => {
    event.preventDefault();
    event.dataTransfer.dropEffect = "move";
    setActiveZoneId(zoneId);
  };

  const handleDragLeave = (zoneId: string): void => {
    if (activeZoneId === zoneId) {
      setActiveZoneId(null);
    }
  };

  const handleDrop = (zoneId: string): void => {
    if (!draggedCardId) return;

    setZones((currentZones) => {
      let draggedItem: InventoryCard | null = null;

      const zonesWithoutItem = currentZones.map((zone) => {
        if (!draggedItem && zone.items.some((item) => item.id === draggedCardId)) {
          const item = zone.items.find(
            (candidate) => candidate.id === draggedCardId,
          );
          if (item) {
            draggedItem = item;
          }

          return {
            ...zone,
            items: zone.items.filter((itemCandidate) => itemCandidate.id !== draggedCardId),
          };
        }

        return zone;
      });

      if (!draggedItem) return currentZones;

      const updatedZones = zonesWithoutItem.map((zone) =>
        zone.id === zoneId
          ? {
              ...zone,
              items: [...zone.items, draggedItem as InventoryCard],
            }
          : zone,
      );

      return updatedZones;
    });

    setDraggedCardId(null);
    setActiveZoneId(null);
  };

  const usedSlotsForZone = (zone: CabinetZone): number => zone.items.length;

  const usedPercentageForZone = (zone: CabinetZone): number => {
    if (!zone.capacity) return 0;
    return Math.min(
      100,
      Math.round((usedSlotsForZone(zone) / zone.capacity) * 100),
    );
  };

  return (
    <section aria-label="Cabinet layout board" className="space-y-3">
      <div className="flex items-baseline justify-between gap-2">
        <div className="space-y-1">
          <h2 className="text-sm font-medium text-emerald-900 sm:text-base">
            Cabinets layout
          </h2>
          <p className="text-xs font-light text-slate-600 sm:text-sm">
            Drag inventory groups between cabinets to explore different physical layouts. All changes are local to this mock view.
          </p>
        </div>
        <div className="hidden items-center gap-2 text-[11px] font-light text-slate-600 md:flex">
          <ArrowsLeftRight size={14} weight="bold" className="text-emerald-800" />
          <span>Drag cards between cabinets to simulate moves.</span>
        </div>
      </div>
      <div className="rounded-2xl border border-emerald-100 bg-white px-3 py-3 shadow-sm shadow-emerald-900/5 md:px-4 md:py-4">
        <div className="mb-3 flex flex-wrap items-center justify-between gap-3">
          <div className="inline-flex items-center gap-2 rounded-full bg-emerald-50 px-3 py-1 text-[11px] font-normal text-emerald-800">
            <ShieldCheck size={14} weight="bold" />
            <span>
              {usedSlots} of {totalSlots} virtual cabinet slots in use
            </span>
          </div>
          <p className="text-[11px] font-light text-slate-500">
            This board is for planning only and does not persist any data.
          </p>
        </div>
        <div className="grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-4">
          {zones.map((zone) => {
            const usedSlotsZone = usedSlotsForZone(zone);
            const usedPercent = usedPercentageForZone(zone);
            const isActive = activeZoneId === zone.id;

            return (
              <section
                key={zone.id}
                aria-label={`${zone.title} cabinet column`}
                className={`flex flex-col rounded-2xl border bg-emerald-50/40 px-2.5 py-2.5 transition-colors md:px-3 md:py-3 ${
                  isActive
                    ? "border-emerald-400 bg-emerald-50"
                    : "border-emerald-100"
                }`}
              >
                <header className="mb-2 flex items-start justify-between gap-2">
                  <div className="space-y-0.5">
                    <h3 className="text-xs font-medium text-emerald-900 sm:text-sm">
                      {zone.title}
                    </h3>
                    <p className="text-[11px] font-light text-slate-600">
                      {zone.description}
                    </p>
                  </div>
                  <div className="flex flex-col items-end gap-1">
                    <div className="inline-flex items-center gap-1 rounded-full bg-white/70 px-2 py-0.5 text-[10px] font-normal text-slate-700">
                      <span className="text-emerald-900">
                        {usedSlotsZone}/{zone.capacity}
                      </span>
                      <span className="text-slate-400">slots</span>
                    </div>
                    <div className="h-1.5 w-20 rounded-full bg-emerald-100">
                      <div
                        className="h-1.5 rounded-full bg-emerald-500"
                        style={{ width: `${usedPercent}%` }}
                        aria-hidden
                      />
                    </div>
                  </div>
                </header>
                <div
                  className={`flex flex-1 flex-col gap-2 rounded-xl border border-dashed bg-white/80 p-2 transition-colors ${
                    isActive ? "border-emerald-400/80" : "border-emerald-100"
                  }`}
                  onDragOver={(event): void => handleDragOver(event, zone.id)}
                  onDrop={(): void => handleDrop(zone.id)}
                  onDragLeave={(): void => handleDragLeave(zone.id)}
                  aria-label={`${zone.title} drop zone`}
                >
                  {zone.items.length === 0 ? (
                    <p className="flex flex-1 items-center justify-center rounded-lg border border-dashed border-emerald-100 bg-emerald-50/60 px-2 py-4 text-center text-[11px] font-light text-emerald-700">
                      Drop any inventory card here to simulate placement in this cabinet.
                    </p>
                  ) : (
                    zone.items.map((item) => (
                      <article
                        key={item.id}
                        draggable
                        onDragStart={(event): void =>
                          handleDragStart(event, item.id)
                        }
                        className={`cursor-grab rounded-xl border bg-white px-2.5 py-2 shadow-sm shadow-emerald-900/5 transition-transform hover:-translate-y-0.5 hover:shadow-md ${
                          draggedCardId === item.id ? "opacity-80" : ""
                        }`}
                        aria-label={`${item.code} ${item.name}`}
                      >
                        <div className="flex items-start gap-2">
                          <div className="mt-0.5 inline-flex h-7 w-7 items-center justify-center rounded-lg bg-emerald-50 text-emerald-900">
                            {getItemIcon(item)}
                          </div>
                          <div className="flex-1 space-y-0.5">
                            <div className="flex items-center justify-between gap-1">
                              <p className="text-[11px] font-normal text-emerald-900">
                                {item.code}
                              </p>
                              <span className="text-[10px] font-light text-slate-500">
                                {item.units.toLocaleString()} units
                              </span>
                            </div>
                            <p className="truncate text-[11px] font-light text-slate-700">
                              {item.name}
                            </p>
                            <div className="mt-1 flex flex-wrap items-center gap-1.5">
                              <span
                                className={`inline-flex items-center gap-1 rounded-full border px-1.5 py-0.5 text-[10px] font-normal ${getPriorityClasses(
                                  item.priority,
                                )}`}
                              >
                                <WarningCircle size={11} weight="bold" />
                                <span>{getPriorityLabel(item.priority)}</span>
                              </span>
                              <span
                                className={`inline-flex items-center gap-1 rounded-full border px-1.5 py-0.5 text-[10px] font-normal ${getStatusClasses(
                                  item.status,
                                )}`}
                              >
                                <span className="h-1.5 w-1.5 rounded-full bg-current" />
                                <span>{getStatusLabel(item.status)}</span>
                              </span>
                            </div>
                          </div>
                        </div>
                      </article>
                    ))
                  )}
                </div>
              </section>
            );
          })}
        </div>
      </div>
    </section>
  );
};

