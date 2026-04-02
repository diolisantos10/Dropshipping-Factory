import { BasicVideoProvider } from "./basic-video-provider";
import type { VideoProvider } from "../interfaces/video-provider";

export function getVideoProvider(): VideoProvider {
  // Swap with CreatomateVideoProvider, ShotstackVideoProvider, etc.
  return new BasicVideoProvider();
}

export type { VideoProvider };
export { BasicVideoProvider };
