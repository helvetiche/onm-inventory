import { z } from "zod";
import { NextResponse } from "next/server";
import { createItem, getAllItems } from "@/lib/db/server";

const createItemBodySchema = z.object({
  sku: z.string().min(1),
  name: z.string().min(1),
  description: z.string().optional(),
  category: z.string().optional(),
  unit: z.string().min(1),
});

export async function GET(): Promise<NextResponse> {
  const items = await getAllItems();

  return NextResponse.json(items);
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
