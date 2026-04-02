import type { VoiceProvider, VoiceOptions } from "../interfaces/voice-provider";

export class ElevenLabsVoiceProvider implements VoiceProvider {
  name = "elevenlabs";
  private apiKey: string;
  private defaultVoiceId: string;

  constructor(apiKey: string, defaultVoiceId = "21m00Tcm4TlvDq8ikWAM") {
    this.apiKey = apiKey;
    this.defaultVoiceId = defaultVoiceId;
  }

  async generateVoiceover(script: string, options?: VoiceOptions): Promise<string> {
    const voiceId = options?.voiceId || this.defaultVoiceId;

    const response = await fetch(
      `https://api.elevenlabs.io/v1/text-to-speech/${voiceId}`,
      {
        method: "POST",
        headers: {
          "xi-api-key": this.apiKey,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          text: script,
          model_id: "eleven_monolingual_v1",
          voice_settings: {
            stability: 0.5,
            similarity_boost: 0.75,
          },
        }),
      }
    );

    if (!response.ok) {
      throw new Error(`ElevenLabs error: ${await response.text()}`);
    }

    const arrayBuffer = await response.arrayBuffer();
    const base64 = Buffer.from(arrayBuffer).toString("base64");
    return `data:audio/mpeg;base64,${base64}`;
  }
}
