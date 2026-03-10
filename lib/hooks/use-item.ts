"use client";

import {
  useMutation,
  type UseMutationResult,
  useQuery,
  type UseQueryResult,
  useQueryClient,
} from "@tanstack/react-query";
import { z } from "zod";
import type {
  InventoryItem,
  InventoryLevel,
  InventoryMovement,
} from "@/lib/db/types";

const itemDetailSchema = z.object({
  item: z.object({
    id: z.string(),
    sku: z.string(),
    name: z.string(),
    description: z.string().optional(),
    category: z.string().optional(),
    unit: z.string(),
    isActive: z.boolean(),
    createdAt: z.coerce.date(),
    updatedAt: z.coerce.date(),
  }),
  levels: z.array(
    z.object({
      id: z.string(),
      itemId: z.string(),
      locationId: z.string(),
      quantity: z.number(),
      safetyStock: z.number().optional(),
      updatedAt: z.coerce.date(),
    })
  ),
  movements: z.array(
    z.object({
      id: z.string(),
      itemId: z.string(),
      locationId: z.string(),
      type: z.enum(["IN", "OUT", "ADJUSTMENT"]),
      quantity: z.number(),
      reference: z.string().optional(),
      note: z.string().optional(),
      createdAt: z.coerce.date(),
    })
  ),
});

export type ItemDetailResponse = {
  item: InventoryItem;
  levels: InventoryLevel[];
  movements: InventoryMovement[];
};

const fetchItemDetail = async (id: string): Promise<ItemDetailResponse> => {
  const response = await fetch(`/api/items/${id}`);

  if (!response.ok) {
    throw new Error("Failed to fetch item");
  }

  const json = await response.json();
  const parsed = itemDetailSchema.parse(json);

  return parsed as ItemDetailResponse;
};

const updateItemInputSchema = z.object({
  sku: z.string().min(1).optional(),
  name: z.string().min(1).optional(),
  description: z.string().optional(),
  category: z.string().optional(),
  unit: z.string().min(1).optional(),
});

export type UpdateItemInput = z.infer<typeof updateItemInputSchema>;

const updateItemRequest = async (
  id: string,
  payload: UpdateItemInput
): Promise<InventoryItem> => {
  const response = await fetch(`/api/items/${id}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    throw new Error("Failed to update item");
  }

  return (await response.json()) as InventoryItem;
};

const toggleItemActiveRequest = async (id: string): Promise<InventoryItem> => {
  const response = await fetch(`/api/items/${id}`, {
    method: "DELETE",
  });

  if (!response.ok) {
    throw new Error("Failed to toggle item");
  }

  return (await response.json()) as InventoryItem;
};

export const useItemQuery = (
  id: string | null
): UseQueryResult<ItemDetailResponse> => {
  return useQuery({
    queryKey: ["item", id],
    queryFn: () => {
      if (!id) {
        throw new Error("Missing item id");
      }

      return fetchItemDetail(id);
    },
    enabled: Boolean(id),
  });
};

export const useUpdateItemMutation = (
  itemId: string | null
): UseMutationResult<InventoryItem, Error, UpdateItemInput> => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: UpdateItemInput) => {
      if (!itemId) throw new Error("Missing item id");
      return updateItemRequest(itemId, payload);
    },
    onSuccess: (data) => {
      void queryClient.invalidateQueries({ queryKey: ["items"] });
      void queryClient.invalidateQueries({ queryKey: ["item", data.id] });
    },
  });
};

export const useToggleItemActiveMutation = (): UseMutationResult<
  InventoryItem,
  Error,
  string
> => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: toggleItemActiveRequest,
    onSuccess: (data) => {
      void queryClient.invalidateQueries({ queryKey: ["items"] });
      void queryClient.invalidateQueries({ queryKey: ["item", data.id] });
    },
  });
};
