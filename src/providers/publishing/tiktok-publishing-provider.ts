import type { PublishingProvider, PublishPayload, PublishResult } from "../interfaces/publishing-provider";

/**
 * TikTokPublishingProvider
 *
 * Currently prepares TikTok-ready packages without auto-posting.
 * Full TikTok API publishing requires OAuth flow (Content Posting API).
 * This provider outputs ready-to-use packages for manual posting or
 * future automation once TikTok API credentials are configured.
 */
export class TikTokPublishingProvider implements PublishingProvider {
  channel = "tiktok";
  private accessToken?: string;

  constructor(accessToken?: string) {
    this.accessToken = accessToken;
  }

  async preparePackage(payload: PublishPayload): Promise<Record<string, unknown>> {
    const hashtagString = payload.hashtags.join(" ");
    const fullCaption = `${payload.caption}\n\n${hashtagString}`;

    return {
      channel: "tiktok",
      videoUrl: payload.videoUrl,
      caption: fullCaption,
      hashtags: payload.hashtags,
      productName: payload.productName,
      coverImageUrl: payload.coverImageUrl,
      characterCount: fullCaption.length,
      readyToPost: true,
      preparedAt: new Date().toISOString(),
    };
  }

  async publish(payload: PublishPayload): Promise<PublishResult> {
    if (!this.accessToken) {
      // Return prepared package for manual posting
      const pkg = await this.preparePackage(payload);
      return {
        success: false,
        error: "No TikTok access token configured. Package prepared for manual posting.",
        postId: undefined,
        postUrl: undefined,
        ...{ package: pkg },
      };
    }

    // TODO: Implement TikTok Content Posting API v2
    // POST https://open.tiktokapis.com/v2/post/publish/video/init/
    throw new Error("TikTok API publishing not yet implemented. Configure TIKTOK_ACCESS_TOKEN and implement OAuth flow.");
  }
}
