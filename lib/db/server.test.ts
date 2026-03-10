import { describe, expect, it } from "vitest";
import {
  type CreateItemInput,
  createInventoryRepository,
  type InventoryDb,
} from "@/lib/db/server";

const createFakeDb = (): InventoryDb => {
  const items: Array<{ id: string; data: Record<string, unknown> }> = [];
  const movements: Array<{ id: string; data: Record<string, unknown> }> = [];
  const levelsByItemId = new Map<string, { id: string; data: Record<string, unknown> }>();

  return {
    async getAllItems() {
      return items.map((item) => ({ ...item }));
    },
    async getItemById(id) {
      const found = items.find((item) => item.id === id);

      return found ? { ...found } : null;
    },
    async getLevelsByItemId(itemId) {
      const level = levelsByItemId.get(itemId);
      return level ? [{ ...level }] : [];
    },
    async getMovementsByItemId(itemId) {
      return movements
        .filter((movement) => movement.data.itemId === itemId)
        .map((movement) => ({ ...movement }));
    },
    async createItem(data) {
      const id = `test-${items.length + 1}`;
      const record = { id, data };

      items.push(record);

      return { ...record };
    },
    async createMovementTransaction(input) {
      const movementRecord = {
        id: `movement-${movements.length + 1}`,
        data: {
          ...input,
          createdAt: new Date(),
        },
      };
      const currentLevel = levelsByItemId.get(input.itemId);
      const previousQuantity =
        typeof currentLevel?.data.quantity === "number" ? currentLevel.data.quantity : 0;
      const nextQuantity =
        input.type === "in"
          ? previousQuantity + input.quantity
          : Math.max(previousQuantity - input.quantity, 0);
      const levelRecord = {
        id: currentLevel?.id ?? `level-${levelsByItemId.size + 1}`,
        data: {
          itemId: input.itemId,
          locationId: input.locationId,
          quantity: nextQuantity,
          updatedAt: new Date(),
        },
      };

      movements.push(movementRecord);
      levelsByItemId.set(input.itemId, levelRecord);

      return {
        movement: { ...movementRecord },
        level: { ...levelRecord },
      };
    },
  };
};

describe("inventory repository", () => {
  it("creates and reads back an item", async () => {
    const db = createFakeDb();
    const repository = createInventoryRepository(db);

    const input: CreateItemInput = {
      sku: "SKU-123",
      name: "Test Item",
      unit: "pcs",
      description: "Demo",
      category: "Test",
    };

    const created = await repository.createItem(input);

    expect(created.id).toBeTypeOf("string");
    expect(created.name).toBe("Test Item");
    expect(created.sku).toBe("SKU-123");
    expect(created.unit).toBe("pcs");
    expect(created.isActive).toBe(true);

    const all = await repository.getAllItems();

    expect(all).toHaveLength(1);
    expect(all[0].id).toBe(created.id);
  });
});
