import "server-only";

import { getAdminDb } from "@/lib/firebase/admin";
import {
  type InventoryItem,
  type InventoryLevel,
  type InventoryMovement,
  type InventoryMovementType,
  inventoryItemSchema,
  inventoryLevelSchema,
  inventoryMovementSchema,
  inventoryMovementTypeSchema,
} from "@/lib/db/types";
import { z } from "zod";

const ITEMS_COLLECTION = "items";
const LEVELS_COLLECTION = "inventoryLevels";
const MOVEMENTS_COLLECTION = "inventoryMovements";

type FirestoreDocument = {
  id: string;
  data: unknown;
};

export type CreateMovementInput = {
  itemId: string;
  locationId: string;
  type: InventoryMovementType;
  quantity: number;
  reference?: string;
  note?: string;
};

export type GetItemsPaginatedParams = {
  limit: number;
  cursor?: string | null;
  search?: string | null;
  category?: string | null;
};

export type GetItemsPaginatedResult = {
  items: FirestoreDocument[];
  nextCursor: string | null;
  hasMore: boolean;
};

export interface InventoryDb {
  getAllItems(): Promise<FirestoreDocument[]>;
  getItemById(id: string): Promise<FirestoreDocument | null>;
  getItemsPaginated(params: GetItemsPaginatedParams): Promise<GetItemsPaginatedResult>;
  getCategories(): Promise<string[]>;
  getLevelsByItemId(itemId: string): Promise<FirestoreDocument[]>;
  getMovementsByItemId(itemId: string): Promise<FirestoreDocument[]>;
  createItem(data: Record<string, unknown>): Promise<FirestoreDocument>;
  updateItem(id: string, data: Record<string, unknown>): Promise<FirestoreDocument>;
  createMovementTransaction(
    input: CreateMovementInput
  ): Promise<{ movement: FirestoreDocument; level: FirestoreDocument }>;
}

const createTimestamp = (): Date => new Date();

const hasToDate = (v: unknown): v is { toDate: () => Date } =>
  v !== null &&
  typeof v === "object" &&
  "toDate" in v &&
  typeof (v as { toDate: () => Date }).toDate === "function";

const normalizeFirestoreDates = (
  obj: Record<string, unknown>,
  dateKeys: string[]
): Record<string, unknown> => {
  const out = { ...obj };
  for (const key of dateKeys) {
    const v = out[key];
    if (hasToDate(v)) {
      out[key] = v.toDate();
    }
  }
  return out;
};

const firestoreItemToDomain = (
  docId: string,
  data: unknown
): InventoryItem => {
  const raw =
    typeof data === "object" && data !== null
      ? { id: docId, ...(data as Record<string, unknown>) }
      : { id: docId };
  const normalized = normalizeFirestoreDates(
    raw as Record<string, unknown>,
    ["createdAt", "updatedAt"]
  );
  return inventoryItemSchema.parse(normalized);
};

const firestoreLevelToDomain = (
  docId: string,
  data: unknown
): InventoryLevel => {
  const raw =
    typeof data === "object" && data !== null
      ? { id: docId, ...(data as Record<string, unknown>) }
      : { id: docId };
  const normalized = normalizeFirestoreDates(
    raw as Record<string, unknown>,
    ["updatedAt"]
  );
  return inventoryLevelSchema.parse(normalized);
};

const firestoreMovementToDomain = (
  docId: string,
  data: unknown
): InventoryMovement => {
  const raw =
    typeof data === "object" && data !== null
      ? { id: docId, ...(data as Record<string, unknown>) }
      : { id: docId };
  const normalized = normalizeFirestoreDates(
    raw as Record<string, unknown>,
    ["createdAt"]
  );
  return inventoryMovementSchema.parse(normalized);
};

const createMovementInputSchema = z.object({
  itemId: z.string().min(1),
  locationId: z.string().min(1),
  type: inventoryMovementTypeSchema,
  quantity: z.number().positive(),
  reference: z.string().optional(),
  note: z.string().optional(),
});

const createItemInputSchema = inventoryItemSchema.omit({
  id: true,
  createdAt: true,
  updatedAt: true,
  isActive: true,
});

export type CreateItemInput = z.infer<typeof createItemInputSchema>;

export type UpdateItemInput = Partial<CreateItemInput>;

const updateItemInputSchema = createItemInputSchema.partial();

export type ItemsPaginatedResult = {
  items: InventoryItem[];
  nextCursor: string | null;
  hasMore: boolean;
};

