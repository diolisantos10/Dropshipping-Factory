import type { VideoProvider, VideoGenerationInput, GeneratedVideo } from "../interfaces/video-provider";

/**
 * BasicVideoProvider — stub implementation.
 * Outputs a manifest JSON that can be passed to a video rendering service
 * (e.g. Remotion, FFmpeg job, or a third-party API like Creatomate/Shotstack).
 *
 * Swap this provider to plug in a real video generator.
 */
export class BasicVideoProvider implements VideoProvider {
  name = "basic";

  async generateVideo(input: VideoGenerationInput): Promise<GeneratedVideo> {
    // In production: call Creatomate, Shotstack, Remotion render, etc.
    // For MVP: return a JSON manifest URL (or a placeholder)
    const manifest = {
      provider: this.name,
      images: input.imageUrls,
      script: input.script,
      audioUrl: input.audioUrl,
      caption: input.caption,
      generatedAt: new Date().toISOString(),
      note: "Replace BasicVideoProvider with a real video renderer to get actual video output.",
    };

    // Encode manifest as data URI for local preview
    const manifestJson = JSON.stringify(manifest, null, 2);
    const dataUri = `data:application/json;base64,${Buffer.from(manifestJson).toString("base64")}`;

    console.log("[BasicVideoProvider] Video manifest generated:", manifest);

    return {
      videoUrl: dataUri,
      provider: this.name,
    };
  }
}
