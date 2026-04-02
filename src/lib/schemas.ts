import { z } from "zod";

export const QueueProductSchema = z.object({
  sourceUrl: z.string().url().refine(
    (url) => url.includes("aliexpress.com"),
    "URL must be from AliExpress"
  ),
});

export const UpdateProductSchema = z.object({
  productName: z.string().min(1).max(255).optional(),
  shortDescription: z.string().max(500).optional(),
  longDescription: z.string().optional(),
  bulletPoints: z.array(z.string()).optional(),
  benefits: z.array(z.string()).optional(),
  tags: z.array(z.string()).optional(),
  category: z.string().optional(),
  costPrice: z.number().positive().optional(),
  suggestedPrice: z.number().positive().optional(),
  compareAtPrice: z.number().positive().optional(),
  status: z.enum(["QUEUED", "PROCESSING", "READY", "PUBLISHED", "FAILED"]).optional(),
});

export const CreatePublishJobSchema = z.object({
  productId: z.string().cuid(),
  videoId: z.string().cuid().optional(),
  channel: z.string().min(1),
});

export const CreateTrendReportSchema = z.object({
  title: z.string().min(1),
  summary: z.string().optional(),
  data: z.record(z.unknown()).optional(),
});

export type QueueProductInput = z.infer<typeof QueueProductSchema>;
export type UpdateProductInput = z.infer<typeof UpdateProductSchema>;
export type CreatePublishJobInput = z.infer<typeof CreatePublishJobSchema>;
export type CreateTrendReportInput = z.infer<typeof CreateTrendReportSchema>;
