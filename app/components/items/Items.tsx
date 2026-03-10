"use client";

import type { JSX } from "react";
import { useState, useMemo } from "react";
import {
  MagnifyingGlass,
  Plus,
  DotsThree,
  Eye,
  PencilSimple,
  Archive,
  ArchiveBox,
  CaretUp,
  CaretDown,
} from "@phosphor-icons/react";
import type { InventoryItem } from "@/lib/db/types";
import {
  useItemsQuery,
  useCreateItemMutation,
  type CreateItemInput,
} from "@/lib/hooks/use-items";
import {
  useItemQuery,
  useUpdateItemMutation,
  useToggleItemActiveMutation,
  type UpdateItemInput,
} from "@/lib/hooks/use-item";
import { ItemFormModal } from "./ItemFormModal";
import { ItemDetailDrawer } from "./ItemDetailDrawer";

type SortField = "sku" | "name" | "category" | "unit" | "createdAt";
type SortDir = "asc" | "desc";

const formatDate = (d: Date): string =>
  new Intl.DateTimeFormat("en-US", {
    dateStyle: "short",
  }).format(new Date(d));

const filterItems = (
  items: InventoryItem[],
  search: string,
  categoryFilter: string
): InventoryItem[] => {
  let result = items;

  if (search.trim()) {
    const q = search.toLowerCase();
    result = result.filter(
      (item) =>
        item.sku.toLowerCase().includes(q) ||
        item.name.toLowerCase().includes(q) ||
        (item.category?.toLowerCase().includes(q) ?? false)
    );
  }

  if (categoryFilter) {
    result = result.filter((item) => item.category === categoryFilter);
  }

  return result;
};

const sortItems = (
  items: InventoryItem[],
  field: SortField,
  dir: SortDir
): InventoryItem[] => {
  return [...items].sort((a, b) => {
    const aVal = a[field];
    const bVal = b[field];

    if (typeof aVal === "string" && typeof bVal === "string") {
      const cmp = aVal.localeCompare(bVal);
      return dir === "asc" ? cmp : -cmp;
    }

    if (aVal instanceof Date && bVal instanceof Date) {
      const cmp = aVal.getTime() - bVal.getTime();
      return dir === "asc" ? cmp : -cmp;
    }

    return 0;
  });
};

