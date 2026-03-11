"use client";

import type { JSX } from "react";
import { useState, useEffect, useCallback } from "react";
import {
  MagnifyingGlass,
  Plus,
  DotsThree,
  Eye,
  PencilSimple,
  Archive,
  Package,
  CaretLeft,
  CaretRight,
  Cube,
  Stack,
  Tag,
} from "@phosphor-icons/react";
import type { InventoryItem } from "@/lib/db/types";
import {
  useItemsQuery,
  useCategoriesQuery,
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

const PAGE_SIZE = 8;
const SEARCH_DEBOUNCE_MS = 300;
const MONTH_LABELS = [
  "Jan",
  "Feb",
  "Mar",
  "Apr",
  "May",
  "Jun",
  "Jul",
  "Aug",
  "Sep",
  "Oct",
  "Nov",
  "Dec",
] as const;

type StatCardBadge = {
  icon: React.ReactNode;
  label?: string;
};

type StatCardProps = {
  icon: React.ReactNode;
  title: string;
  count: number | string;
  badges: [StatCardBadge, StatCardBadge, StatCardBadge];
  description: string;
};

function StatCard({
  icon,
  title,
  count,
  badges,
  description,
}: StatCardProps): JSX.Element {
  const descWords = description.split(/\s+/).slice(0, 20).join(" ");
  return (
    <div className="rounded-lg border border-slate-100 bg-white p-5 shadow-[0_1px_3px_0_rgba(0,0,0,0.05)]">
      <div className="mb-3 flex items-center gap-2">
        <span className="flex h-9 w-9 items-center justify-center rounded-md bg-emerald-900/10 text-emerald-900">
          {icon}
        </span>
        <span className="text-[14px] font-medium text-emerald-900">{title}</span>
      </div>
      <p className="mb-3 text-2xl font-medium tracking-tight text-emerald-900">
        {count}
      </p>
      <div className="mb-3 flex flex-wrap gap-2">
        {badges.map((badge, i) => (
          <div
            key={i}
            className="flex items-center gap-1.5 rounded-md border border-slate-100 bg-slate-50/80 px-2.5 py-2"
          >
            <span className="flex h-6 w-6 items-center justify-center text-emerald-900/80">
              {badge.icon}
            </span>
            {badge.label && (
              <span className="max-w-[80px] truncate text-[12px] text-slate-600">
                {badge.label}
              </span>
            )}
          </div>
        ))}
      </div>
      <p className="text-[13px] leading-relaxed text-slate-500">{descWords}</p>
    </div>
  );
}

export function Items(): JSX.Element {
  const [searchInput, setSearchInput] = useState("");
  const [searchParam, setSearchParam] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("");
  const [page, setPage] = useState(1);

  const { data, isLoading, error } = useItemsQuery({
    limit: PAGE_SIZE,
    page,
    search: searchParam || null,
    category: categoryFilter || null,
  });
  const { data: categories = [] } = useCategoriesQuery();
  const createMutation = useCreateItemMutation();

  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [detailItemId, setDetailItemId] = useState<string | null>(null);
  const [editItemId, setEditItemId] = useState<string | null>(null);
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);

  const { data: detailData, isLoading: detailLoading } = useItemQuery(
    detailItemId
  );
  const updateMutation = useUpdateItemMutation(editItemId);
  const toggleMutation = useToggleItemActiveMutation();

  const items = data?.items ?? [];
  const totalPages = data?.totalPages ?? 1;
  const totalCount = data?.totalCount ?? 0;
  const currentPage = data?.page ?? 1;
  const activeCount = items.filter((i) => i.isActive).length;

  useEffect(() => {
    const t = setTimeout(() => {
      setSearchParam(searchInput.trim());
    }, SEARCH_DEBOUNCE_MS);
    return () => clearTimeout(t);
  }, [searchInput]);

  useEffect(() => {
    setPage(1);
  }, [searchParam, categoryFilter]);

  const getPageNumbers = (): (number | "ellipsis")[] => {
    if (totalPages <= 7) {
      return Array.from({ length: totalPages }, (_, i) => i + 1);
    }
    const result: (number | "ellipsis")[] = [];
    if (currentPage <= 4) {
      result.push(1, 2, 3, 4, 5, "ellipsis", totalPages);
    } else if (currentPage >= totalPages - 3) {
      result.push(
        1,
        "ellipsis",
        totalPages - 4,
        totalPages - 3,
        totalPages - 2,
        totalPages - 1,
        totalPages
      );
    } else {
      result.push(
        1,
        "ellipsis",
        currentPage - 1,
        currentPage,
        currentPage + 1,
        "ellipsis",
        totalPages
      );
    }
    return result;
  };

  const startItem = totalCount === 0 ? 0 : (currentPage - 1) * PAGE_SIZE + 1;
  const endItem = Math.min(currentPage * PAGE_SIZE, totalCount);

  const handleSearchChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchInput(e.target.value);
  }, []);

  const handleCategoryChange = useCallback((e: React.ChangeEvent<HTMLSelectElement>) => {
    setCategoryFilter(e.target.value);
  }, []);

  const handleCreateSubmit = (values: CreateItemInput | UpdateItemInput) => {
    createMutation.mutate(values as CreateItemInput, {
      onSuccess: () => {
        setIsCreateModalOpen(false);
      },
    });
  };

  const handleEditSubmit = (values: CreateItemInput | UpdateItemInput) => {
    if (!editItemId) return;
    updateMutation.mutate(values as UpdateItemInput, {
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
            {totalCount} total
            {activeCount > 0 ? ` · ${activeCount} active` : ""}
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

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <StatCard
          icon={<Package size={18} weight="regular" aria-hidden />}
          title="Total Items"
          count={isLoading ? "—" : totalCount}
          badges={[
            { icon: <Package size={14} weight="regular" aria-hidden /> },
            { icon: <Cube size={14} weight="regular" aria-hidden /> },
            { icon: <Stack size={14} weight="regular" aria-hidden /> },
          ]}
          description="The total count of inventory items in your product catalog across all categories and filters you have added so far."
        />
        <StatCard
          icon={<Archive size={18} weight="regular" aria-hidden />}
          title="Categories"
          count={categories.length}
          badges={[
            ...categories.slice(0, 3).map((c) => ({
              icon: <Tag size={14} weight="regular" aria-hidden />,
              label: c,
            })),
            ...Array.from({ length: Math.max(0, 3 - categories.length) }, () => ({
              icon: <Tag size={14} weight="regular" aria-hidden />,
              label: undefined,
            })),
          ].slice(0, 3) as [StatCardBadge, StatCardBadge, StatCardBadge]}
          description="The number of unique product categories that you use to organize and group your inventory items together in the system."
        />
        <StatCard
          icon={<MagnifyingGlass size={18} weight="regular" aria-hidden />}
          title="On This Page"
          count={items.length}
          badges={[
            { icon: <Eye size={14} weight="regular" aria-hidden /> },
            { icon: <PencilSimple size={14} weight="regular" aria-hidden /> },
            { icon: <DotsThree size={14} weight="regular" aria-hidden /> },
          ]}
          description="The number of items that are currently displayed on this page of results based on your pagination and filter settings."
        />
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
            placeholder="Search by name..."
            value={searchInput}
            onChange={handleSearchChange}
            className="w-full rounded-md border border-slate-200 bg-white py-2.5 pl-9 pr-4 text-[14px] text-emerald-900 placeholder:text-emerald-900/40 focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
            aria-label="Search items by name"
          />
        </div>
        <select
          value={categoryFilter}
          onChange={handleCategoryChange}
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
          <div className="overflow-x-auto">
            <table
              className="w-full min-w-[900px] table-fixed"
              role="grid"
            >
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50/50">
                  <th
                    scope="col"
                    className="w-[14%] border-r border-slate-200 px-4 py-3 text-left text-[12px] font-medium uppercase tracking-wider text-emerald-900/70"
                  >
                    SKU
                  </th>
                  <th
                    scope="col"
                    className="w-[18%] border-r border-slate-200 px-4 py-3 text-left text-[12px] font-medium uppercase tracking-wider text-emerald-900/70"
                  >
                    Name
                  </th>
                  <th
                    scope="col"
                    className="w-[14%] border-r border-slate-200 px-4 py-3 text-left text-[12px] font-medium uppercase tracking-wider text-emerald-900/70"
                  >
                    Category
                  </th>
                  <th
                    scope="col"
                    className="w-[12%] border-r border-slate-200 px-4 py-3 text-left text-[12px] font-medium uppercase tracking-wider text-emerald-900/70"
                  >
                    Month/Year
                  </th>
                  <th
                    scope="col"
                    className="w-[10%] border-r border-slate-200 px-4 py-3 text-right text-[12px] font-medium uppercase tracking-wider text-emerald-900/70"
                  >
                    Requested
                  </th>
                  <th
                    scope="col"
                    className="w-[10%] border-r border-slate-200 px-4 py-3 text-right text-[12px] font-medium uppercase tracking-wider text-emerald-900/70"
                  >
                    Received
                  </th>
                  <th
                    scope="col"
                    className="w-[10%] border-r border-slate-200 px-4 py-3 text-right text-[12px] font-medium uppercase tracking-wider text-emerald-900/70"
                  >
                    Remaining
                  </th>
                  <th
                    scope="col"
                    className="w-[12%] px-4 py-3 text-right text-[12px] font-medium uppercase tracking-wider text-emerald-900/70"
                  >
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {Array.from({ length: PAGE_SIZE }, (_, i) => (
                  <tr key={i} className="transition-colors hover:bg-slate-50/50">
                    <td className="border-r border-slate-100 px-4 py-4">
                      <div className="h-5 w-16 animate-pulse rounded bg-slate-200"></div>
                    </td>
                    <td className="border-r border-slate-100 px-4 py-4">
                      <div className="h-4 w-24 animate-pulse rounded bg-slate-200"></div>
                    </td>
                    <td className="border-r border-slate-100 px-4 py-4">
                      <div className="h-4 w-20 animate-pulse rounded bg-slate-200"></div>
                    </td>
                    <td className="border-r border-slate-100 px-4 py-4">
                      <div className="h-4 w-16 animate-pulse rounded bg-slate-200"></div>
                    </td>
                    <td className="border-r border-slate-100 px-4 py-4">
                      <div className="ml-auto h-4 w-12 animate-pulse rounded bg-slate-200"></div>
                    </td>
                    <td className="border-r border-slate-100 px-4 py-4">
                      <div className="ml-auto h-4 w-12 animate-pulse rounded bg-slate-200"></div>
                    </td>
                    <td className="border-r border-slate-100 px-4 py-4">
                      <div className="ml-auto h-4 w-12 animate-pulse rounded bg-slate-200"></div>
                    </td>
                    <td className="relative px-4 py-4 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <div className="h-8 w-8 animate-pulse rounded-md bg-slate-200"></div>
                        <div className="h-8 w-8 animate-pulse rounded-md bg-slate-200"></div>
                        <div className="h-8 w-8 animate-pulse rounded-md bg-slate-200"></div>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {error && (
          <div className="px-6 py-4">
            <p className="text-[14px] text-red-600" role="alert">
              Failed to load items. Please try again.
            </p>
          </div>
        )}

        {!isLoading && !error && items.length === 0 && (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <p className="text-[14px] text-slate-500">
              {searchParam || categoryFilter
                ? "No items match your search or filter."
                : "No items yet. Add your first item to get started."}
            </p>
            {!searchParam && !categoryFilter && (
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

        {!isLoading && !error && items.length > 0 && (
          <>
            <div className="overflow-x-auto">
              <table
                className="w-full min-w-[900px] table-fixed"
                role="grid"
              >
                <thead>
                  <tr className="border-b border-slate-200 bg-slate-50/50">
                    <th
                      scope="col"
                      className="w-[14%] border-r border-slate-200 px-4 py-3 text-left text-[12px] font-medium uppercase tracking-wider text-emerald-900/70"
                    >
                      SKU
                    </th>
                    <th
                      scope="col"
                      className="w-[18%] border-r border-slate-200 px-4 py-3 text-left text-[12px] font-medium uppercase tracking-wider text-emerald-900/70"
                    >
                      Name
                    </th>
                    <th
                      scope="col"
                      className="w-[14%] border-r border-slate-200 px-4 py-3 text-left text-[12px] font-medium uppercase tracking-wider text-emerald-900/70"
                    >
                      Category
                    </th>
                    <th
                      scope="col"
                      className="w-[12%] border-r border-slate-200 px-4 py-3 text-left text-[12px] font-medium uppercase tracking-wider text-emerald-900/70"
                    >
                      Month/Year
                    </th>
                    <th
                      scope="col"
                      className="w-[10%] border-r border-slate-200 px-4 py-3 text-right text-[12px] font-medium uppercase tracking-wider text-emerald-900/70"
                    >
                      Requested
                    </th>
                    <th
                      scope="col"
                      className="w-[10%] border-r border-slate-200 px-4 py-3 text-right text-[12px] font-medium uppercase tracking-wider text-emerald-900/70"
                    >
                      Received
                    </th>
                    <th
                      scope="col"
                      className="w-[10%] border-r border-slate-200 px-4 py-3 text-right text-[12px] font-medium uppercase tracking-wider text-emerald-900/70"
                    >
                      Remaining
                    </th>
                    <th
                      scope="col"
                      className="w-[12%] px-4 py-3 text-right text-[12px] font-medium uppercase tracking-wider text-emerald-900/70"
                    >
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {items.map((item) => (
                    <tr
                      key={item.id}
                      className="transition-colors hover:bg-slate-50/50"
                    >
                      <td className="border-r border-slate-100 px-4 py-4">
                        <span className="block truncate font-medium text-emerald-900">
                          {item.sku}
                        </span>
                      </td>
                      <td className="border-r border-slate-100 px-4 py-4 text-[14px] text-emerald-900">
                        <span className="block truncate">{item.name}</span>
                      </td>
                      <td className="border-r border-slate-100 px-4 py-4 text-[14px] text-slate-600">
                        <span className="block truncate">
                          {item.category ?? "—"}
                        </span>
                      </td>
                      <td className="border-r border-slate-100 px-4 py-4 text-[14px] text-slate-600">
                        <span className="block truncate">
                          {MONTH_LABELS[item.stockMonth - 1] ?? item.stockMonth}/
                          {item.stockYear}
                        </span>
                      </td>
                      <td className="border-r border-slate-100 px-4 py-4 text-right text-[14px] text-slate-600">
                        {item.requestedQuantity}
                      </td>
                      <td className="border-r border-slate-100 px-4 py-4 text-right text-[14px] text-slate-600">
                        {item.receivedQuantity}
                      </td>
                      <td className="border-r border-slate-100 px-4 py-4 text-right text-[14px] font-medium text-emerald-900">
                        {item.requestedQuantity - item.receivedQuantity}
                      </td>
                      <td className="relative px-4 py-4 text-right">
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
                            <PencilSimple
                              size={18}
                              weight="regular"
                              aria-hidden
                            />
                          </button>
                          <div className="relative">
                            <button
                              type="button"
                              onClick={() =>
                                setOpenMenuId(
                                  openMenuId === item.id ? null : item.id
                                )
                              }
                              className="flex h-8 w-8 items-center justify-center rounded-md text-slate-500 transition-colors hover:bg-slate-100 hover:text-emerald-900 focus:outline-none focus:ring-2 focus:ring-emerald-300 focus:ring-offset-2"
                              aria-label="More actions"
                              aria-expanded={openMenuId === item.id}
                            >
                              <DotsThree
                                size={20}
                                weight="bold"
                                aria-hidden
                              />
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
                                        <Archive
                                          size={16}
                                          weight="regular"
                                          aria-hidden
                                        />
                                        Deactivate
                                      </>
                                    ) : (
                                      <>
                                        <Package
                                          size={16}
                                          weight="regular"
                                          aria-hidden
                                        />
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
            {totalPages > 1 && (
              <div className="flex flex-col items-center justify-between gap-4 border-t border-slate-200 px-6 py-4 sm:flex-row">
                <p className="text-[13px] text-slate-500">
                  Showing {startItem}-{endItem} of {totalCount}
                </p>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setPage((p) => Math.max(1, p - 1))}
                    disabled={currentPage <= 1}
                    className="flex h-9 w-9 items-center justify-center rounded-md border border-slate-200 text-slate-600 transition-colors hover:bg-slate-50 disabled:pointer-events-none disabled:opacity-50"
                    aria-label="Previous page"
                  >
                    <CaretLeft size={18} weight="bold" aria-hidden />
                  </button>
                  <div className="flex items-center gap-1">
                    {getPageNumbers().map((n, i) =>
                      n === "ellipsis" ? (
                        <span
                          key={`ellipsis-${i}`}
                          className="px-2 text-slate-400"
                        >
                          ...
                        </span>
                      ) : (
                        <button
                          key={n}
                          type="button"
                          onClick={() => setPage(n)}
                          className={`flex h-9 min-w-[36px] items-center justify-center rounded-md px-2 text-[14px] font-medium transition-colors ${
                            currentPage === n
                              ? "bg-emerald-900 text-white"
                              : "border border-slate-200 text-emerald-900 hover:bg-emerald-50"
                          }`}
                          aria-current={currentPage === n ? "page" : undefined}
                          aria-label={`Page ${n}`}
                        >
                          {n}
                        </button>
                      )
                    )}
                  </div>
                  <button
                    type="button"
                    onClick={() =>
                      setPage((p) => Math.min(totalPages, p + 1))
                    }
                    disabled={currentPage >= totalPages}
                    className="flex h-9 w-9 items-center justify-center rounded-md border border-slate-200 text-slate-600 transition-colors hover:bg-slate-50 disabled:pointer-events-none disabled:opacity-50"
                    aria-label="Next page"
                  >
                    <CaretRight size={18} weight="bold" aria-hidden />
                  </button>
                </div>
              </div>
            )}
          </>
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
