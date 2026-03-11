"use client";

import {
  useMutation,
  type UseMutationResult,
  useQuery,
  type UseQueryResult,
  useQueryClient,
} from "@tanstack/react-query";
import type { InventoryItem } from "@/lib/db/types";
import { z } from "zod";

export type ItemsQueryParams = {
  limit?: number;
  page?: number;
  search?: string | null;
  category?: string | null;
};

export type ItemsPaginatedResponse = {
  items: InventoryItem[];
  page: number;
  totalPages: number;
  totalCount: number;
};

const itemsPaginatedSchema = z.object({
  items: z.array(
    z.object({
      id: z.string(),
      sku: z.string(),
      name: z.string(),
      description: z.string().optional(),
      category: z.string().optional(),
      unit: z.string(),
      stockMonth: z.number().int().min(1).max(12),
      stockYear: z.number().int().min(2000).max(9999),
      requestedQuantity: z.number().int().min(0),
      receivedQuantity: z.number().int().min(0),
      isActive: z.boolean(),
      createdAt: z.coerce.date(),
      updatedAt: z.coerce.date(),
    })
  ),
  page: z.number(),
  totalPages: z.number(),
  totalCount: z.number(),
});

const createItemInputSchema = z.object({
  sku: z.string().min(1),
  name: z.string().min(1),
  description: z.string().optional(),
  category: z.string().optional(),
  unit: z.string().min(1),
  stockMonth: z.number().int().min(1).max(12),
  stockYear: z.number().int().min(2000).max(9999),
  requestedQuantity: z.number().int().min(0),
  receivedQuantity: z.number().int().min(0),
});

export type CreateItemInput = z.infer<typeof createItemInputSchema>;

const fetchItemsPaginated = async (
  params: ItemsQueryParams
): Promise<ItemsPaginatedResponse> => {
  const searchParams = new URLSearchParams();
  if (params.limit) searchParams.set("limit", String(params.limit));
  if (params.page) searchParams.set("page", String(params.page));
  if (params.search) searchParams.set("search", params.search);
  if (params.category) searchParams.set("category", params.category);

  const response = await fetch(`/api/items?${searchParams.toString()}`);

  if (!response.ok) {
    throw new Error("Failed to fetch items");
  }

  const json = await response.json();
  return itemsPaginatedSchema.parse(json) as ItemsPaginatedResponse;
};

const fetchCategories = async (): Promise<string[]> => {
  const response = await fetch("/api/items/categories");
  if (!response.ok) throw new Error("Failed to fetch categories");
  const json = await response.json();
  return z.array(z.string()).parse(json);
};

const createItemRequest = async (
  payload: CreateItemInput
): Promise<InventoryItem> => {
  const parsedPayload = createItemInputSchema.parse(payload);

  const response = await fetch("/api/items", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(parsedPayload),
  });

  if (!response.ok) {
    throw new Error("Failed to create item");
  }

  const json = await response.json();

  return json as InventoryItem;
};

const ITEMS_PAGE_SIZE = 8;

export const useItemsQuery = (
  params: ItemsQueryParams = {}
): UseQueryResult<ItemsPaginatedResponse> => {
  const {
    limit = ITEMS_PAGE_SIZE,
    page = 1,
    search,
    category,
  } = params;
  return useQuery({
    queryKey: ["items", { limit, page, search, category }],
    queryFn: () =>
      fetchItemsPaginated({
        limit,
        page,
        search: search ?? null,
        category: category ?? null,
      }),
  });
};

export const useCategoriesQuery = (): UseQueryResult<string[]> => {
  return useQuery({
    queryKey: ["items", "categories"],
    queryFn: fetchCategories,
  });
};

export const useCreateItemMutation = (): UseMutationResult<
  InventoryItem,
  Error,
  CreateItemInput
> => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createItemRequest,
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["items"] });
    },
  });
};
