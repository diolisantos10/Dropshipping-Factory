import { NextRequest, NextResponse } from "next/server";
import { executePublishJob } from "@/services/publishing-engine";

export async function POST(
  _req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const job = await executePublishJob(params.id);
    return NextResponse.json(job);
  } catch (error) {
    console.error("Execute publish job error:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to execute publish job" },
      { status: 500 }
    );
  }
}
