import { NextResponse } from "next/server";
import { getInventoryLevelsForItem, getItemById } from "@/lib/db/server";

export async function GET(
  _request: Request,
  context: { params: { id: string } }
): Promise<NextResponse> {
  const { id } = context.params;

  const item = await getItemById(id);

  if (!item) {
    return NextResponse.json({ error: "Item not found" }, { status: 404 });
  }

  const levels = await getInventoryLevelsForItem(id);

  return NextResponse.json({ item, levels });
}
