import { NextRequest, NextResponse } from "next/server";
import { QueueProductSchema } from "@/lib/schemas";
import { queueProduct, listProducts, processProduct } from "@/services/product-engine";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const page = parseInt(searchParams.get("page") || "1");
    const pageSize = parseInt(searchParams.get("pageSize") || "20");
    const result = await listProducts(page, pageSize);
    return NextResponse.json(result);
  } catch (error) {
    return NextResponse.json({ error: "Failed to list products" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const parsed = QueueProductSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Validation failed", details: parsed.error.flatten() },
        { status: 400 }
      );
    }

    const product = await queueProduct(parsed.data.sourceUrl);

    // Kick off processing in the background (fire-and-forget)
    processProduct(product.id).catch((err) =>
      console.error(`Background processing failed for ${product.id}:`, err)
    );

    return NextResponse.json(product, { status: 201 });
  } catch (error) {
    console.error("POST /api/products error:", error);
    return NextResponse.json({ error: "Failed to queue product" }, { status: 500 });
  }
}
