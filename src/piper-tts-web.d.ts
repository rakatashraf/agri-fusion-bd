declare module 'piper-tts-web' {
  export class PiperWebEngine {
    constructor(options?: any);
    generate(text: string, voice: string, speaker?: number): Promise<any>;
    destroy(): void;
  }
  export class OnnxWebRuntime {
    constructor(options?: any);
  }
  export class PhonemizeWebRuntime {
    constructor(options?: any);
  }
  export class HuggingFaceVoiceProvider {
    constructor(options?: any);
  }
}
