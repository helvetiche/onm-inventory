"use client";

import { useQuery, type UseQueryResult } from "@tanstack/react-query";
import { z } from "zod";
import type { InventoryItem, InventoryLevel } from "@/lib/db/types";

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
});

const fetchItemDetail = async (
  id: string
): Promise<{ item: InventoryItem; levels: InventoryLevel[] }> => {
  const response = await fetch(`/api/items/${id}`);

  if (!response.ok) {
    throw new Error("Failed to fetch item");
  }

  const json = await response.json();
  const parsed = itemDetailSchema.parse(json);

  return parsed as { item: InventoryItem; levels: InventoryLevel[] };
};

export const useItemQuery = (
  id: string | null
): UseQueryResult<{ item: InventoryItem; levels: InventoryLevel[] }> => {
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
