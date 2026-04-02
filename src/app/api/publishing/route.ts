import { NextRequest, NextResponse } from "next/server";
import { CreatePublishJobSchema } from "@/lib/schemas";
import { createPublishJob, listPublishJobs } from "@/services/publishing-engine";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const channel = searchParams.get("channel") || undefined;
    const jobs = await listPublishJobs(channel);
    return NextResponse.json(jobs);
  } catch (error) {
    return NextResponse.json({ error: "Failed to list publish jobs" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const parsed = CreatePublishJobSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Validation failed", details: parsed.error.flatten() },
        { status: 400 }
      );
    }

    const job = await createPublishJob(
      parsed.data.productId,
      parsed.data.channel,
      parsed.data.videoId
    );

    return NextResponse.json(job, { status: 201 });
  } catch (error) {
    console.error("Create publish job error:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to create publish job" },
      { status: 500 }
    );
  }
}
