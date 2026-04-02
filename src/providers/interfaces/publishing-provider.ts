export interface PublishPayload {
  videoUrl: string;
  caption: string;
  hashtags: string[];
  productName: string;
  coverImageUrl?: string;
}

export interface PublishResult {
  success: boolean;
  postId?: string;
  postUrl?: string;
  error?: string;
}

export interface PublishingProvider {
  channel: string;
  publish(payload: PublishPayload): Promise<PublishResult>;
  preparePackage(payload: PublishPayload): Promise<Record<string, unknown>>;
}
