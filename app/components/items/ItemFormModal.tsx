"use client";

import type { JSX } from "react";
import { useEffect, useState } from "react";
import { X, Package, Files, Stack } from "@phosphor-icons/react";
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
  unit: "pieces",
  stockAmount: 0,
  stockYear: new Date().getFullYear(),
};

const UNITS: Array<{ value: "box" | "pieces" | "ream"; label: string; icon: JSX.Element }> = [
  { value: "box", label: "Box(es)", icon: <Package size={18} weight="regular" /> },
  { value: "pieces", label: "Pieces", icon: <Stack size={18} weight="regular" /> },
  { value: "ream", label: "Ream(s)", icon: <Files size={18} weight="regular" /> },
];

export function ItemFormModal({
  isOpen,
  onClose,
  mode,
  initialValues,
  onSubmit,
  isSubmitting,
  error,
}: ItemFormModalProps): JSX.Element | null {
  const [selectedUnit, setSelectedUnit] = useState<"box" | "pieces" | "ream">(initialValues?.unit || "pieces");

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>): void => {
    e.preventDefault();
    const form = e.currentTarget;
    const formData = new FormData(form);
    const values: CreateItemInput = {
      sku: `ITEM-${Date.now()}`, // Auto-generate SKU
      name: (formData.get("name") as string)?.trim() ?? "",
      unit: selectedUnit,
      stockAmount: Number(formData.get("stockAmount")),
      stockYear: new Date().getFullYear(), // Auto-set to current year
    };

    if (mode === "create") {
      onSubmit(values);
    } else {
      const updates: UpdateItemInput = {};
      if (values.name) updates.name = values.name;
      if (values.unit) updates.unit = values.unit;
      if (values.stockAmount !== undefined) updates.stockAmount = values.stockAmount;
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
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4"
      aria-modal
      aria-labelledby="item-form-title"
      role="dialog"
      onKeyDown={handleKeyDown}
    >
      <div
        className="relative w-full max-w-lg rounded-2xl bg-white shadow-2xl border border-slate-200/50"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-8 py-6 border-b border-slate-100">
          <div>
            <h2
              id="item-form-title"
              className="text-xl font-semibold text-slate-900"
            >
              {mode === "create" ? "Add New Item" : "Edit Item"}
            </h2>
            <p className="text-sm text-slate-500 mt-1">
              {mode === "create" ? "Create a new inventory item" : "Update item details"}
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="flex h-10 w-10 items-center justify-center rounded-full text-slate-400 transition-all hover:bg-slate-100 hover:text-slate-600 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2"
            aria-label="Close"
          >
            <X size={20} weight="regular" aria-hidden />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="px-8 py-6">
          <div className="space-y-6">
            {/* Name Field */}
            <div className="space-y-2">
              <label
                htmlFor="item-name"
                className="block text-sm font-medium text-slate-700"
              >
                Item Name
              </label>
              <input
                id="item-name"
                name="name"
                type="text"
                required
                defaultValue={values.name}
                placeholder="Enter item name..."
                className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-slate-900 placeholder:text-slate-400 focus:border-emerald-500 focus:outline-none focus:ring-4 focus:ring-emerald-500/10 transition-all"
                disabled={isSubmitting}
                autoComplete="off"
              />
            </div>

            {/* Stock Amount Field */}
            <div className="space-y-2">
              <label
                htmlFor="item-stock-amount"
                className="block text-sm font-medium text-slate-700"
              >
                Stock Amount
              </label>
              <input
                id="item-stock-amount"
                name="stockAmount"
                type="number"
                min={0}
                required
                defaultValue={values.stockAmount}
                placeholder="Enter stock amount..."
                className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-slate-900 placeholder:text-slate-400 focus:border-emerald-500 focus:outline-none focus:ring-4 focus:ring-emerald-500/10 transition-all"
                disabled={isSubmitting}
              />
            </div>

            {/* Unit Selection */}
            <div className="space-y-3">
              <label className="block text-sm font-medium text-slate-700">
                Unit of Measurement
              </label>
              <div className="flex gap-3">
                {UNITS.map((unit) => (
                  <button
                    key={unit.value}
                    type="button"
                    onClick={() => setSelectedUnit(unit.value)}
                    className={`flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-xl border-2 transition-all ${
                      selectedUnit === unit.value
                        ? "border-emerald-500 bg-emerald-50 text-emerald-700"
                        : "border-slate-200 bg-white text-slate-600 hover:border-slate-300 hover:bg-slate-50"
                    }`}
                    disabled={isSubmitting}
                  >
                    <span className="flex-shrink-0">{unit.icon}</span>
                    <span className="text-sm font-medium">{unit.label}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>

          {error && (
            <div className="mt-6 p-4 rounded-xl bg-red-50 border border-red-200">
              <p className="text-sm text-red-600" role="alert">
                {error}
              </p>
            </div>
          )}

          {/* Footer */}
          <div className="flex justify-end gap-3 mt-8 pt-6 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-2.5 rounded-xl border border-slate-200 text-slate-600 font-medium transition-all hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-slate-300 focus:ring-offset-2"
              disabled={isSubmitting}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-6 py-2.5 rounded-xl bg-emerald-600 text-white font-medium transition-all hover:bg-emerald-700 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2 disabled:opacity-60 disabled:cursor-not-allowed shadow-lg shadow-emerald-600/25"
              disabled={isSubmitting}
            >
              {isSubmitting
                ? (
                  <div className="flex items-center gap-2">
                    <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                    <span>Saving...</span>
                  </div>
                )
                : mode === "create"
                  ? "Create Item"
                  : "Save Changes"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
