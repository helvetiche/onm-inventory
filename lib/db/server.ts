import "server-only";

import { adminDb } from "@/lib/firebase/admin";
import {
  type InventoryItem,
  type InventoryLevel,
  inventoryItemSchema,
  inventoryLevelSchema,
} from "@/lib/db/types";
import { getOrSetCachedValue } from "@/lib/upstash";
import { z } from "zod";

const ITEMS_COLLECTION = "items";
const LEVELS_COLLECTION = "inventoryLevels";

const createTimestamp = (): Date => new Date();

const firestoreItemToDomain = (docId: string, data: unknown): InventoryItem => {
  const parsed = inventoryItemSchema.parse({
    id: docId,
    ...data,
  });

  return parsed;
};

const firestoreLevelToDomain = (
  docId: string,
  data: unknown
): InventoryLevel => {
  const parsed = inventoryLevelSchema.parse({
    id: docId,
    ...data,
  });

  return parsed;
};

const createItemInputSchema = inventoryItemSchema.omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export type CreateItemInput = z.infer<typeof createItemInputSchema>;

export const getAllItems = async (): Promise<InventoryItem[]> => {
  const cacheKey = "items:all";

  const items = await getOrSetCachedValue<InventoryItem[]>(
    cacheKey,
    async () => {
      const snapshot = await adminDb.collection(ITEMS_COLLECTION).get();

      const parsedItems = snapshot.docs.map((doc) =>
        firestoreItemToDomain(doc.id, doc.data())
      );

      return parsedItems;
    },
    {
      prefix: "inventory",
      ttlSeconds: 60,
    }
  );

  return items;
};

export const getItemById = async (id: string): Promise<InventoryItem | null> => {
  const doc = await adminDb.collection(ITEMS_COLLECTION).doc(id).get();

  if (!doc.exists) {
    return null;
  }

  return firestoreItemToDomain(doc.id, doc.data());
};

export const createItem = async (
  input: CreateItemInput
): Promise<InventoryItem> => {
  const parsedInput = createItemInputSchema.parse(input);
  const now = createTimestamp();

  const docRef = adminDb.collection(ITEMS_COLLECTION).doc();

  await docRef.set({
    ...parsedInput,
    isActive: true,
    createdAt: now,
    updatedAt: now,
  });

  const created = await docRef.get();

  return firestoreItemToDomain(created.id, created.data());
};

export const getInventoryLevelsForItem = async (
  itemId: string
): Promise<InventoryLevel[]> => {
  const snapshot = await adminDb
    .collection(LEVELS_COLLECTION)
    .where("itemId", "==", itemId)
    .get();

  const levels = snapshot.docs.map((doc) =>
    firestoreLevelToDomain(doc.id, doc.data())
  );

  return levels;
};

