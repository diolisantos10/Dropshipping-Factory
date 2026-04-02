import { ElevenLabsVoiceProvider } from "./elevenlabs-voice-provider";
import type { VoiceProvider } from "../interfaces/voice-provider";

export function getVoiceProvider(): VoiceProvider {
  const apiKey = process.env.ELEVENLABS_API_KEY;
  if (!apiKey) throw new Error("ELEVENLABS_API_KEY is not set");
  return new ElevenLabsVoiceProvider(apiKey, process.env.ELEVENLABS_VOICE_ID);
}

export type { VoiceProvider };
export { ElevenLabsVoiceProvider };
