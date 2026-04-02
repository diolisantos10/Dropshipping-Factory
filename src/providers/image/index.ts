import { BasicImageProvider } from "./basic-image-provider";
import type { ImageProvider } from "../interfaces/image-provider";

export function getImageProvider(): ImageProvider {
  return new BasicImageProvider(process.env.REMOVE_BG_API_KEY);
}

export type { ImageProvider };
export { BasicImageProvider };
