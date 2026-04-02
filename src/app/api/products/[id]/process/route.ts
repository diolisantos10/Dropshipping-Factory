import { NextRequest, NextResponse } from "next/server";
import { processProduct } from "@/services/product-engine";

export async function POST(
  _req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const product = await processProduct(params.id);
    return NextResponse.json(product);
  } catch (error) {
    console.error("Process product error:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to process product" },
      { status: 500 }
    );
  }
}
