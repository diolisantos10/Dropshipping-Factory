import { TikTokPublishingProvider } from "./tiktok-publishing-provider";
import type { PublishingProvider } from "../interfaces/publishing-provider";

export function getPublishingProvider(channel: string): PublishingProvider {
  switch (channel) {
    case "tiktok":
      return new TikTokPublishingProvider(process.env.TIKTOK_ACCESS_TOKEN);
    default:
      throw new Error(`Unknown publishing channel: ${channel}`);
  }
}

export type { PublishingProvider };
export { TikTokPublishingProvider };
