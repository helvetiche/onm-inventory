import { z } from "zod";

export const inventoryLocationSchema = z.object({
  id: z.string(),
  name: z.string().min(1),
  description: z.string().optional(),
  createdAt: z.date(),
  updatedAt: z.date(),
});

export type InventoryLocation = z.infer<typeof inventoryLocationSchema>;

export const inventoryItemSchema = z.object({
  id: z.string(),
  sku: z.string().min(1),
  name: z.string().min(1),
  description: z.string().optional(),
  category: z.string().optional(),
  unit: z.string().min(1),
  stockMonth: z.number().int().min(1).max(12),
  stockYear: z.number().int().min(2000).max(9999),
  quarter: z.number().int().min(1).max(4).optional().default(1), // Optional with default
  requestedQuantity: z.number().int().min(0),
  receivedQuantity: z.number().int().min(0),
  baseQuantity: z.number().int().min(0).optional().default(0), // Optional with default
  isActive: z.boolean(),
  createdAt: z.date(),
  updatedAt: z.date(),
});

export type InventoryItem = z.infer<typeof inventoryItemSchema>;

export const inventoryLevelSchema = z.object({
  id: z.string(),
  itemId: z.string(),
  locationId: z.string(),
  quantity: z.number(),
  safetyStock: z.number().optional(),
  updatedAt: z.date(),
});

export type InventoryLevel = z.infer<typeof inventoryLevelSchema>;

export const inventoryMovementTypeSchema = z.enum(["IN", "OUT", "ADJUSTMENT"]);

export type InventoryMovementType = z.infer<typeof inventoryMovementTypeSchema>;

export const inventoryMovementSchema = z.object({
  id: z.string(),
  itemId: z.string(),
  locationId: z.string(),
  type: inventoryMovementTypeSchema,
  quantity: z.number(),
  reference: z.string().optional(),
  note: z.string().optional(),
  createdAt: z.date(),
});

export type InventoryMovement = z.infer<typeof inventoryMovementSchema>;

