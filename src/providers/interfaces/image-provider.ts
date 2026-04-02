export interface ProcessedImage {
  originalUrl: string;
  processedUrl?: string;
  whiteBgUrl?: string;
  isMain: boolean;
  sortOrder: number;
}

export interface ImageProvider {
  processProductImages(imageUrls: string[]): Promise<ProcessedImage[]>;
  removeBackground(imageUrl: string): Promise<string>;
}
