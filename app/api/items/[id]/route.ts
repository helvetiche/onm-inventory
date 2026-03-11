import { z } from "zod";
import { NextRequest, NextResponse } from "next/server";
import {
  getInventoryLevelsForItem,
  getItemById,
  getMovementsForItem,
  toggleItemActive,
  updateItem,
} from "@/lib/db/server";

const patchBodySchema = z.object({
  sku: z.string().min(1).optional(),
  name: z.string().min(1).optional(),
  description: z.string().optional(),
  category: z.string().optional(),
  unit: z.string().min(1).optional(),
  stockMonth: z.number().int().min(1).max(12).optional(),
  stockYear: z.number().int().min(2000).max(9999).optional(),
  requestedQuantity: z.number().int().min(0).optional(),
  receivedQuantity: z.number().int().min(0).optional(),
});

export async function GET(
  _request: NextRequest,
  context: { params: Promise<{ id: string }> }
): Promise<NextResponse> {
  const { id } = await context.params;

  const item = await getItemById(id);

  if (!item) {
    return NextResponse.json({ error: "Item not found" }, { status: 404 });
  }

  const [levels, movements] = await Promise.all([
    getInventoryLevelsForItem(id),
    getMovementsForItem(id),
  ]);

  return NextResponse.json({ item, levels, movements });
}

export async function PATCH(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
): Promise<NextResponse> {
  const { id } = await context.params;

  const item = await getItemById(id);

  if (!item) {
    return NextResponse.json({ error: "Item not found" }, { status: 404 });
  }

  const json = await request.json();
  const parsed = patchBodySchema.safeParse(json);

  if (!parsed.success) {
    return NextResponse.json(
      { error: "Invalid payload", details: parsed.error.flatten() },
      { status: 400 }
    );
  }

  const nextRequested =
    parsed.data.requestedQuantity ?? item.requestedQuantity;
  const nextReceived =
    parsed.data.receivedQuantity ?? item.receivedQuantity;
  if (nextReceived > nextRequested) {
    return NextResponse.json(
      {
        error: "Invalid payload",
        details: {
          formErrors: [],
          fieldErrors: {
            receivedQuantity: [
              "Received quantity cannot exceed requested quantity",
            ],
          },
        },
      },
      { status: 400 }
    );
  }

  const updated = await updateItem(id, parsed.data);

  return NextResponse.json(updated);
}

export async function DELETE(
  _request: NextRequest,
  context: { params: Promise<{ id: string }> }
): Promise<NextResponse> {
  const { id } = await context.params;

  const item = await getItemById(id);

  if (!item) {
    return NextResponse.json({ error: "Item not found" }, { status: 404 });
  }

  const toggled = await toggleItemActive(id);

  return NextResponse.json(toggled);
}
