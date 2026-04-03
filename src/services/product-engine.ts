import { prisma } from "@/lib/prisma";
import { getTextProvider } from "@/providers/text";
import { getImageProvider } from "@/providers/image";
import type { Product, ProductImage } from "@prisma/client";

// NOTE: aliexpress-scraper is NOT statically imported here.
// It is loaded via dynamic import inside processProduct() so that
// cheerio/axios are never included in Next.js bundle analysis at build time.

export type ProductWithRelations = Product & {
  images: ProductImage[];
};

/**
 * Queues a product URL for processing.
 * Creates a QUEUED record immediately and returns it.
 */
export async function queueProduct(sourceUrl: string): Promise<Product> {
  return prisma.product.create({
    data: {
      sourceUrl,
      sourcePlatform: "aliexpress",
      status: "QUEUED",
    },
  });
}

/**
 * Processes a queued product:
 * 1. Scrapes AliExpress (dynamic import — not bundled at build time)
 * 2. Generates AI content
 * 3. Processes images
 * 4. Saves everything to DB
 */
export async function processProduct(productId: string): Promise<ProductWithRelations> {
  await prisma.product.update({
    where: { id: productId },
    data: { status: "PROCESSING" },
  });

  try {
    const product = await prisma.product.findUniqueOrThrow({ where: { id: productId } });

    // Dynamic import keeps cheerio/axios out of the webpack bundle graph entirely.
    const { scrapeAliExpressProduct } = await import("./aliexpress-scraper");
    const rawData = await scrapeAliExpressProduct(product.sourceUrl);

    const textProvider = getTextProvider();
    const productContent = await textProvider.generateProductContent({
      title: rawData.title,
      description: rawData.description,
      price: rawData.price,
      originalPrice: rawData.originalPrice,
      attributes: rawData.attributes,
      imageCount: rawData.images.length,
    });

    const imageProvider = getImageProvider();
    const processedImages = await imageProvider.processProductImages(rawData.images);

    await prisma.$transaction(async (tx) => {
      await tx.product.update({
        where: { id: productId },
        data: {
          rawSourceData: rawData as unknown as object,
          productName: productContent.productName,
          shortDescription: productContent.shortDescription,
          longDescription: productContent.longDescription,
          bulletPoints: productContent.bulletPoints,
          benefits: productContent.benefits,
          tags: productContent.tags,
          category: productContent.category,
          suggestedPrice: productContent.suggestedPrice,
          compareAtPrice: productContent.compareAtPrice,
          status: "READY",
        },
      });

      await tx.productImage.deleteMany({ where: { productId } });
      if (processedImages.length > 0) {
        await tx.productImage.createMany({
          data: processedImages.map((img) => ({
            productId,
            originalUrl: img.originalUrl,
            processedUrl: img.processedUrl,
            whiteBgUrl: img.whiteBgUrl,
            isMain: img.isMain,
            sortOrder: img.sortOrder,
          })),
        });
      }
    });

    return prisma.product.findUniqueOrThrow({
      where: { id: productId },
      include: { images: { orderBy: { sortOrder: "asc" } } },
    });
  } catch (error) {
    await prisma.product.update({
      where: { id: productId },
      data: { status: "FAILED" },
    });
    throw error;
  }
}

export async function getProduct(productId: string): Promise<ProductWithRelations | null> {
  return prisma.product.findUnique({
    where: { id: productId },
    include: {
      images: { orderBy: { sortOrder: "asc" } },
    },
  });
}

export async function listProducts(page = 1, pageSize = 20) {
  const skip = (page - 1) * pageSize;
  const [products, total] = await Promise.all([
    prisma.product.findMany({
      orderBy: { createdAt: "desc" },
      skip,
      take: pageSize,
      include: {
        images: { where: { isMain: true }, take: 1 },
        _count: { select: { videos: true, publishJobs: true } },
      },
    }),
    prisma.product.count(),
  ]);
  return { products, total, page, pageSize };
}
