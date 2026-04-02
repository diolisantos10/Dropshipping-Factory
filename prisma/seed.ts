import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  // Seed a sample trend report
  await prisma.trendReport.upsert({
    where: { id: "seed-trend-1" },
    update: {},
    create: {
      id: "seed-trend-1",
      title: "Welcome — Dropshipping Factory Started",
      summary:
        "Your factory is live! Start by pasting AliExpress URLs in the dashboard. " +
        "Products will be auto-processed with AI-generated content and video scripts.",
      data: {
        status: "ready",
        note: "This is a seed record. Delete it or add real trend reports.",
      },
    },
  });

  console.log("Seed complete.");
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
