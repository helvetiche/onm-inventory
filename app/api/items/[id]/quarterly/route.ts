import { z } from "zod";
import { NextRequest, NextResponse } from "next/server";
import { updateItemQuarterlyData } from "@/lib/db/server";

const updateQuarterlyDataSchema = z.object({
  quarter: z.number().int().min(1).max(4),
  field: z.enum(["requestedQuantity", "receivedQuantity"]),
  value: z.number().int().min(0),
});

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
): Promise<NextResponse> {
  try {
    const { id } = await params;
    console.log("PATCH /api/items/[id]/quarterly called with:", id);
    
    const json = await request.json();
    console.log("Request body:", json);
    
    const parsed = updateQuarterlyDataSchema.safeParse(json);

    if (!parsed.success) {
      console.error("Validation failed:", parsed.error);
      return NextResponse.json(
        { error: "Invalid payload", details: parsed.error.flatten() },
        { status: 400 }
      );
    }

    const { quarter, field, value } = parsed.data;

    console.log(`Updating item ${id}, Q${quarter}, ${field} = ${value}`);

    const updatedItem = await updateItemQuarterlyData(id, quarter, field, value);

    console.log("Update successful:", updatedItem.id);
    return NextResponse.json(updatedItem);
  } catch (error) {
    console.error("Error updating quarterly data:", error);
    return NextResponse.json(
      { error: "Failed to update quarterly data", details: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    );
  }
}