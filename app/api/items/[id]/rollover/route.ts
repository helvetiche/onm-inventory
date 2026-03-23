import { z } from "zod";
import { NextRequest, NextResponse } from "next/server";
import { getItemById, updateItemQuarterlyData } from "@/lib/db/server";

const rolloverSchema = z.object({
  fromQuarter: z.number().int().min(1).max(4),
  toQuarter: z.number().int().min(1).max(4),
  remainingQuantity: z.number().int(), // Allow negative values for surplus
});

export async function POST(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
): Promise<NextResponse> {
  try {
    const { id } = await context.params;
    console.log("POST /api/items/[id]/rollover called with:", id);
    
    const json = await request.json();
    console.log("Request body:", JSON.stringify(json));
    
    const parsed = rolloverSchema.safeParse(json);

    if (!parsed.success) {
      console.log("Validation failed:", parsed.error.flatten());
      return NextResponse.json(
        { error: "Invalid payload", details: parsed.error.flatten() },
        { status: 400 }
      );
    }

    const { fromQuarter, toQuarter, remainingQuantity } = parsed.data;
    
    // Get the current item to check if it exists
    const item = await getItemById(id);
    if (!item) {
      return NextResponse.json({ error: "Item not found" }, { status: 404 });
    }

    // Get current next quarter data
    const nextQuarterKey = `q${toQuarter}` as 'q1' | 'q2' | 'q3' | 'q4';
    const nextQuarterData = item[nextQuarterKey] || { requestedQuantity: 0, receivedQuantity: 0, baseQuantity: 0 };
    
    let updatedItem;
    
    if (remainingQuantity > 0) {
      // Positive remaining (shortage) - add to next quarter's requested (via baseQuantity)
      const newBaseQuantity = (nextQuarterData.baseQuantity || 0) + remainingQuantity;
      console.log(`Rolling over shortage of ${remainingQuantity} from Q${fromQuarter} to Q${toQuarter} requested`);
      console.log(`New base quantity for Q${toQuarter}: ${newBaseQuantity}`);
      updatedItem = await updateItemQuarterlyData(id, toQuarter, "baseQuantity", newBaseQuantity);
    } else if (remainingQuantity < 0) {
      // Negative remaining (surplus) - add absolute value to next quarter's received
      const surplusAmount = Math.abs(remainingQuantity);
      const newReceivedQuantity = (nextQuarterData.receivedQuantity || 0) + surplusAmount;
      console.log(`Rolling over surplus of ${surplusAmount} from Q${fromQuarter} to Q${toQuarter} received`);
      console.log(`New received quantity for Q${toQuarter}: ${newReceivedQuantity}`);
      updatedItem = await updateItemQuarterlyData(id, toQuarter, "receivedQuantity", newReceivedQuantity);
    } else {
      // Zero remaining - no rollover needed
      console.log(`No rollover needed from Q${fromQuarter} to Q${toQuarter} (remaining is 0)`);
      updatedItem = item;
    }

    console.log("Rollover successful:", updatedItem.id);
    return NextResponse.json(updatedItem);
  } catch (error) {
    console.error("Error during rollover:", error);
    return NextResponse.json(
      { error: "Failed to rollover", details: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    );
  }
}