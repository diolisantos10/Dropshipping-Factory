import { OpenAITextProvider } from "./openai-text-provider";
import type { TextProvider } from "../interfaces/text-provider";

export function getTextProvider(): TextProvider {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) throw new Error("OPENAI_API_KEY is not set");
  return new OpenAITextProvider(apiKey, process.env.OPENAI_MODEL || "gpt-4o-mini");
}

export type { TextProvider };
export { OpenAITextProvider };
