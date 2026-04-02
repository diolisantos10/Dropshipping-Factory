import { NextRequest, NextResponse } from "next/server";
import { CreateTrendReportSchema } from "@/lib/schemas";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const reports = await prisma.trendReport.findMany({
      orderBy: { createdAt: "desc" },
    });
    return NextResponse.json(reports);
  } catch (error) {
    return NextResponse.json({ error: "Failed to list trend reports" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const parsed = CreateTrendReportSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Validation failed", details: parsed.error.flatten() },
        { status: 400 }
      );
    }

    const report = await prisma.trendReport.create({ data: parsed.data });
    return NextResponse.json(report, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: "Failed to create trend report" }, { status: 500 });
  }
}
