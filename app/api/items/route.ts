import { z } from "zod";
import { NextRequest, NextResponse } from "next/server";
import { createItem, getItemsPaginated } from "@/lib/db/server";

const createItemBodySchema = z.object({
  sku: z.string().min(1),
  name: z.string().min(1),
  description: z.string().optional(),
  category: z.string().optional(),
  unit: z.string().min(1),
  stockMonth: z.number().int().min(1).max(12),
  stockYear: z.number().int().min(2000).max(9999),
  requestedQuantity: z.number().int().min(0),
  receivedQuantity: z.number().int().min(0),
}).refine(
  (data) => data.receivedQuantity <= data.requestedQuantity,
  {
    message: "Received quantity cannot exceed requested quantity",
    path: ["receivedQuantity"],
  }
);

const limitSchema = z.coerce.number().min(1).max(100).default(8);
const pageSchema = z.coerce.number().min(1).default(1);
const cursorSchema = z.string().optional();

export async function GET(request: NextRequest): Promise<NextResponse> {
  const { searchParams } = new URL(request.url);
  const limit = limitSchema.parse(searchParams.get("limit") ?? 8);
  const page = pageSchema.parse(searchParams.get("page") ?? 1);
  const search = searchParams.get("search") ?? undefined;
  const category = searchParams.get("category") ?? undefined;
  const cursor = cursorSchema.parse(searchParams.get("cursor") ?? undefined);

  const result = await getItemsPaginated({
    limit,
    page,
    search: search || null,
    category: category || null,
    cursor: cursor || null,
  });

  return NextResponse.json(result);
}

export async function POST(request: Request): Promise<NextResponse> {
  const json = await request.json();
  const parsed = createItemBodySchema.safeParse(json);

  if (!parsed.success) {
    return NextResponse.json(
      { error: "Invalid payload", details: parsed.error.flatten() },
      { status: 400 }
    );
  }

  const created = await createItem(parsed.data);

  return NextResponse.json(created, { status: 201 });
}
