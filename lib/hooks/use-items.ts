"use client";

import {
  useInfiniteQuery,
  type UseInfiniteQueryResult,
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
  cursor?: string | null;
  search?: string | null;
  category?: string | null;
};

export type ItemsPaginatedResponse = {
  items: InventoryItem[];
  nextCursor: string | null;
  hasMore: boolean;
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
      isActive: z.boolean(),
      createdAt: z.coerce.date(),
      updatedAt: z.coerce.date(),
    })
  ),
  nextCursor: z.string().nullable(),
  hasMore: z.boolean(),
});

const createItemInputSchema = z.object({
  sku: z.string().min(1),
  name: z.string().min(1),
  description: z.string().optional(),
  category: z.string().optional(),
  unit: z.string().min(1),
});

export type CreateItemInput = z.infer<typeof createItemInputSchema>;

const fetchItemsPaginated = async (
  params: ItemsQueryParams
): Promise<ItemsPaginatedResponse> => {
  const searchParams = new URLSearchParams();
  if (params.limit) searchParams.set("limit", String(params.limit));
  if (params.cursor) searchParams.set("cursor", params.cursor);
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

const ITEMS_PAGE_SIZE = 20;

export const useItemsQuery = (
  params: ItemsQueryParams = {}
): UseQueryResult<ItemsPaginatedResponse> => {
  const { limit = ITEMS_PAGE_SIZE, cursor, search, category } = params;
  return useQuery({
    queryKey: ["items", { limit, cursor, search, category }],
    queryFn: () =>
      fetchItemsPaginated({
        limit,
        cursor: cursor ?? null,
        search: search ?? null,
        category: category ?? null,
      }),
  });
};

export const useItemsInfiniteQuery = (
  params: Omit<ItemsQueryParams, "cursor"> = {}
): UseInfiniteQueryResult<ItemsPaginatedResponse, Error> => {
  const { limit = ITEMS_PAGE_SIZE, search, category } = params;
  return useInfiniteQuery({
    queryKey: ["items", "infinite", { limit, search, category }],
    queryFn: ({ pageParam }) =>
      fetchItemsPaginated({
        limit,
        cursor: pageParam as string | null,
        search: search ?? null,
        category: category ?? null,
      }),
    initialPageParam: null as string | null,
    getNextPageParam: (lastPage) => lastPage.nextCursor,
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
