"use client";

import type { JSX } from "react";
import { useState, useEffect, useCallback } from "react";
import {
  MagnifyingGlass,
  Plus,
  PencilSimple,
  Archive,
  Package,
  CaretLeft,
  CaretRight,
  DownloadSimple,
  Tag,
  Stack,
  Cube,
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
import { exportInventoryToExcel } from "@/lib/utils/excel-export";

const PAGE_SIZE = 16;

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

  useEffect(() => {
    const t = setTimeout(() => {
      setSearchParam(searchInput.trim());
      setPage(1); // Reset to page 1 when search changes
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
      // Process rollover for all items with non-zero remaining quantities (positive or negative)
      const rolloverPromises = data.items
        .filter(item => {
          const quarterKey = `q${currentQuarter}` as 'q1' | 'q2' | 'q3' | 'q4';
          const quarterData = item[quarterKey] || { requestedQuantity: 0, receivedQuantity: 0, baseQuantity: 0 };
          const totalRequested = (quarterData.baseQuantity || 0) + quarterData.requestedQuantity;
          const remaining = totalRequested - quarterData.receivedQuantity;
          return remaining !== 0; // Include both positive (shortage) and negative (surplus)
        })
        .map(async item => {
          const currentQuarterKey = `q${currentQuarter}` as 'q1' | 'q2' | 'q3' | 'q4';
          const currentQuarterData = item[currentQuarterKey] || { requestedQuantity: 0, receivedQuantity: 0, baseQuantity: 0 };
          const totalRequested = (currentQuarterData.baseQuantity || 0) + currentQuarterData.requestedQuantity;
          const remaining = totalRequested - currentQuarterData.receivedQuantity;
          
          // Rollover to next quarter
          // If positive: adds to next quarter's requested (baseQuantity)
          // If negative: adds absolute value to next quarter's received
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
      
      alert(`Successfully rolled over items from Q${currentQuarter} to Q${nextQuarter}`);
    } catch (error) {
      console.error('Rollover failed:', error);
      alert('Failed to rollover items. Please try again.');
    }
  };

  const handleExportExcel = async (): Promise<void> => {
    try {
      // Fetch all items for the selected year (not just current page)
      const response = await fetch(`/api/items?year=${selectedYear}&limit=100`);
      if (!response.ok) {
        throw new Error('Failed to fetch items for export');
      }
      
      const exportData = await response.json();
      
      await exportInventoryToExcel({
        items: exportData.items,
        quarter: selectedQuarter,
        year: selectedYear,
        month: MONTH_LABELS[new Date().getMonth()].toUpperCase(),
      });
    } catch (error) {
      console.error('Export failed:', error);
      alert('Failed to export to Excel. Please try again.');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-end">
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
            onClick={handleExportExcel}
            className="inline-flex items-center gap-2 rounded-md border border-emerald-900 px-4 py-2.5 text-[14px] font-medium text-emerald-900 transition-colors hover:bg-emerald-50 focus:outline-none focus:ring-2 focus:ring-emerald-300 focus:ring-offset-2"
          >
            <DownloadSimple size={18} weight="regular" aria-hidden />
            Export Excel
          </button>
        </div>
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
                    
                    // Calculate previous quarter's remaining (can be positive or negative)
                    let prevRemaining = 0;
                    if (selectedQuarter > 1) {
                      const prevQuarterKey = `q${selectedQuarter - 1}` as 'q1' | 'q2' | 'q3' | 'q4';
                      const prevQuarterData = item[prevQuarterKey] || { requestedQuantity: 0, receivedQuantity: 0, baseQuantity: 0 };
                      const prevTotalRequested = (prevQuarterData.baseQuantity || 0) + prevQuarterData.requestedQuantity;
                      prevRemaining = prevTotalRequested - prevQuarterData.receivedQuantity;
                    }
                    
                    // Calculate total requested and received with rollover logic
                    // If prevRemaining > 0 (shortage): add to requested
                    // If prevRemaining < 0 (surplus): add absolute value to received
                    const totalRequested = (quarterData.baseQuantity || 0) + quarterData.requestedQuantity + (prevRemaining > 0 ? prevRemaining : 0);
                    const totalReceived = quarterData.receivedQuantity + (prevRemaining < 0 ? Math.abs(prevRemaining) : 0);
                    const remaining = totalRequested - totalReceived;

                    return (
                      <tr
                        key={item.id}
                        className="even:bg-slate-50/30"
                      >
                        <td className="border-dashed border border-slate-300 px-4 py-3 text-center text-[14px] font-medium text-emerald-900 hover:bg-emerald-50 transition-colors">
                          {item.sku.replace('ITEM-', '')}
                        </td>
                        <td className="border-dashed border border-slate-300 px-4 py-3 hover:bg-emerald-50 transition-colors">
                          <div className="text-[14px] font-medium text-emerald-900">
                            {item.name}
                          </div>
                        </td>
                        <td className="border-dashed border border-slate-300 px-4 py-3 text-center hover:bg-emerald-50 transition-colors">
                          <div className="text-[14px] font-medium text-emerald-900">
                            {item.stockAmount} {item.unit}
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
                                {totalRequested}
                                {(prevRemaining > 0 || quarterData.requestedQuantity > 0) && (
                                  <div className="text-[11px] text-emerald-600">
                                    {prevRemaining > 0 && (
                                      <div>Q{selectedQuarter - 1} shortage: +{prevRemaining}</div>
                                    )}
                                    {quarterData.requestedQuantity > 0 && (
                                      <div>Q{selectedQuarter} new: {quarterData.requestedQuantity}</div>
                                    )}
                                  </div>
                                )}
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
                                {totalReceived}
                                {(prevRemaining < 0 || quarterData.receivedQuantity > 0) && (
                                  <div className="text-[11px] text-blue-600">
                                    {prevRemaining < 0 && (
                                      <div>Q{selectedQuarter - 1} surplus: +{Math.abs(prevRemaining)}</div>
                                    )}
                                    {quarterData.receivedQuantity > 0 && (
                                      <div>Q{selectedQuarter} new: {quarterData.receivedQuantity}</div>
                                    )}
                                  </div>
                                )}
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
                          <div className="text-[14px] font-medium text-emerald-900">
                            {remaining > 0 ? remaining : remaining === 0 ? "—" : 0}
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                  {/* Fill empty rows to make 8 total */}
                  {Array.from({ length: Math.max(0, PAGE_SIZE - items.length) }, (_, i) => (
                    <tr 
                      key={`empty-${i}`} 
                      className="even:bg-slate-50/30 group cursor-pointer transition-colors relative"
                      onClick={() => setIsCreateModalOpen(true)}
                    >
                      {/* Normal cells - visible when not hovered */}
                      <td className="border-dashed border border-slate-300 px-4 py-4 text-center transition-colors group-hover:hidden">
                        <div className="text-[14px] text-slate-400"></div>
                      </td>
                      <td className="border-dashed border border-slate-300 px-4 py-4 transition-colors group-hover:hidden">
                        <div className="text-[14px] text-slate-400"></div>
                      </td>
                      <td className="border-dashed border border-slate-300 px-4 py-4 text-center transition-colors group-hover:hidden">
                        <div className="text-[14px] text-slate-400"></div>
                      </td>
                      <td className="border-dashed border border-slate-300 px-4 py-4 text-center transition-colors group-hover:hidden">
                        <div className="text-[14px] text-slate-400"></div>
                      </td>
                      <td className="border-dashed border border-slate-300 px-4 py-4 text-center transition-colors group-hover:hidden">
                        <div className="text-[14px] text-slate-400"></div>
                      </td>
                      <td className="border-dashed border border-slate-300 px-4 py-4 text-center transition-colors group-hover:hidden">
                        <div className="text-[14px] text-slate-400"></div>
                      </td>
                      
                      {/* Merged cell - only visible on hover */}
                      <td 
                        colSpan={6} 
                        className="border-dashed border border-slate-300 px-4 py-4 text-center transition-colors bg-gray-100 hidden group-hover:table-cell"
                      >
                        <div className="flex items-center justify-center gap-2">
                          <Package size={18} weight="regular" className="text-gray-600" aria-hidden />
                          <span className="text-gray-600 font-medium text-[14px]">Add Particulars</span>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            {/* Always show pagination */}
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
