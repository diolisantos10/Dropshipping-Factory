export interface VoiceOptions {
  voiceId?: string;
  speed?: number;
  pitch?: number;
}

export interface VoiceProvider {
  name: string;
  generateVoiceover(script: string, options?: VoiceOptions): Promise<string>; // returns audio URL or base64
}
