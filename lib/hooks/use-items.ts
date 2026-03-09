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

const inventoryItemListSchema = z.array(
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
);

const createItemInputSchema = z.object({
  sku: z.string().min(1),
  name: z.string().min(1),
  description: z.string().optional(),
  category: z.string().optional(),
  unit: z.string().min(1),
});

export type CreateItemInput = z.infer<typeof createItemInputSchema>;

const fetchItems = async (): Promise<InventoryItem[]> => {
  const response = await fetch("/api/items");

  if (!response.ok) {
    throw new Error("Failed to fetch items");
  }

  const json = await response.json();

  return inventoryItemListSchema.parse(json) as InventoryItem[];
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

export const useItemsQuery = (): UseQueryResult<InventoryItem[]> => {
  return useQuery({
    queryKey: ["items"],
    queryFn: fetchItems,
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
