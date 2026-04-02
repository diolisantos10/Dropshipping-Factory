import type { ImageProvider, ProcessedImage } from "../interfaces/image-provider";

/**
 * BasicImageProvider — no external API needed.
 * Passes through original AliExpress image URLs.
 * White background removal can be enabled by setting REMOVE_BG_API_KEY.
 */
export class BasicImageProvider implements ImageProvider {
  private removeBgApiKey?: string;

  constructor(removeBgApiKey?: string) {
    this.removeBgApiKey = removeBgApiKey;
  }

  async processProductImages(imageUrls: string[]): Promise<ProcessedImage[]> {
    return imageUrls.map((url, index) => ({
      originalUrl: url,
      processedUrl: url,
      whiteBgUrl: undefined,
      isMain: index === 0,
      sortOrder: index,
    }));
  }

  async removeBackground(imageUrl: string): Promise<string> {
    if (!this.removeBgApiKey) {
      console.warn("No REMOVE_BG_API_KEY set — returning original image URL");
      return imageUrl;
    }

    const formData = new FormData();
    formData.append("image_url", imageUrl);
    formData.append("size", "auto");

    const response = await fetch("https://api.remove.bg/v1.0/removebg", {
      method: "POST",
      headers: { "X-Api-Key": this.removeBgApiKey },
      body: formData,
    });

    if (!response.ok) {
      console.error("remove.bg error:", await response.text());
      return imageUrl;
    }

    // Returns binary — in production, upload to storage and return URL
    const blob = await response.blob();
    const arrayBuffer = await blob.arrayBuffer();
    const base64 = Buffer.from(arrayBuffer).toString("base64");
    return `data:image/png;base64,${base64}`;
  }
}
