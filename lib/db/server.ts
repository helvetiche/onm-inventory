import "server-only";

import { getAdminDb } from "@/lib/firebase/admin";
import {
  type InventoryItem,
  type InventoryLevel,
  inventoryItemSchema,
  inventoryLevelSchema,
} from "@/lib/db/types";
import { z } from "zod";

const ITEMS_COLLECTION = "items";
const LEVELS_COLLECTION = "inventoryLevels";

type FirestoreDocument = {
  id: string;
  data: unknown;
};

export interface InventoryDb {
  getAllItems(): Promise<FirestoreDocument[]>;
  getItemById(id: string): Promise<FirestoreDocument | null>;
  getLevelsByItemId(itemId: string): Promise<FirestoreDocument[]>;
  createItem(
    data: Record<string, unknown>
  ): Promise<FirestoreDocument>;
}

const createTimestamp = (): Date => new Date();

const firestoreItemToDomain = (
  docId: string,
  data: unknown
): InventoryItem => {
  const parsed = inventoryItemSchema.parse(
    typeof data === "object" && data !== null
      ? {
          id: docId,
          ...(data as Record<string, unknown>),
        }
      : {
          id: docId,
        }
  );

  return parsed;
};

const firestoreLevelToDomain = (
  docId: string,
  data: unknown
): InventoryLevel => {
  const parsed = inventoryLevelSchema.parse(
    typeof data === "object" && data !== null
      ? {
          id: docId,
          ...(data as Record<string, unknown>),
        }
      : {
          id: docId,
        }
  );

  return parsed;
};

const createItemInputSchema = inventoryItemSchema.omit({
  id: true,
  createdAt: true,
  updatedAt: true,
  isActive: true,
});

export type CreateItemInput = z.infer<typeof createItemInputSchema>;
export interface InventoryRepository {
  getAllItems(): Promise<InventoryItem[]>;
  getItemById(id: string): Promise<InventoryItem | null>;
  createItem(input: CreateItemInput): Promise<InventoryItem>;
  getInventoryLevelsForItem(itemId: string): Promise<InventoryLevel[]>;
}

const createInventoryDb = (): InventoryDb => {
  const db = getAdminDb();

  const getAllItems = async (): Promise<FirestoreDocument[]> => {
    const snapshot = await db.collection(ITEMS_COLLECTION).get();

    return snapshot.docs.map((doc) => ({
      id: doc.id,
      data: doc.data(),
    }));
  };

  const getItemById = async (
    id: string
  ): Promise<FirestoreDocument | null> => {
    const doc = await db.collection(ITEMS_COLLECTION).doc(id).get();

    if (!doc.exists) {
      return null;
    }

    return {
      id: doc.id,
      data: doc.data(),
    };
  };

  const getLevelsByItemId = async (
    itemId: string
  ): Promise<FirestoreDocument[]> => {
    const snapshot = await db
      .collection(LEVELS_COLLECTION)
      .where("itemId", "==", itemId)
      .get();

    return snapshot.docs.map((doc) => ({
      id: doc.id,
      data: doc.data(),
    }));
  };

  const createItem = async (
    data: Record<string, unknown>
  ): Promise<FirestoreDocument> => {
    const docRef = db.collection(ITEMS_COLLECTION).doc();

    await docRef.set(data);

    const created = await docRef.get();

    return {
      id: created.id,
      data: created.data() as Record<string, unknown>,
    };
  };

  return {
    getAllItems,
    getItemById,
    getLevelsByItemId,
    createItem,
  };
};

export const createInventoryRepository = (
  db: InventoryDb
): InventoryRepository => {
  const getAllItems = async (): Promise<InventoryItem[]> => {
    const docs = await db.getAllItems();

    return docs.map((doc) =>
      firestoreItemToDomain(doc.id, doc.data)
    );
  };

  const getItemById = async (id: string): Promise<InventoryItem | null> => {
    const doc = await db.getItemById(id);

    if (!doc) {
      return null;
    }

    return firestoreItemToDomain(doc.id, doc.data);
  };

  const createItem = async (
    input: CreateItemInput
  ): Promise<InventoryItem> => {
    const parsedInput = createItemInputSchema.parse(input);
    const now = createTimestamp();

    const document = await db.createItem({
      ...parsedInput,
      isActive: true,
      createdAt: now,
      updatedAt: now,
    });

    return firestoreItemToDomain(document.id, document.data);
  };

  const getInventoryLevelsForItem = async (
    itemId: string
  ): Promise<InventoryLevel[]> => {
    const docs = await db.getLevelsByItemId(itemId);

    return docs.map((doc) =>
      firestoreLevelToDomain(doc.id, doc.data)
    );
  };

  return {
    getAllItems,
    getItemById,
    createItem,
    getInventoryLevelsForItem,
  };
};

export const getAllItems = async (): Promise<InventoryItem[]> => {
  const repository = createInventoryRepository(createInventoryDb());

  return repository.getAllItems();
};

export const getItemById = async (
  id: string
): Promise<InventoryItem | null> => {
  const repository = createInventoryRepository(createInventoryDb());

  return repository.getItemById(id);
};

export const createItem = async (
  input: CreateItemInput
): Promise<InventoryItem> => {
  const repository = createInventoryRepository(createInventoryDb());

  return repository.createItem(input);
};

export const getInventoryLevelsForItem = async (
  itemId: string
): Promise<InventoryLevel[]> => {
  const repository = createInventoryRepository(createInventoryDb());

  return repository.getInventoryLevelsForItem(itemId);
};

