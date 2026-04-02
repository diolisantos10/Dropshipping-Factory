import { prisma } from "@/lib/prisma";
import { getPublishingProvider } from "@/providers/publishing";
import type { PublishJob } from "@prisma/client";

export async function createPublishJob(
  productId: string,
  channel: string,
  videoId?: string
): Promise<PublishJob> {
  const product = await prisma.product.findUniqueOrThrow({
    where: { id: productId },
    include: {
      images: { where: { isMain: true }, take: 1 },
    },
  });

  let video = null;
  if (videoId) {
    video = await prisma.productVideo.findUnique({ where: { id: videoId } });
  } else {
    video = await prisma.productVideo.findFirst({
      where: { productId, status: "READY" },
      orderBy: { createdAt: "desc" },
    });
  }

  const provider = getPublishingProvider(channel);

  const payload = video
    ? await provider.preparePackage({
        videoUrl: video.videoUrl || "",
        caption: video.caption || product.shortDescription || product.productName || "",
        hashtags: (video.hashtags as string[]) || [],
        productName: product.productName || "",
        coverImageUrl: product.images[0]?.processedUrl || product.images[0]?.originalUrl,
      })
    : null;

  return prisma.publishJob.create({
    data: {
      productId,
      videoId: video?.id,
      channel,
      payload: payload ?? {},
      status: "PENDING",
    },
  });
}

export async function executePublishJob(jobId: string): Promise<PublishJob> {
  const job = await prisma.publishJob.findUniqueOrThrow({
    where: { id: jobId },
    include: {
      product: true,
      video: true,
    },
  });

  await prisma.publishJob.update({ where: { id: jobId }, data: { status: "PROCESSING" } });

  try {
    const provider = getPublishingProvider(job.channel);

    const result = await provider.publish({
      videoUrl: job.video?.videoUrl || "",
      caption: job.video?.caption || job.product.shortDescription || job.product.productName || "",
      hashtags: (job.video?.hashtags as string[]) || [],
      productName: job.product.productName || "",
    });

    return prisma.publishJob.update({
      where: { id: jobId },
      data: {
        status: result.success ? "PUBLISHED" : "FAILED",
        result: result as unknown as object,
      },
    });
  } catch (error) {
    return prisma.publishJob.update({
      where: { id: jobId },
      data: {
        status: "FAILED",
        result: { error: error instanceof Error ? error.message : String(error) },
      },
    });
  }
}

export async function listPublishJobs(channel?: string) {
  return prisma.publishJob.findMany({
    where: channel ? { channel } : undefined,
    orderBy: { createdAt: "desc" },
    include: {
      product: { select: { id: true, productName: true, status: true } },
      video: { select: { id: true, caption: true, status: true } },
    },
  });
}
