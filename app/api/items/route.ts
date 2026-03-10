import { z } from "zod";
import { NextRequest, NextResponse } from "next/server";
import { createItem, getItemsPaginated } from "@/lib/db/server";

const createItemBodySchema = z.object({
  sku: z.string().min(1),
  name: z.string().min(1),
  description: z.string().optional(),
  category: z.string().optional(),
  unit: z.string().min(1),
});

const limitSchema = z.coerce.number().min(1).max(100).default(20);

export async function GET(request: NextRequest): Promise<NextResponse> {
  const { searchParams } = new URL(request.url);
  const limit = limitSchema.parse(searchParams.get("limit") ?? 20);
  const cursor = searchParams.get("cursor") ?? undefined;
  const search = searchParams.get("search") ?? undefined;
  const category = searchParams.get("category") ?? undefined;

  const result = await getItemsPaginated({
    limit,
    cursor: cursor || null,
    search: search || null,
    category: category || null,
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
