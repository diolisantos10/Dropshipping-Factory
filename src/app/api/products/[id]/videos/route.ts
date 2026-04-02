import { NextRequest, NextResponse } from "next/server";
import { generateVideosForProduct, getVideosForProduct } from "@/services/video-engine";
import { z } from "zod";

const GenerateVideosSchema = z.object({
  variantCount: z.number().int().min(1).max(3).optional().default(1),
});

export async function GET(
  _req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const videos = await getVideosForProduct(params.id);
    return NextResponse.json(videos);
  } catch (error) {
    return NextResponse.json({ error: "Failed to get videos" }, { status: 500 });
  }
}

export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body = await req.json().catch(() => ({}));
    const parsed = GenerateVideosSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json({ error: "Validation failed" }, { status: 400 });
    }

    const videos = await generateVideosForProduct(params.id, {
      variantCount: parsed.data.variantCount,
    });

    return NextResponse.json(videos, { status: 201 });
  } catch (error) {
    console.error("Generate videos error:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to generate videos" },
      { status: 500 }
    );
  }
}
