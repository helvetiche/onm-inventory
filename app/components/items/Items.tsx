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
import {
  useItemsQuery,
  useCategoriesQuery,
  useCreateItemMutation,
  useUpdateQuarterlyDataMutation,
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
  const [selectedQuarter, setSelectedQuarter] = useState(1);
  const [selectedYear, setSelectedYear] = useState(2026);
  const [page, setPage] = useState(1);
  const [editingCell, setEditingCell] = useState<{itemId: string, field: 'requested' | 'received'} | null>(null);
  const [editValue, setEditValue] = useState("");
  const [isUpdatingCell, setIsUpdatingCell] = useState(false);

  const { data, isLoading, error, refetch } = useItemsQuery({
    limit: PAGE_SIZE,
    page,
    search: searchParam || null,
    category: categoryFilter || null,
    year: selectedYear,
  });
  const { data: categories = [] } = useCategoriesQuery();
  const createMutation = useCreateItemMutation();
  const updateQuarterlyMutation = useUpdateQuarterlyDataMutation();

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

  const handleSearchChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>): void => {
      setPage(1);
      setSearchInput(e.target.value);
    },
    []
  );

  const handleCategoryChange = useCallback(
    (e: React.ChangeEvent<HTMLSelectElement>): void => {
      setPage(1);
      setCategoryFilter(e.target.value);
    },
    []
  );

  const handleCreateSubmit = (values: CreateItemInput | UpdateItemInput): void => {
    createMutation.mutate(values as CreateItemInput, {
      onSuccess: () => {
        setIsCreateModalOpen(false);
      },
    });
  };

  const handleEditSubmit = (values: CreateItemInput | UpdateItemInput): void => {
    if (!editItemId) return;
    updateMutation.mutate(values as UpdateItemInput, {
      onSuccess: () => {
        setEditItemId(null);
        setDetailItemId(null);
      },
    });
  };

  const handleToggleActive = (id: string): void => {
    toggleMutation.mutate(id, {
      onSuccess: () => {
        setOpenMenuId(null);
        if (detailItemId === id) setDetailItemId(null);
      },
    });
  };

  const handleEditFromDetail = (): void => {
    if (detailItemId) {
      setEditItemId(detailItemId);
      setDetailItemId(null);
    }
  };

  const handleStartEdit = (itemId: string, field: 'requested' | 'received', currentValue: number): void => {
    setEditingCell({ itemId, field });
    setEditValue(String(currentValue));
    setIsUpdatingCell(false);
  };

  const handleSaveEdit = (): void => {
    if (!editingCell || isUpdatingCell) return;
    
    const newValue = parseInt(editValue);
    if (isNaN(newValue) || newValue < 0) {
      setEditingCell(null);
      setEditValue("");
      return;
    }

    // Map frontend field names to API field names
    const apiFieldName: "requestedQuantity" | "receivedQuantity" = editingCell.field === 'requested' ? 'requestedQuantity' : 'receivedQuantity';

    console.log("Frontend field:", editingCell.field);
    console.log("API field name:", apiFieldName);
    console.log("Mutation payload:", { itemId: editingCell.itemId, quarter: selectedQuarter, field: apiFieldName, value: newValue });

    setIsUpdatingCell(true);

    // Save to database
    updateQuarterlyMutation.mutate({
      itemId: editingCell.itemId,
      quarter: selectedQuarter,
      field: apiFieldName,
      value: newValue,
    }, {
      onSuccess: () => {
        setEditingCell(null);
        setEditValue("");
        setIsUpdatingCell(false);
      },
      onError: (error) => {
        console.error("Failed to update quarterly data:", error);
        setIsUpdatingCell(false);
        // Keep editing mode open on error
      },
    });
  };

  const handleCancelEdit = (): void => {
    setEditingCell(null);
    setEditValue("");
    setIsUpdatingCell(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent): void => {
    if (e.key === 'Enter') {
      e.preventDefault();
      e.stopPropagation();
      handleSaveEdit();
    } else if (e.key === 'Escape') {
      e.preventDefault();
      e.stopPropagation();
      handleCancelEdit();
    }
  };

  const handleBlur = (): void => {
    // Only save on blur if we're not in the middle of a keyboard action or already updating
    if (!isUpdatingCell) {
      setTimeout(() => {
        if (editingCell && !isUpdatingCell) {
          handleSaveEdit();
        }
      }, 100);
    }
  };

  const handleRollover = async (): Promise<void> => {
    if (!data?.items) return;
    
    const currentQuarter = selectedQuarter;
    const nextQuarter = currentQuarter === 4 ? 1 : currentQuarter + 1;
    
    try {
      // Process rollover for all items with remaining quantities
      const rolloverPromises = data.items
        .filter(item => {
          const quarterKey = `q${currentQuarter}` as 'q1' | 'q2' | 'q3' | 'q4';
          const quarterData = item[quarterKey] || { requestedQuantity: 0, receivedQuantity: 0, baseQuantity: 0 };
          const totalRequested = (quarterData.baseQuantity || 0) + quarterData.requestedQuantity;
          const remaining = totalRequested - quarterData.receivedQuantity;
          return remaining > 0;
        })
        .map(async item => {
          const currentQuarterKey = `q${currentQuarter}` as 'q1' | 'q2' | 'q3' | 'q4';
          const currentQuarterData = item[currentQuarterKey] || { requestedQuantity: 0, receivedQuantity: 0, baseQuantity: 0 };
          const totalRequested = (currentQuarterData.baseQuantity || 0) + currentQuarterData.requestedQuantity;
          const remaining = totalRequested - currentQuarterData.receivedQuantity;
          
          // Add remaining to next quarter's base quantity
          const response = await fetch(`/api/items/${item.id}/rollover`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              fromQuarter: currentQuarter,
              toQuarter: nextQuarter,
              remainingQuantity: remaining,
            }),
          });
          
          if (!response.ok) {
            throw new Error(`Failed to rollover item ${item.id}`);
          }
          
          return response.json();
        });
      
      await Promise.all(rolloverPromises);
      
      // Refresh the data
      await refetch();
      
      alert(`Successfully rolled over remaining items from Q${currentQuarter} to Q${nextQuarter}`);
    } catch (error) {
      console.error('Rollover failed:', error);
      alert('Failed to rollover items. Please try again.');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-4">
          <h1 className="text-lg font-medium tracking-tight text-emerald-900">
            Items - Q{selectedQuarter} {selectedYear}
          </h1>
          <span className="rounded-full bg-emerald-50 px-3 py-1 text-[13px] font-normal text-emerald-800">
            {totalCount} total
            {activeCount > 0 ? ` · ${activeCount} active` : ""}
          </span>
        </div>
        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => setIsCreateModalOpen(true)}
            className="inline-flex items-center gap-2 rounded-md bg-emerald-900 px-4 py-2.5 text-[14px] font-medium text-white transition-colors hover:bg-emerald-800 focus:outline-none focus:ring-2 focus:ring-emerald-300 focus:ring-offset-2"
          >
            <Plus size={18} weight="regular" aria-hidden />
            Add item
          </button>
          <button
            type="button"
            onClick={handleRollover}
            className="inline-flex items-center gap-2 rounded-md border border-emerald-900 px-4 py-2.5 text-[14px] font-medium text-emerald-900 transition-colors hover:bg-emerald-50 focus:outline-none focus:ring-2 focus:ring-emerald-300 focus:ring-offset-2"
          >
            <Archive size={18} weight="regular" aria-hidden />
            Rollover to Next Quarter
          </button>
        </div>
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
        <select
          value={selectedYear}
          onChange={(e) => {
            setSelectedYear(Number(e.target.value));
            setPage(1);
          }}
          className="rounded-md border border-slate-200 bg-white px-4 py-2.5 text-[14px] text-emerald-900 focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500 sm:w-32"
          aria-label="Select year"
        >
          <option value={2024}>2024</option>
          <option value={2025}>2025</option>
          <option value={2026}>2026</option>
          <option value={2027}>2027</option>
        </select>
        <div className="flex rounded-md border border-slate-200 bg-white">
          {[1, 2, 3, 4].map((quarter) => (
            <button
              key={quarter}
              type="button"
              onClick={() => {
                setSelectedQuarter(quarter);
                setPage(1);
              }}
              className={`px-4 py-2.5 text-[14px] font-medium transition-colors first:rounded-l-md last:rounded-r-md ${
                selectedQuarter === quarter
                  ? "bg-emerald-900 text-white"
                  : "text-emerald-900 hover:bg-emerald-50"
              }`}
              aria-label={`Quarter ${quarter}`}
            >
              Q{quarter}
            </button>
          ))}
        </div>
      </div>

      <div className="overflow-hidden rounded-lg border border-slate-100 bg-white shadow-[0_1px_3px_0_rgba(0,0,0,0.05)]">
        {isLoading && (
          <div className="overflow-x-auto">
            <table
              className="w-full min-w-[800px] table-fixed border-collapse"
              role="grid"
              style={{ borderSpacing: 0 }}
            >
              <thead>
                <tr className="bg-emerald-900">
                  <th
                    scope="col"
                    className="w-[16.66%] border-dashed border border-emerald-800 px-4 py-3 text-center text-[13px] font-normal text-white"
                  >
                    <div className="flex items-center justify-center gap-2">
                      <Package size={16} weight="regular" aria-hidden />
                      No.
                    </div>
                  </th>
                  <th
                    scope="col"
                    className="w-[16.66%] border-dashed border border-emerald-800 px-4 py-3 text-center text-[13px] font-normal text-white"
                  >
                    <div className="flex items-center justify-center gap-2">
                      <Tag size={16} weight="regular" aria-hidden />
                      Particulars
                    </div>
                  </th>
                  <th
                    scope="col"
                    className="w-[16.66%] border-dashed border border-emerald-800 px-4 py-3 text-center text-[13px] font-normal text-white"
                  >
                    <div className="flex items-center justify-center gap-2">
                      <Stack size={16} weight="regular" aria-hidden />
                      Stocks
                    </div>
                  </th>
                  <th
                    scope="col"
                    className="w-[16.66%] border-dashed border border-emerald-800 px-4 py-3 text-center text-[13px] font-normal text-white"
                  >
                    <div className="flex items-center justify-center gap-2">
                      <Plus size={16} weight="regular" aria-hidden />
                      Requested
                    </div>
                  </th>
                  <th
                    scope="col"
                    className="w-[16.66%] border-dashed border border-emerald-800 px-4 py-3 text-center text-[13px] font-normal text-white"
                  >
                    <div className="flex items-center justify-center gap-2">
                      <Archive size={16} weight="regular" aria-hidden />
                      Received
                    </div>
                  </th>
                  <th
                    scope="col"
                    className="w-[16.66%] border-dashed border border-emerald-800 px-4 py-3 text-center text-[13px] font-normal text-white"
                  >
                    <div className="flex items-center justify-center gap-2">
                      <Cube size={16} weight="regular" aria-hidden />
                      Remaining
                    </div>
                  </th>
                </tr>
              </thead>
              <tbody>
                {Array.from({ length: PAGE_SIZE }, (_, i) => (
                  <tr key={i} className="even:bg-slate-50/30">
                    <td className="border-dashed border border-slate-300 px-4 py-4 text-center hover:bg-emerald-50 transition-colors">
                      <div className="h-5 w-8 animate-pulse rounded bg-slate-200 mx-auto" />
                    </td>
                    <td className="border-dashed border border-slate-300 px-4 py-4 hover:bg-emerald-50 transition-colors">
                      <div className="h-4 w-32 animate-pulse rounded bg-slate-200" />
                    </td>
                    <td className="border-dashed border border-slate-300 px-4 py-4 text-center hover:bg-emerald-50 transition-colors">
                      <div className="h-4 w-16 animate-pulse rounded bg-slate-200 mx-auto" />
                    </td>
                    <td className="border-dashed border border-slate-300 px-4 py-4 text-center hover:bg-emerald-50 transition-colors">
                      <div className="h-4 w-12 animate-pulse rounded bg-slate-200 mx-auto" />
                    </td>
                    <td className="border-dashed border border-slate-300 px-4 py-4 text-center hover:bg-emerald-50 transition-colors">
                      <div className="h-4 w-12 animate-pulse rounded bg-slate-200 mx-auto" />
                    </td>
                    <td className="border-dashed border border-slate-300 px-4 py-4 text-center hover:bg-emerald-50 transition-colors">
                      <div className="h-4 w-12 animate-pulse rounded bg-slate-200 mx-auto" />
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
                className="w-full min-w-[800px] table-fixed border-collapse"
                role="grid"
                style={{ borderSpacing: 0 }}
              >
                <thead>
                  <tr className="bg-emerald-900">
                    <th
                      scope="col"
                      className="w-[16.66%] border-dashed border border-emerald-800 px-4 py-3 text-center text-[13px] font-normal text-white"
                    >
                      <div className="flex items-center justify-center gap-2">
                        <Package size={16} weight="regular" aria-hidden />
                        No.
                      </div>
                    </th>
                    <th
                      scope="col"
                      className="w-[16.66%] border-dashed border border-emerald-800 px-4 py-3 text-center text-[13px] font-normal text-white"
                    >
                      <div className="flex items-center justify-center gap-2">
                        <Tag size={16} weight="regular" aria-hidden />
                        Particulars
                      </div>
                    </th>
                    <th
                      scope="col"
                      className="w-[16.66%] border-dashed border border-emerald-800 px-4 py-3 text-center text-[13px] font-normal text-white"
                    >
                      <div className="flex items-center justify-center gap-2">
                        <Stack size={16} weight="regular" aria-hidden />
                        Stocks
                      </div>
                    </th>
                    <th
                      scope="col"
                      className="w-[16.66%] border-dashed border border-emerald-800 px-4 py-3 text-center text-[13px] font-normal text-white"
                    >
                      <div className="flex items-center justify-center gap-2">
                        <Plus size={16} weight="regular" aria-hidden />
                        Requested
                      </div>
                    </th>
                    <th
                      scope="col"
                      className="w-[16.66%] border-dashed border border-emerald-800 px-4 py-3 text-center text-[13px] font-normal text-white"
                    >
                      <div className="flex items-center justify-center gap-2">
                        <Archive size={16} weight="regular" aria-hidden />
                        Received
                      </div>
                    </th>
                    <th
                      scope="col"
                      className="w-[16.66%] border-dashed border border-emerald-800 px-4 py-3 text-center text-[13px] font-normal text-white"
                    >
                      <div className="flex items-center justify-center gap-2">
                        <Cube size={16} weight="regular" aria-hidden />
                        Remaining
                      </div>
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {items.map((item, index) => {
                    // Extract quarterly data based on selected quarter
                    const quarterKey = `q${selectedQuarter}` as 'q1' | 'q2' | 'q3' | 'q4';
                    const quarterData = item[quarterKey] || { requestedQuantity: 0, receivedQuantity: 0, baseQuantity: 0 };
                    
                    // Calculate total requested including previous quarter rollover
                    let totalRequested = (quarterData.baseQuantity || 0) + (quarterData.requestedQuantity || 0);
                    
                    // Add previous quarter remaining if not yet rolled over
                    if (selectedQuarter > 1) {
                      const prevQuarterKey = `q${selectedQuarter - 1}` as 'q1' | 'q2' | 'q3' | 'q4';
                      const prevQuarterData = item[prevQuarterKey] || { requestedQuantity: 0, receivedQuantity: 0, baseQuantity: 0 };
                      const prevTotalRequested = (prevQuarterData.baseQuantity || 0) + prevQuarterData.requestedQuantity;
                      const prevRemaining = Math.max(0, prevTotalRequested - prevQuarterData.receivedQuantity);
                      totalRequested += prevRemaining;
                    }
                    
                    const remaining = totalRequested - quarterData.receivedQuantity;

                    return (
                      <tr
                        key={item.id}
                        className="even:bg-slate-50/30"
                      >
                        <td className="border-dashed border border-slate-300 px-4 py-3 text-center text-[14px] font-medium text-emerald-900 hover:bg-emerald-50 transition-colors">
                          {String((currentPage - 1) * PAGE_SIZE + index + 1).padStart(3, '0')}
                        </td>
                        <td className="border-dashed border border-slate-300 px-4 py-3 hover:bg-emerald-50 transition-colors">
                          <div className="text-[14px] font-medium text-emerald-900">
                            {item.name}
                          </div>
                        </td>
                        <td className="border-dashed border border-slate-300 px-4 py-3 text-center hover:bg-emerald-50 transition-colors">
                          <div className="text-[14px] font-medium text-emerald-900">
                            {remaining} {item.unit}
                          </div>
                        </td>
                        <td className="border-dashed border border-slate-300 px-4 py-3 text-center hover:bg-emerald-50 transition-colors group relative">
                          {editingCell?.itemId === item.id && editingCell?.field === 'requested' ? (
                            <div className="relative">
                              <input
                                type="number"
                                value={editValue}
                                onChange={(e) => setEditValue(e.target.value)}
                                onKeyDown={handleKeyDown}
                                onBlur={handleBlur}
                                disabled={isUpdatingCell}
                                className={`w-full text-center text-[14px] bg-white border border-emerald-500 rounded px-2 py-1 focus:outline-none focus:ring-2 focus:ring-emerald-300 ${isUpdatingCell ? 'text-transparent cursor-not-allowed' : 'text-slate-600'}`}
                                autoFocus
                                min="0"
                              />
                              {isUpdatingCell && (
                                <div className="absolute inset-0 flex items-center justify-center rounded">
                                  <div className="animate-spin rounded-full h-4 w-4 border-2 border-emerald-500 border-t-transparent"></div>
                                </div>
                              )}
                            </div>
                          ) : (
                            <div className="flex items-center justify-center gap-2">
                              <div className="text-[14px] text-slate-600">
                                {(() => {
                                  let prevRemaining = 0;
                                  let currentUserInput = quarterData.requestedQuantity || 0;
                                  let currentBase = quarterData.baseQuantity || 0;
                                  
                                  // Calculate previous quarter remaining if we're not in Q1
                                  if (selectedQuarter > 1) {
                                    const prevQuarterKey = `q${selectedQuarter - 1}` as 'q1' | 'q2' | 'q3' | 'q4';
                                    const prevQuarterData = item[prevQuarterKey] || { requestedQuantity: 0, receivedQuantity: 0, baseQuantity: 0 };
                                    const prevTotalRequested = (prevQuarterData.baseQuantity || 0) + prevQuarterData.requestedQuantity;
                                    prevRemaining = Math.max(0, prevTotalRequested - prevQuarterData.receivedQuantity);
                                  }
                                  
                                  const finalTotal = currentBase + prevRemaining + currentUserInput;
                                  
                                  return (
                                    <>
                                      {finalTotal}
                                      {(prevRemaining > 0 || currentUserInput > 0) && (
                                        <div className="text-[11px] text-emerald-600">
                                          {prevRemaining > 0 && (
                                            <div>Q{selectedQuarter - 1}: {prevRemaining}</div>
                                          )}
                                          {currentUserInput > 0 && (
                                            <div>Q{selectedQuarter}: {currentUserInput}</div>
                                          )}
                                        </div>
                                      )}
                                    </>
                                  );
                                })()}
                              </div>
                              <button
                                type="button"
                                onClick={() => handleStartEdit(item.id, 'requested', quarterData.requestedQuantity)}
                                className="opacity-0 group-hover:opacity-100 transition-opacity p-1 hover:bg-emerald-100 rounded"
                                aria-label="Edit requested quantity"
                              >
                                <PencilSimple size={14} weight="regular" className="text-emerald-600" />
                              </button>
                            </div>
                          )}
                        </td>
                        <td className="border-dashed border border-slate-300 px-4 py-3 text-center hover:bg-emerald-50 transition-colors group relative">
                          {editingCell?.itemId === item.id && editingCell?.field === 'received' ? (
                            <div className="relative">
                              <input
                                type="number"
                                value={editValue}
                                onChange={(e) => setEditValue(e.target.value)}
                                onKeyDown={handleKeyDown}
                                onBlur={handleBlur}
                                disabled={isUpdatingCell}
                                className={`w-full text-center text-[14px] bg-white border border-emerald-500 rounded px-2 py-1 focus:outline-none focus:ring-2 focus:ring-emerald-300 ${isUpdatingCell ? 'text-transparent cursor-not-allowed' : 'text-slate-600'}`}
                                autoFocus
                                min="0"
                              />
                              {isUpdatingCell && (
                                <div className="absolute inset-0 flex items-center justify-center rounded">
                                  <div className="animate-spin rounded-full h-4 w-4 border-2 border-emerald-500 border-t-transparent"></div>
                                </div>
                              )}
                            </div>
                          ) : (
                            <div className="flex items-center justify-center gap-2">
                              <div className="text-[14px] text-slate-600">
                                {quarterData.receivedQuantity}
                              </div>
                              <button
                                type="button"
                                onClick={() => handleStartEdit(item.id, 'received', quarterData.receivedQuantity)}
                                className="opacity-0 group-hover:opacity-100 transition-opacity p-1 hover:bg-emerald-100 rounded"
                                aria-label="Edit received quantity"
                              >
                                <PencilSimple size={14} weight="regular" className="text-emerald-600" />
                              </button>
                            </div>
                          )}
                        </td>
                        <td className="border-dashed border border-slate-300 px-4 py-3 text-center hover:bg-emerald-50 transition-colors">
                          <div className="text-[14px] text-emerald-900">
                            {remaining}
                          </div>
                        </td>
                      </tr>
                    );
                  })}
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
