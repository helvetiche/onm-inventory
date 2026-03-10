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

export interface InventoryDb {
  getAllItems(): Promise<FirestoreDocument[]>;
  getItemById(id: string): Promise<FirestoreDocument | null>;
  getLevelsByItemId(itemId: string): Promise<FirestoreDocument[]>;
  getMovementsByItemId(itemId: string): Promise<FirestoreDocument[]>;
  createItem(
    data: Record<string, unknown>
  ): Promise<FirestoreDocument>;
  createMovementTransaction(
    input: CreateMovementInput
  ): Promise<{ movement: FirestoreDocument; level: FirestoreDocument }>;
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

const firestoreMovementToDomain = (
  docId: string,
  data: unknown
): InventoryMovement => {
  const parsed = inventoryMovementSchema.parse(
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
export interface InventoryRepository {
  getAllItems(): Promise<InventoryItem[]>;
  getItemById(id: string): Promise<InventoryItem | null>;
  createItem(input: CreateItemInput): Promise<InventoryItem>;
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
    getLevelsByItemId,
    getMovementsByItemId,
    createItem,
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
    createItem,
    getInventoryLevelsForItem,
    createMovement,
    getMovementsForItem,
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

