import { describe, expect, it } from "vitest";
import {
  type CreateItemInput,
  createInventoryRepository,
  type InventoryDb,
} from "@/lib/db/server";

const createFakeDb = (): InventoryDb => {
  const items: Array<{ id: string; data: Record<string, unknown> }> = [];

  return {
    async getAllItems() {
      return items.map((item) => ({ ...item }));
    },
    async getItemById(id) {
      const found = items.find((item) => item.id === id);

      return found ? { ...found } : null;
    },
    async getItemsPaginated() {
      return { items: [], page: 1, totalPages: 1, totalCount: 0, nextCursor: null };
    },
    async getCategories() {
      return [];
    },
    async getLevelsByItemId() {
      return [];
    },
    async getMovementsByItemId() {
      return [];
    },
    async createItem(data) {
      const id = `test-${items.length + 1}`;
      const record = { id, data };

      items.push(record);

      return { ...record };
    },
    async updateItem(id, data) {
      const idx = items.findIndex((item) => item.id === id);
      if (idx === -1) throw new Error("Item not found");
      items[idx].data = { ...items[idx].data, ...data };
      return { id: items[idx].id, data: items[idx].data };
    },
    async createMovementTransaction() {
      throw new Error("Not implemented in test");
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
      stockMonth: 3,
      stockYear: 2026,
      requestedQuantity: 100,
      receivedQuantity: 60,
    };

    const created = await repository.createItem(input);

    expect(created.id).toBeTypeOf("string");
    expect(created.name).toBe("Test Item");
    expect(created.sku).toBe("SKU-123");
    expect(created.unit).toBe("pcs");
    expect(created.requestedQuantity).toBe(100);
    expect(created.receivedQuantity).toBe(60);
    expect(created.isActive).toBe(true);

    const all = await repository.getAllItems();

    expect(all).toHaveLength(1);
    expect(all[0].id).toBe(created.id);
  });
});
