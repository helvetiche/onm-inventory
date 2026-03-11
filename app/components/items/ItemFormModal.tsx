"use client";

import type { JSX } from "react";
import { useEffect } from "react";
import { X } from "@phosphor-icons/react";
import type { CreateItemInput } from "@/lib/hooks/use-items";
import type { UpdateItemInput } from "@/lib/hooks/use-item";

type ItemFormModalProps = {
  isOpen: boolean;
  onClose: () => void;
  mode: "create" | "edit";
  initialValues?: Partial<CreateItemInput>;
  onSubmit: (values: CreateItemInput | UpdateItemInput) => void;
  isSubmitting: boolean;
  error: string | null;
};

const DEFAULT_VALUES: CreateItemInput = {
  sku: "",
  name: "",
  description: "",
  category: "",
  unit: "pcs",
  stockMonth: new Date().getMonth() + 1,
  stockYear: new Date().getFullYear(),
  requestedQuantity: 0,
  receivedQuantity: 0,
};

const UNITS = ["pcs", "kg", "g", "L", "mL", "m", "box", "pack", "unit"];

export function ItemFormModal({
  isOpen,
  onClose,
  mode,
  initialValues,
  onSubmit,
  isSubmitting,
  error,
}: ItemFormModalProps): JSX.Element | null {
  const handleSubmit = (e: React.FormEvent<HTMLFormElement>): void => {
    e.preventDefault();
    const form = e.currentTarget;
    const formData = new FormData(form);
    const values: CreateItemInput = {
      sku: (formData.get("sku") as string)?.trim() ?? "",
      name: (formData.get("name") as string)?.trim() ?? "",
      description: (formData.get("description") as string)?.trim() || undefined,
      category: (formData.get("category") as string)?.trim() || undefined,
      unit: (formData.get("unit") as string) || "pcs",
      stockMonth: Number(formData.get("stockMonth")),
      stockYear: Number(formData.get("stockYear")),
      requestedQuantity: Number(formData.get("requestedQuantity") ?? 0),
      receivedQuantity: Number(formData.get("receivedQuantity") ?? 0),
    };

    if (mode === "create") {
      onSubmit(values);
    } else {
      const updates: UpdateItemInput = {};
      if (values.sku) updates.sku = values.sku;
      if (values.name) updates.name = values.name;
      if (values.description !== undefined) updates.description = values.description;
      if (values.category !== undefined) updates.category = values.category;
      if (values.unit) updates.unit = values.unit;
      if (values.stockMonth !== undefined) updates.stockMonth = values.stockMonth;
      if (values.stockYear !== undefined) updates.stockYear = values.stockYear;
      if (values.requestedQuantity !== undefined) {
        updates.requestedQuantity = values.requestedQuantity;
      }
      if (values.receivedQuantity !== undefined) {
        updates.receivedQuantity = values.receivedQuantity;
      }
      onSubmit(updates);
    }
  };

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

  const values = { ...DEFAULT_VALUES, ...initialValues };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 p-4"
      aria-modal
      aria-labelledby="item-form-title"
      role="dialog"
      onKeyDown={handleKeyDown}
    >
      <div
        className="relative w-full max-w-md rounded-lg border border-slate-100 bg-white shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between border-b border-slate-100 px-6 py-4">
          <h2
            id="item-form-title"
            className="text-base font-medium text-emerald-900"
          >
            {mode === "create" ? "Add item" : "Edit item"}
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="flex h-9 w-9 items-center justify-center rounded-md text-slate-500 transition-colors hover:bg-slate-100 hover:text-emerald-900 focus:outline-none focus:ring-2 focus:ring-emerald-300 focus:ring-offset-2"
            aria-label="Close"
          >
            <X size={20} weight="regular" aria-hidden />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6">
          <div className="space-y-4">
            <div>
              <label
                htmlFor="item-sku"
                className="mb-1.5 block text-[13px] font-normal text-emerald-900"
              >
                SKU
              </label>
              <input
                id="item-sku"
                name="sku"
                type="text"
                required
                defaultValue={values.sku}
                placeholder="e.g. SKU-001"
                className="w-full rounded-md border border-slate-200 bg-white px-3 py-2.5 text-[14px] text-emerald-900 placeholder:text-slate-400 focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                disabled={isSubmitting}
                autoComplete="off"
              />
            </div>

            <div>
              <label
                htmlFor="item-name"
                className="mb-1.5 block text-[13px] font-normal text-emerald-900"
              >
                Name
              </label>
              <input
                id="item-name"
                name="name"
                type="text"
                required
                defaultValue={values.name}
                placeholder="Item name"
                className="w-full rounded-md border border-slate-200 bg-white px-3 py-2.5 text-[14px] text-emerald-900 placeholder:text-slate-400 focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                disabled={isSubmitting}
                autoComplete="off"
              />
            </div>

            <div>
              <label
                htmlFor="item-description"
                className="mb-1.5 block text-[13px] font-normal text-emerald-900"
              >
                Description
              </label>
              <textarea
                id="item-description"
                name="description"
                rows={2}
                defaultValue={values.description}
                placeholder="Optional description"
                className="w-full rounded-md border border-slate-200 bg-white px-3 py-2.5 text-[14px] text-emerald-900 placeholder:text-slate-400 focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                disabled={isSubmitting}
              />
            </div>

            <div>
              <label
                htmlFor="item-category"
                className="mb-1.5 block text-[13px] font-normal text-emerald-900"
              >
                Category
              </label>
              <input
                id="item-category"
                name="category"
                type="text"
                defaultValue={values.category}
                placeholder="e.g. Electronics"
                className="w-full rounded-md border border-slate-200 bg-white px-3 py-2.5 text-[14px] text-emerald-900 placeholder:text-slate-400 focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                disabled={isSubmitting}
                autoComplete="off"
              />
            </div>

            <div>
              <label
                htmlFor="item-unit"
                className="mb-1.5 block text-[13px] font-normal text-emerald-900"
              >
                Unit
              </label>
              <select
                id="item-unit"
                name="unit"
                required
                defaultValue={values.unit}
                className="w-full rounded-md border border-slate-200 bg-white px-3 py-2.5 text-[14px] text-emerald-900 focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                disabled={isSubmitting}
              >
                {UNITS.map((u) => (
                  <option key={u} value={u}>
                    {u}
                  </option>
                ))}
              </select>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label
                  htmlFor="item-stock-month"
                  className="mb-1.5 block text-[13px] font-normal text-emerald-900"
                >
                  Stock Month
                </label>
                <input
                  id="item-stock-month"
                  name="stockMonth"
                  type="number"
                  min={1}
                  max={12}
                  required
                  defaultValue={values.stockMonth}
                  className="w-full rounded-md border border-slate-200 bg-white px-3 py-2.5 text-[14px] text-emerald-900 placeholder:text-slate-400 focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                  disabled={isSubmitting}
                />
              </div>
              <div>
                <label
                  htmlFor="item-stock-year"
                  className="mb-1.5 block text-[13px] font-normal text-emerald-900"
                >
                  Stock Year
                </label>
                <input
                  id="item-stock-year"
                  name="stockYear"
                  type="number"
                  min={2000}
                  max={9999}
                  required
                  defaultValue={values.stockYear}
                  className="w-full rounded-md border border-slate-200 bg-white px-3 py-2.5 text-[14px] text-emerald-900 placeholder:text-slate-400 focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                  disabled={isSubmitting}
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label
                  htmlFor="item-requested-quantity"
                  className="mb-1.5 block text-[13px] font-normal text-emerald-900"
                >
                  Requested
                </label>
                <input
                  id="item-requested-quantity"
                  name="requestedQuantity"
                  type="number"
                  min={0}
                  required
                  defaultValue={values.requestedQuantity}
                  className="w-full rounded-md border border-slate-200 bg-white px-3 py-2.5 text-[14px] text-emerald-900 placeholder:text-slate-400 focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                  disabled={isSubmitting}
                />
              </div>
              <div>
                <label
                  htmlFor="item-received-quantity"
                  className="mb-1.5 block text-[13px] font-normal text-emerald-900"
                >
                  Received
                </label>
                <input
                  id="item-received-quantity"
                  name="receivedQuantity"
                  type="number"
                  min={0}
                  required
                  defaultValue={values.receivedQuantity}
                  className="w-full rounded-md border border-slate-200 bg-white px-3 py-2.5 text-[14px] text-emerald-900 placeholder:text-slate-400 focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                  disabled={isSubmitting}
                />
              </div>
            </div>
          </div>

          {error && (
            <p
              className="mt-4 text-[13px] text-red-600"
              role="alert"
            >
              {error}
            </p>
          )}

          <div className="mt-6 flex justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="rounded-md border border-slate-200 px-4 py-2 text-[14px] font-normal text-emerald-900 transition-colors hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-emerald-300 focus:ring-offset-2"
              disabled={isSubmitting}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="rounded-md bg-emerald-900 px-4 py-2 text-[14px] font-medium text-white transition-colors hover:bg-emerald-800 focus:outline-none focus:ring-2 focus:ring-emerald-300 focus:ring-offset-2 disabled:opacity-60"
              disabled={isSubmitting}
            >
              {isSubmitting
                ? "Saving..."
                : mode === "create"
                  ? "Create"
                  : "Save"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
