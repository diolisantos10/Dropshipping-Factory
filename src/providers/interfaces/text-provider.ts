export interface ProductTextData {
  productName: string;
  shortDescription: string;
  longDescription: string;
  bulletPoints: string[];
  benefits: string[];
  tags: string[];
  category: string;
  suggestedPrice: number;
  compareAtPrice: number;
}

export interface VideoScript {
  hook: string;
  body: string;
  cta: string;
  fullScript: string;
  caption: string;
  hashtags: string[];
}

export interface TextProvider {
  generateProductContent(rawData: Record<string, unknown>): Promise<ProductTextData>;
  generateVideoScript(product: ProductTextData, variantIndex?: number): Promise<VideoScript>;
}
