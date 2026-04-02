import { prisma } from "@/lib/prisma";
import { getTextProvider } from "@/providers/text";
import { getVoiceProvider } from "@/providers/voice";
import { getVideoProvider } from "@/providers/video";
import type { ProductVideo } from "@prisma/client";
import type { ProductTextData } from "@/providers/interfaces/text-provider";

export interface GenerateVideoOptions {
  variantCount?: number; // 1-3
}

export async function generateVideosForProduct(
  productId: string,
  options: GenerateVideoOptions = {}
): Promise<ProductVideo[]> {
  const { variantCount = 1 } = options;
  const count = Math.min(Math.max(variantCount, 1), 3);

  const product = await prisma.product.findUniqueOrThrow({
    where: { id: productId },
    include: { images: { orderBy: { sortOrder: "asc" } } },
  });

  if (!product.productName) {
    throw new Error("Product must be processed before generating videos");
  }

  const textProvider = getTextProvider();
  const voiceProvider = getVoiceProvider();
  const videoProvider = getVideoProvider();

  const productData: ProductTextData = {
    productName: product.productName,
    shortDescription: product.shortDescription || "",
    longDescription: product.longDescription || "",
    bulletPoints: (product.bulletPoints as string[]) || [],
    benefits: (product.benefits as string[]) || [],
    tags: (product.tags as string[]) || [],
    category: product.category || "",
    suggestedPrice: product.suggestedPrice || 0,
    compareAtPrice: product.compareAtPrice || 0,
  };

  const imageUrls = product.images
    .map((img) => img.processedUrl || img.originalUrl)
    .filter(Boolean) as string[];

  const videos: ProductVideo[] = [];

  for (let i = 0; i < count; i++) {
    // Create pending record
    const videoRecord = await prisma.productVideo.create({
      data: {
        productId,
        status: "GENERATING",
        variantIndex: i,
      },
    });

    try {
      // Generate script
      const script = await textProvider.generateVideoScript(productData, i);

      // Generate voiceover
      const audioUrl = await voiceProvider.generateVoiceover(script.fullScript);

      // Generate video
      const generated = await videoProvider.generateVideo({
        imageUrls,
        script: script.fullScript,
        audioUrl,
        caption: script.caption,
      });

      const updated = await prisma.productVideo.update({
        where: { id: videoRecord.id },
        data: {
          script: script.fullScript,
          voiceProvider: voiceProvider.name,
          videoProvider: videoProvider.name,
          videoUrl: generated.videoUrl,
          caption: script.caption,
          hashtags: script.hashtags,
          status: "READY",
        },
      });

      videos.push(updated);
    } catch (error) {
      await prisma.productVideo.update({
        where: { id: videoRecord.id },
        data: { status: "FAILED" },
      });
      console.error(`Failed to generate video variant ${i}:`, error);
    }
  }

  return videos;
}

export async function getVideosForProduct(productId: string): Promise<ProductVideo[]> {
  return prisma.productVideo.findMany({
    where: { productId },
    orderBy: { createdAt: "desc" },
  });
}
