import { NextResponse } from "next/server";
import { getCategories } from "@/lib/db/server";

export async function GET(): Promise<NextResponse> {
  const categories = await getCategories();
  return NextResponse.json(categories, {
    headers: {
      "Cache-Control": "public, s-maxage=300, stale-while-revalidate=600",
    },
  });
}