export function Items(): JSX.Element {
  const { data: items = [], isLoading, error } = useItemsQuery();
  const createMutation = useCreateItemMutation();

  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("");
  const [sortField, setSortField] = useState<SortField>("name");
  const [sortDir, setSortDir] = useState<SortDir>("asc");

  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [detailItemId, setDetailItemId] = useState<string | null>(null);
  const [editItemId, setEditItemId] = useState<string | null>(null);
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);

  const { data: detailData, isLoading: detailLoading } = useItemQuery(
    detailItemId
  );
  const updateMutation = useUpdateItemMutation(editItemId);
  const toggleMutation = useToggleItemActiveMutation();

  const categories = useMemo(() => {
    const set = new Set<string>();
    items.forEach((i) => {
      if (i.category) set.add(i.category);
    });
    return Array.from(set).sort();
  }, [items]);

  const filteredItems = useMemo(
    () => sortItems(filterItems(items, search, categoryFilter), sortField, sortDir),
    [items, search, categoryFilter, sortField, sortDir]
  );

  const activeCount = useMemo(
    () => items.filter((i) => i.isActive).length,
    [items]
  );

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    } else {
      setSortField(field);
      setSortDir("asc");
    }
  };

  const handleCreateSubmit = (values: CreateItemInput) => {
    createMutation.mutate(values, {
      onSuccess: () => {
        setIsCreateModalOpen(false);
      },
    });
  };

  const handleEditSubmit = (values: UpdateItemInput) => {
    if (!editItemId) return;
    updateMutation.mutate(values, {
      onSuccess: () => {
        setEditItemId(null);
        setDetailItemId(null);
      },
    });
  };

  const handleToggleActive = (id: string) => {
    toggleMutation.mutate(id, {
      onSuccess: () => {
        setOpenMenuId(null);
        if (detailItemId === id) setDetailItemId(null);
      },
    });
  };

  const handleEditFromDetail = () => {
    if (detailItemId) {
      setEditItemId(detailItemId);
      setDetailItemId(null);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-4">
          <h1 className="text-lg font-medium tracking-tight text-emerald-900">
            Items
          </h1>
          <span className="rounded-full bg-emerald-50 px-3 py-1 text-[13px] font-normal text-emerald-800">
            {items.length} total · {activeCount} active
          </span>
        </div>
        <button
          type="button"
          onClick={() => setIsCreateModalOpen(true)}
          className="inline-flex items-center gap-2 rounded-md bg-emerald-900 px-4 py-2.5 text-[14px] font-medium text-white transition-colors hover:bg-emerald-800 focus:outline-none focus:ring-2 focus:ring-emerald-300 focus:ring-offset-2"
        >
          <Plus size={18} weight="regular" aria-hidden />
          Add item
        </button>
      </div>

      <div className="flex flex-col gap-4 sm:flex-row">
        <div className="relative flex-1">
          <MagnifyingGlass
            size={18}
            weight="regular"
            className="absolute left-3 top-1/2 -translate-y-1/2 text-emerald-900/50"
            aria-hidden
          />
          <input
            type="search"
            placeholder="Search by SKU, name, or category..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full rounded-md border border-slate-200 bg-white py-2.5 pl-9 pr-4 text-[14px] text-emerald-900 placeholder:text-emerald-900/40 focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
            aria-label="Search items"
          />
        </div>
        <select
          value={categoryFilter}
          onChange={(e) => setCategoryFilter(e.target.value)}
          className="rounded-md border border-slate-200 bg-white px-4 py-2.5 text-[14px] text-emerald-900 focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500 sm:w-48"
          aria-label="Filter by category"
        >
          <option value="">All categories</option>
          {categories.map((c) => (
            <option key={c} value={c}>
              {c}
            </option>
          ))}
        </select>
      </div>

      <div className="overflow-hidden rounded-lg border border-slate-100 bg-white shadow-[0_1px_3px_0_rgba(0,0,0,0.05)]">
        {isLoading && (
          <div className="flex items-center justify-center py-16">
            <p className="text-[14px] text-slate-500">Loading items...</p>
          </div>
        )}

        {error && (
          <div className="px-6 py-4">
            <p className="text-[14px] text-red-600" role="alert">
              Failed to load items. Please try again.
            </p>
          </div>
        )}

        {!isLoading && !error && filteredItems.length === 0 && (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <p className="text-[14px] text-slate-500">
              {items.length === 0
                ? "No items yet. Add your first item to get started."
                : "No items match your search."}
            </p>
            {items.length === 0 && (
              <button
                type="button"
                onClick={() => setIsCreateModalOpen(true)}
                className="mt-4 inline-flex items-center gap-2 rounded-md bg-emerald-900 px-4 py-2.5 text-[14px] font-medium text-white hover:bg-emerald-800"
              >
                <Plus size={18} weight="regular" aria-hidden />
                Add item
              </button>
            )}
          </div>
        )}

        {!isLoading && !error && filteredItems.length > 0 && (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[640px]" role="grid">
              <thead>
                <tr className="border-b border-slate-100 bg-slate-50/50">
                  {(["sku", "name", "category", "unit", "status", "createdAt"] as const).map(
                    (field) => {
                      const label =
                        field === "createdAt" ? "Created" : field.charAt(0).toUpperCase() + field.slice(1);
                      const isSortable = ["sku", "name", "category", "unit", "createdAt"].includes(field);
                      const isActive = sortField === field;

                      return (
                        <th
                          key={field}
                          scope="col"
                          className="px-6 py-3 text-left text-[12px] font-medium uppercase tracking-wider text-emerald-900/70"
                        >
                          {isSortable ? (
                            <button
                              type="button"
                              onClick={() => handleSort(field as SortField)}
                              className="inline-flex items-center gap-1 hover:text-emerald-900 focus:outline-none focus:ring-2 focus:ring-emerald-300 focus:ring-offset-2 rounded"
                            >
                              {label}
                              {isActive &&
                                (sortDir === "asc" ? (
                                  <CaretUp size={14} weight="bold" aria-hidden />
                                ) : (
                                  <CaretDown size={14} weight="bold" aria-hidden />
                                ))}
                            </button>
                          ) : (
                            label
                          )}
                        </th>
                      );
                    }
                  )}
                  <th
                    scope="col"
                    className="w-12 px-6 py-3 text-right text-[12px] font-medium uppercase tracking-wider text-emerald-900/70"
                  >
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredItems.map((item) => (
                  <tr
                    key={item.id}
                    className="transition-colors hover:bg-slate-50/50"
                  >
                    <td className="px-6 py-4">
                      <span className="font-medium text-emerald-900">
                        {item.sku}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-[14px] text-emerald-900">
                      {item.name}
                    </td>
                    <td className="px-6 py-4 text-[14px] text-slate-600">
                      {item.category ?? "—"}
                    </td>
                    <td className="px-6 py-4 text-[14px] text-slate-600">
                      {item.unit}
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`inline-flex items-center rounded-full px-2 py-0.5 text-[12px] font-medium ${
                          item.isActive
                            ? "bg-emerald-100 text-emerald-800"
                            : "bg-slate-100 text-slate-600"
                        }`}
                      >
                        {item.isActive ? "Active" : "Inactive"}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-[14px] text-slate-600">
                      {formatDate(item.createdAt)}
                    </td>
                    <td className="relative px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          type="button"
                          onClick={() => setDetailItemId(item.id)}
                          className="flex h-8 w-8 items-center justify-center rounded-md text-slate-500 transition-colors hover:bg-slate-100 hover:text-emerald-900 focus:outline-none focus:ring-2 focus:ring-emerald-300 focus:ring-offset-2"
                          aria-label={`View ${item.name}`}
                        >
                          <Eye size={18} weight="regular" aria-hidden />
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            setEditItemId(item.id);
                            setOpenMenuId(null);
                          }}
                          className="flex h-8 w-8 items-center justify-center rounded-md text-slate-500 transition-colors hover:bg-slate-100 hover:text-emerald-900 focus:outline-none focus:ring-2 focus:ring-emerald-300 focus:ring-offset-2"
                          aria-label={`Edit ${item.name}`}
                        >
                          <PencilSimple size={18} weight="regular" aria-hidden />
                        </button>
                        <div className="relative">
                          <button
                            type="button"
                            onClick={() =>
                              setOpenMenuId(openMenuId === item.id ? null : item.id)
                            }
                            className="flex h-8 w-8 items-center justify-center rounded-md text-slate-500 transition-colors hover:bg-slate-100 hover:text-emerald-900 focus:outline-none focus:ring-2 focus:ring-emerald-300 focus:ring-offset-2"
                            aria-label="More actions"
                            aria-expanded={openMenuId === item.id}
                          >
                            <DotsThree size={20} weight="bold" aria-hidden />
                          </button>
                          {openMenuId === item.id && (
                            <>
                              <button
                                type="button"
                                onClick={() => setOpenMenuId(null)}
                                className="fixed inset-0 z-10"
                                aria-hidden
                              />
                              <div
                                className="absolute right-0 top-full z-20 mt-1 w-40 rounded-md border border-slate-100 bg-white py-1 shadow-lg"
                                role="menu"
                              >
                                <button
                                  type="button"
                                  onClick={() => handleToggleActive(item.id)}
                                  className="flex w-full items-center gap-2 px-4 py-2 text-left text-[13px] text-emerald-900 hover:bg-slate-50"
                                  role="menuitem"
                                >
                                  {item.isActive ? (
                                    <>
                                      <Archive size={16} weight="regular" aria-hidden />
                                      Deactivate
                                    </>
                                  ) : (
                                    <>
                                      <ArchiveBox size={16} weight="regular" aria-hidden />
                                      Activate
                                    </>
                                  )}
                                </button>
                              </div>
                            </>
                          )}
                        </div>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <ItemFormModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        mode="create"
        onSubmit={handleCreateSubmit}
        isSubmitting={createMutation.isPending}
        error={createMutation.error?.message ?? null}
      />

      <ItemFormModal
        isOpen={Boolean(editItemId)}
        onClose={() => setEditItemId(null)}
        mode="edit"
        initialValues={
          editItemId
            ? items.find((i) => i.id === editItemId) ?? undefined
            : undefined
        }
        onSubmit={handleEditSubmit}
        isSubmitting={updateMutation.isPending}
        error={updateMutation.error?.message ?? null}
      />

      <ItemDetailDrawer
        isOpen={Boolean(detailItemId)}
        onClose={() => setDetailItemId(null)}
        data={detailData ?? null}
        isLoading={detailLoading}
        onEdit={handleEditFromDetail}
      />
    </div>
  );
}
