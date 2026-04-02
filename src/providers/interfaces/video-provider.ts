export interface VideoGenerationInput {
  imageUrls: string[];
  script: string;
  audioUrl?: string;
  caption?: string;
}

export interface GeneratedVideo {
  videoUrl: string;
  provider: string;
}

export interface VideoProvider {
  name: string;
  generateVideo(input: VideoGenerationInput): Promise<GeneratedVideo>;
}