export interface InventoryRepository {
  getAllItems(): Promise<InventoryItem[]>;
  getItemById(id: string): Promise<InventoryItem | null>;
  getItemsPaginated(params: GetItemsPaginatedParams): Promise<ItemsPaginatedResult>;
  getCategories(): Promise<string[]>;
  createItem(input: CreateItemInput): Promise<InventoryItem>;
  updateItem(id: string, input: z.infer<typeof updateItemInputSchema>): Promise<InventoryItem>;
  toggleItemActive(id: string): Promise<InventoryItem>;
  getInventoryLevelsForItem(itemId: string): Promise<InventoryLevel[]>;
  createMovement(input: CreateMovementInput): Promise<InventoryMovement>;
  getMovementsForItem(itemId: string): Promise<InventoryMovement[]>;
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

  const getItemsPaginated = async (
    params: GetItemsPaginatedParams
  ): Promise<GetItemsPaginatedResult> => {
    const { limit, cursor, search, category } = params;
    const pageSize = Math.min(Math.max(1, limit), 100);
    const fetchLimit = pageSize + 1;
    const searchTrimmed = search?.trim();
    const categoryTrimmed = category?.trim();

    const col = db.collection(ITEMS_COLLECTION);
    let query = col.orderBy("name", "asc");

    if (categoryTrimmed && searchTrimmed) {
      query = col
        .where("category", "==", categoryTrimmed)
        .where("name", ">=", searchTrimmed)
        .where("name", "<=", searchTrimmed + "\uf8ff")
        .orderBy("name", "asc");
    } else if (categoryTrimmed) {
      query = col
        .where("category", "==", categoryTrimmed)
        .orderBy("name", "asc");
    } else if (searchTrimmed) {
      query = col
        .where("name", ">=", searchTrimmed)
        .where("name", "<=", searchTrimmed + "\uf8ff")
        .orderBy("name", "asc");
    } else {
      query = col.orderBy("name", "asc");
    }

    if (cursor?.trim()) {
      const cursorDoc = await db.collection(ITEMS_COLLECTION).doc(cursor).get();
      if (cursorDoc.exists) {
        query = query.startAfter(cursorDoc);
      }
    }

    const snapshot = await query.limit(fetchLimit).get();
    const docs = snapshot.docs;
    const hasMore = docs.length > pageSize;
    const resultDocs = hasMore ? docs.slice(0, pageSize) : docs;

    return {
      items: resultDocs.map((doc) => ({
        id: doc.id,
        data: doc.data(),
      })),
      nextCursor: hasMore ? resultDocs[resultDocs.length - 1].id : null,
      hasMore,
    };
  };

