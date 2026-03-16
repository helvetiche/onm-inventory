"use client";

import type { JSX } from "react";
import { useEffect } from "react";
import { X, ArrowRight, ArrowLeft, ArrowsClockwise } from "@phosphor-icons/react";
import type { ItemDetailResponse } from "@/lib/hooks/use-item";

type ItemDetailDrawerProps = {
  isOpen: boolean;
  onClose: () => void;
  data: ItemDetailResponse | null;
  isLoading: boolean;
  onEdit: () => void;
};

const formatDate = (d: Date): string =>
  new Intl.DateTimeFormat("en-US", {
    dateStyle: "medium",
  }).format(new Date(d));

const MOVEMENT_TYPE_LABELS: Record<string, string> = {
  IN: "In",
  OUT: "Out",
  ADJUSTMENT: "Adjust",
};

const MOVEMENT_TYPE_ICONS: Record<string, typeof ArrowRight> = {
  IN: ArrowRight,
  OUT: ArrowLeft,
  ADJUSTMENT: ArrowsClockwise,
};

export function ItemDetailDrawer({
  isOpen,
  onClose,
  data,
  isLoading,
  onEdit,
}: ItemDetailDrawerProps): JSX.Element | null {
  const handleKeyDown = (e: React.KeyboardEvent): void => {
    if (e.key === "Escape") {
      onClose();
    }
  };

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex justify-end"
      aria-modal
      aria-labelledby="item-detail-title"
      role="dialog"
      onKeyDown={handleKeyDown}
    >
      <button
        type="button"
        onClick={onClose}
        className="absolute inset-0 bg-slate-900/40"
        aria-label="Close drawer"
      />
      <div
        className="relative flex h-full w-full max-w-md flex-col border-l border-slate-100 bg-white shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between border-b border-slate-100 px-6 py-4">
          <h2
            id="item-detail-title"
            className="text-base font-medium text-emerald-900"
          >
            Item details
          </h2>
          <div className="flex items-center gap-2">
            {data && (
              <button
                type="button"
                onClick={onEdit}
                className="rounded-md border border-emerald-900 px-3 py-2 text-[13px] font-medium text-emerald-900 transition-colors hover:bg-emerald-50 focus:outline-none focus:ring-2 focus:ring-emerald-300 focus:ring-offset-2"
              >
                Edit
              </button>
            )}
            <button
              type="button"
              onClick={onClose}
              className="flex h-9 w-9 items-center justify-center rounded-md text-slate-500 transition-colors hover:bg-slate-100 hover:text-emerald-900 focus:outline-none focus:ring-2 focus:ring-emerald-300 focus:ring-offset-2"
              aria-label="Close"
            >
              <X size={20} weight="regular" aria-hidden />
            </button>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-6">
          {isLoading && (
            <p className="text-[14px] text-slate-500">Loading...</p>
          )}

          {!isLoading && data && (
            <div className="space-y-6">
              <section>
                <h3 className="mb-3 text-[12px] font-medium uppercase tracking-wider text-emerald-900/60">
                  General
                </h3>
                <dl className="space-y-2 text-[14px]">
                  <div>
                    <dt className="text-slate-500">SKU</dt>
                    <dd className="font-medium text-emerald-900">
                      {data.item.sku}
                    </dd>
                  </div>
                  <div>
                    <dt className="text-slate-500">Name</dt>
                    <dd className="font-medium text-emerald-900">
                      {data.item.name}
                    </dd>
                  </div>
                  {data.item.description && (
                    <div>
                      <dt className="text-slate-500">Description</dt>
                      <dd className="text-emerald-900">
                        {data.item.description}
                      </dd>
                    </div>
                  )}
                  {data.item.category && (
                    <div>
                      <dt className="text-slate-500">Category</dt>
                      <dd className="text-emerald-900">
                        {data.item.category}
                      </dd>
                    </div>
                  )}
                  <div>
                    <dt className="text-slate-500">Unit</dt>
                    <dd className="text-emerald-900">{data.item.unit}</dd>
                  </div>
                  <div>
                    <dt className="text-slate-500">Stock period</dt>
                    <dd className="text-emerald-900">
                      {data.item.stockMonth}/{data.item.stockYear}
                    </dd>
                  </div>
                  <div>
                    <dt className="text-slate-500">Requested</dt>
                    <dd className="text-emerald-900">
                      {data.item.requestedQuantity}
                    </dd>
                  </div>
                  <div>
                    <dt className="text-slate-500">Received</dt>
                    <dd className="text-emerald-900">
                      {data.item.receivedQuantity}
                    </dd>
                  </div>
                  <div>
                    <dt className="text-slate-500">Remaining</dt>
                    <dd className="font-medium text-emerald-900">
                      {(data.item.requestedQuantity ?? 0) - (data.item.receivedQuantity ?? 0)}
                    </dd>
                  </div>
                  <div>
                    <dt className="text-slate-500">Status</dt>
                    <dd>
                      <span
                        className={`inline-flex items-center rounded-full px-2 py-0.5 text-[12px] font-medium ${
                          data.item.isActive
                            ? "bg-emerald-100 text-emerald-800"
                            : "bg-slate-100 text-slate-600"
                        }`}
                      >
                        {data.item.isActive ? "Active" : "Inactive"}
                      </span>
                    </dd>
                  </div>
                  <div>
                    <dt className="text-slate-500">Created</dt>
                    <dd className="text-emerald-900">
                      {formatDate(data.item.createdAt)}
                    </dd>
                  </div>
                </dl>
              </section>

              {data.levels.length > 0 && (
                <section>
                  <h3 className="mb-3 text-[12px] font-medium uppercase tracking-wider text-emerald-900/60">
                    Stock levels
                  </h3>
                  <div className="space-y-2">
                    {data.levels.map((level) => (
                      <div
                        key={level.id}
                        className="flex items-center justify-between rounded-md border border-slate-100 bg-slate-50/50 px-4 py-3"
                      >
                        <span className="text-[13px] text-slate-600">
                          Location {level.locationId.slice(0, 8)}...
                        </span>
                        <span className="font-medium text-emerald-900">
                          {level.quantity} {data.item.unit}
                        </span>
                      </div>
                    ))}
                  </div>
                </section>
              )}

              {data.movements.length > 0 && (
                <section>
                  <h3 className="mb-3 text-[12px] font-medium uppercase tracking-wider text-emerald-900/60">
                    Recent movements
                  </h3>
                  <div className="space-y-2">
                    {data.movements.slice(0, 10).map((mov) => {
                      const Icon =
                        MOVEMENT_TYPE_ICONS[mov.type] ?? ArrowsClockwise;
                      const label =
                        MOVEMENT_TYPE_LABELS[mov.type] ?? mov.type;
                      return (
                        <div
                          key={mov.id}
                          className="flex items-center gap-3 rounded-md border border-slate-100 bg-white px-4 py-3"
                        >
                          <div
                            className={`flex h-8 w-8 items-center justify-center rounded-md ${
                              mov.type === "IN"
                                ? "bg-emerald-100"
                                : mov.type === "OUT"
                                  ? "bg-amber-100"
                                  : "bg-slate-100"
                            }`}
                          >
                            <Icon
                              size={16}
                              weight="regular"
                              className={
                                mov.type === "IN"
                                  ? "text-emerald-700"
                                  : mov.type === "OUT"
                                    ? "text-amber-700"
                                    : "text-slate-600"
                              }
                              aria-hidden
                            />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-[13px] font-medium text-emerald-900">
                              {label} {mov.quantity} {data.item.unit}
                            </p>
                            <p className="truncate text-[12px] text-slate-500">
                              {formatDate(mov.createdAt)}
                              {mov.reference ? ` · ${mov.reference}` : ""}
                            </p>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </section>
              )}

              {data.levels.length === 0 && data.movements.length === 0 && (
                <p className="text-[14px] text-slate-500">
                  No stock levels or movements yet.
                </p>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
