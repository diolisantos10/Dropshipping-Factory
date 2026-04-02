import OpenAI from "openai";
import type { TextProvider, ProductTextData, VideoScript } from "../interfaces/text-provider";

export class OpenAITextProvider implements TextProvider {
  private client: OpenAI;
  private model: string;

  constructor(apiKey: string, model = "gpt-4o-mini") {
    this.client = new OpenAI({ apiKey });
    this.model = model;
  }

  async generateProductContent(rawData: Record<string, unknown>): Promise<ProductTextData> {
    const prompt = `You are a dropshipping product copywriter. Given the following raw product data from AliExpress, generate clean, sales-optimized product content.

Raw data:
${JSON.stringify(rawData, null, 2)}

Respond with valid JSON only matching this structure:
{
  "productName": "clean product name (max 80 chars)",
  "shortDescription": "1-2 sentence description (max 150 chars)",
  "longDescription": "compelling 3-5 paragraph product description",
  "bulletPoints": ["feature 1", "feature 2", "feature 3", "feature 4", "feature 5"],
  "benefits": ["benefit 1", "benefit 2", "benefit 3"],
  "tags": ["tag1", "tag2", "tag3", "tag4", "tag5"],
  "category": "product category",
  "suggestedPrice": 29.99,
  "compareAtPrice": 49.99
}`;

    const response = await this.client.chat.completions.create({
      model: this.model,
      messages: [{ role: "user", content: prompt }],
      response_format: { type: "json_object" },
      temperature: 0.7,
    });

    const content = response.choices[0].message.content;
    if (!content) throw new Error("Empty response from OpenAI");
    return JSON.parse(content) as ProductTextData;
  }

  async generateVideoScript(product: ProductTextData, variantIndex = 0): Promise<VideoScript> {
    const variants = [
      "Create a 'problem-solution' style script. Start with a relatable problem the viewer has, then reveal this product as the perfect solution.",
      "Create a 'wow factor' style script. Lead with the most impressive feature or result of this product to grab attention immediately.",
      "Create a 'social proof' style script. Frame the script as if many people are already using this product and loving it.",
    ];
    const styleInstruction = variants[variantIndex % variants.length];

    const prompt = `You are a TikTok video script writer for dropshipping products. Write a short vertical sales video script (30-60 seconds when spoken).

Product: ${product.productName}
Description: ${product.shortDescription}
Benefits: ${product.benefits.join(", ")}
Category: ${product.category}

Script style: ${styleInstruction}

Respond with valid JSON only:
{
  "hook": "first 5-10 words to stop the scroll",
  "body": "main script body explaining the product (2-3 short sentences)",
  "cta": "call to action (e.g. 'Link in bio to get yours!')",
  "fullScript": "complete script from hook to CTA as it would be spoken",
  "caption": "TikTok caption for this video (max 150 chars)",
  "hashtags": ["#hashtag1", "#hashtag2", "#hashtag3", "#hashtag4", "#hashtag5", "#hashtag6", "#hashtag7", "#hashtag8"]
}`;

    const response = await this.client.chat.completions.create({
      model: this.model,
      messages: [{ role: "user", content: prompt }],
      response_format: { type: "json_object" },
      temperature: 0.8,
    });

    const content = response.choices[0].message.content;
    if (!content) throw new Error("Empty response from OpenAI");
    return JSON.parse(content) as VideoScript;
  }
}