  const getCategories = async (): Promise<string[]> => {
    const snapshot = await db
      .collection(ITEMS_COLLECTION)
      .select("category")
      .get();
    const set = new Set<string>();
    snapshot.docs.forEach((doc) => {
      const cat = doc.get("category");
      if (typeof cat === "string" && cat.trim()) {
        set.add(cat.trim());
      }
    });
    return Array.from(set).sort();
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

  const updateItem = async (
    id: string,
    data: Record<string, unknown>
  ): Promise<FirestoreDocument> => {
    const docRef = db.collection(ITEMS_COLLECTION).doc(id);
    const existing = await docRef.get();

    if (!existing.exists) {
      throw new Error("Item not found");
    }

    const updateData = {
      ...data,
      updatedAt: createTimestamp(),
    };

    await docRef.update(updateData);
    const updated = await docRef.get();

    return {
      id: updated.id,
      data: updated.data() as Record<string, unknown>,
    };
  };

  const getMovementsByItemId = async (
    itemId: string
  ): Promise<FirestoreDocument[]> => {
    const snapshot = await db
      .collection(MOVEMENTS_COLLECTION)
      .where("itemId", "==", itemId)
      .orderBy("createdAt", "desc")
      .get();

    return snapshot.docs.map((doc) => ({
      id: doc.id,
      data: doc.data(),
    }));
  };

  const createMovementTransaction = async (
    input: CreateMovementInput
  ): Promise<{ movement: FirestoreDocument; level: FirestoreDocument }> => {
    const { itemId, locationId, type, quantity, reference, note } = input;
    const now = createTimestamp();

    const movementRef = db.collection(MOVEMENTS_COLLECTION).doc();
    const levelQuery = db
      .collection(LEVELS_COLLECTION)
      .where("itemId", "==", itemId)
      .where("locationId", "==", locationId)
      .limit(1);

    const result = await db.runTransaction(async (t) => {
        const levelSnap = await t.get(levelQuery);
        const levelDoc = levelSnap.docs[0];
        const currentQty = levelDoc
          ? (levelDoc.data().quantity as number)
          : 0;

        let newQty: number;

        if (type === "IN") {
          newQty = currentQty + quantity;
        } else if (type === "OUT") {
          if (currentQty < quantity) {
            throw new Error(
              `Insufficient stock. Available: ${currentQty}, requested: ${quantity}`
            );
          }

          newQty = currentQty - quantity;
        } else {
          newQty = currentQty + quantity;
        }

        if (newQty < 0) {
          throw new Error("Quantity cannot go negative");
        }

        const movementData: Record<string, unknown> = {
          itemId,
          locationId,
          type,
          quantity,
          createdAt: now,
          ...(reference ? { reference } : {}),
          ...(note ? { note } : {}),
        };

        t.set(movementRef, movementData);

        const levelData: Record<string, unknown> = {
          itemId,
          locationId,
          quantity: newQty,
          updatedAt: now,
        };

        const levelRef = levelDoc
          ? levelDoc.ref
          : db.collection(LEVELS_COLLECTION).doc();

        t.set(levelRef, levelData, levelDoc ? { merge: true } : {});

        return {
          movement: {
            id: movementRef.id,
            data: movementData,
          },
          level: {
            id: levelRef.id,
            data: { ...levelData, id: levelRef.id },
          },
        };
      }
    );

    return result;
  };

  return {
    getAllItems,
    getItemById,
    getItemsPaginated,
    getCategories,
    getLevelsByItemId,
    getMovementsByItemId,
    createItem,
    updateItem,
    createMovementTransaction,
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

  const getItemsPaginated = async (
    params: GetItemsPaginatedParams
  ): Promise<ItemsPaginatedResult> => {
    const result = await db.getItemsPaginated(params);
    return {
      items: result.items.map((doc) =>
        firestoreItemToDomain(doc.id, doc.data)
      ),
      nextCursor: result.nextCursor,
      hasMore: result.hasMore,
    };
  };

  const getCategories = async (): Promise<string[]> => {
    return db.getCategories();
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

  const updateItem = async (
    id: string,
    input: UpdateItemInput
  ): Promise<InventoryItem> => {
    const parsed = updateItemInputSchema.parse(input);
    if (Object.keys(parsed).length === 0) {
      const existing = await getItemById(id);
      if (!existing) throw new Error("Item not found");
      return existing;
    }
    const document = await db.updateItem(id, parsed);
    return firestoreItemToDomain(document.id, document.data);
  };

  const toggleItemActive = async (id: string): Promise<InventoryItem> => {
    const existing = await getItemById(id);
    if (!existing) throw new Error("Item not found");
    const document = await db.updateItem(id, { isActive: !existing.isActive });
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

  const createMovement = async (
    input: CreateMovementInput
  ): Promise<InventoryMovement> => {
    const parsed = createMovementInputSchema.parse(input);
    const { movement } = await db.createMovementTransaction(parsed);

    return firestoreMovementToDomain(movement.id, movement.data);
  };

  const getMovementsForItem = async (
    itemId: string
  ): Promise<InventoryMovement[]> => {
    const docs = await db.getMovementsByItemId(itemId);

    return docs.map((doc) =>
      firestoreMovementToDomain(doc.id, doc.data)
    );
  };

  return {
    getAllItems,
    getItemById,
    getItemsPaginated,
    getCategories,
    createItem,
    updateItem,
    toggleItemActive,
    getInventoryLevelsForItem,
    createMovement,
    getMovementsForItem,
  };
};

export const getItemsPaginated = async (
  params: GetItemsPaginatedParams
): Promise<ItemsPaginatedResult> => {
  const repository = createInventoryRepository(createInventoryDb());
  return repository.getItemsPaginated(params);
};

export const getCategories = async (): Promise<string[]> => {
  const repository = createInventoryRepository(createInventoryDb());
  return repository.getCategories();
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

export const updateItem = async (
  id: string,
  input: UpdateItemInput
): Promise<InventoryItem> => {
  const repository = createInventoryRepository(createInventoryDb());

  return repository.updateItem(id, input);
};

export const toggleItemActive = async (id: string): Promise<InventoryItem> => {
  const repository = createInventoryRepository(createInventoryDb());

  return repository.toggleItemActive(id);
};

export const getInventoryLevelsForItem = async (
  itemId: string
): Promise<InventoryLevel[]> => {
  const repository = createInventoryRepository(createInventoryDb());

  return repository.getInventoryLevelsForItem(itemId);
};

export const createMovement = async (
  input: CreateMovementInput
): Promise<InventoryMovement> => {
  const repository = createInventoryRepository(createInventoryDb());

  return repository.createMovement(input);
};

export const getMovementsForItem = async (
  itemId: string
): Promise<InventoryMovement[]> => {
  const repository = createInventoryRepository(createInventoryDb());

  return repository.getMovementsForItem(itemId);
};

