<script lang="ts">
  import { onMount } from 'svelte';
  import { language } from '$lib/stores/app';

  export let text = '';
  export let compact = false;

  let speaking = false;
  let preparing = false;
  let error = '';
  let voices: SpeechSynthesisVoice[] = [];
  let currentAudio: HTMLAudioElement | null = null;
  let currentUrl: string | null = null;
  let piperEngine: any = null;

  class CachedFetchProvider {
    private objectUrls: string[] = [];

    destroy() {
      this.objectUrls.forEach((url) => URL.revokeObjectURL(url));
      this.objectUrls = [];
    }

    async fetch(url: string) {
      const isJson = url.endsWith('.json');
      let response: Response | undefined;

      if ('caches' in window) {
        const cache = await caches.open('agrifusion-bangla-tts-v1');
        const cached = await cache.match(url);
        if (cached) {
          response = cached;
        } else {
          const network = await fetch(url, { mode: 'cors' });
          if (!network.ok) throw new Error('Could not fetch Bengali voice model');
          await cache.put(url, network.clone());
          response = network;
        }
      } else {
        const network = await fetch(url, { mode: 'cors' });
        if (!network.ok) throw new Error('Could not fetch Bengali voice model');
        response = network;
      }

      if (isJson) return response.json();

      const objectUrl = URL.createObjectURL(await response.blob());
      this.objectUrls.push(objectUrl);
      return objectUrl;
    }
  }

  function refreshVoices() {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) return;
    voices = window.speechSynthesis.getVoices();
  }

  onMount(() => {
    refreshVoices();

    if ('speechSynthesis' in window) {
      window.speechSynthesis.addEventListener('voiceschanged', refreshVoices);
    }

    return () => {
      stopAll();
      if ('speechSynthesis' in window) {
        window.speechSynthesis.removeEventListener('voiceschanged', refreshVoices);
      }
      piperEngine?.destroy?.();
    };
  });

  $: if ($language) {
    error = '';
    if (typeof window !== 'undefined' && 'speechSynthesis' in window && window.speechSynthesis.speaking) {
      window.speechSynthesis.cancel();
      speaking = false;
    }
    if (currentAudio) {
      currentAudio.pause();
      currentAudio = null;
      speaking = false;
    }
  }

  function normalize(value = '') {
    return value.toLowerCase().replace('_', '-');
  }

  function bestVoice(lang: 'bn' | 'en') {
    const candidates = voices.length ? voices : (
      typeof window !== 'undefined' && 'speechSynthesis' in window
        ? window.speechSynthesis.getVoices()
        : []
    );

    if (!candidates.length) return null;

    const scored = candidates.map((voice) => {
      const voiceLang = normalize(voice.lang);
      const name = normalize(voice.name);
      let score = 0;

      if (lang === 'bn') {
        if (voiceLang === 'bn-bd') score += 120;
        else if (voiceLang === 'bn-in') score += 110;
        else if (voiceLang.startsWith('bn')) score += 100;

        if (name.includes('bangla')) score += 35;
        if (name.includes('bengali')) score += 35;
        if (name.includes('বাংলা')) score += 35;
        if (name.includes('nabanita')) score += 25;
        if (name.includes('pradeep')) score += 20;
        if (name.includes('tanishaa')) score += 18;
        if (name.includes('bashkar')) score += 18;
        if (voice.localService) score += 3;
      } else {
        if (voiceLang === 'en-us') score += 100;
        else if (voiceLang === 'en-gb') score += 90;
        else if (voiceLang.startsWith('en')) score += 80;
        if (name.includes('natural')) score += 10;
        if (name.includes('google')) score += 6;
        if (name.includes('microsoft')) score += 5;
      }

      return { voice, score };
    }).sort((a, b) => b.score - a.score);

    return scored[0]?.score > 0 ? scored[0].voice : null;
  }

  async function waitForVoices(timeout = 1600) {
    refreshVoices();
    if (voices.length) return;

    await new Promise<void>((resolve) => {
      const started = Date.now();
      const timer = window.setInterval(() => {
        refreshVoices();
        if (voices.length || Date.now() - started >= timeout) {
          window.clearInterval(timer);
          resolve();
        }
      }, 80);
    });
  }

  function splitForSpeech(value: string) {
    const cleaned = value.replace(/\s+/g, ' ').trim();
    if (cleaned.length <= 180) return [cleaned];

    const sentences = cleaned.split(/(?<=[।.!?])\s+/).filter(Boolean);
    const chunks: string[] = [];
    let active = '';

    for (const sentence of sentences.length ? sentences : [cleaned]) {
      if ((active + ' ' + sentence).trim().length <= 180) {
        active = (active + ' ' + sentence).trim();
      } else {
        if (active) chunks.push(active);
        if (sentence.length <= 180) {
          active = sentence;
        } else {
          const words = sentence.split(' ');
          active = '';
          for (const word of words) {
            if ((active + ' ' + word).trim().length > 180) {
              if (active) chunks.push(active);
              active = word;
            } else {
              active = (active + ' ' + word).trim();
            }
          }
        }
      }
    }

    if (active) chunks.push(active);
    return chunks;
  }

  function stopAll() {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }

    if (currentAudio) {
      currentAudio.pause();
      currentAudio.currentTime = 0;
      currentAudio = null;
    }

    if (currentUrl) {
      URL.revokeObjectURL(currentUrl);
      currentUrl = null;
    }

    speaking = false;
    preparing = false;
  }

  async function speakNative(voice: SpeechSynthesisVoice, lang: 'bn' | 'en') {
    const chunks = splitForSpeech(text);
    if (!chunks.length) return;

    window.speechSynthesis.cancel();
    speaking = true;

    for (const chunk of chunks) {
      await new Promise<void>((resolve, reject) => {
        const utterance = new SpeechSynthesisUtterance(chunk);
        utterance.voice = voice;
        utterance.lang = lang === 'bn' ? (voice.lang || 'bn-BD') : (voice.lang || 'en-US');
        utterance.rate = lang === 'bn' ? 0.86 : 0.92;
        utterance.pitch = 1;
        utterance.volume = 1;
        utterance.onend = () => resolve();
        utterance.onerror = (event) => reject(new Error(event.error || 'Speech failed'));
        window.speechSynthesis.speak(utterance);
      });
    }

    speaking = false;
  }

  async function getPiperEngine() {
    if (piperEngine) return piperEngine;

    const {
      PiperWebEngine,
      OnnxWebRuntime,
      PhonemizeWebRuntime,
      HuggingFaceVoiceProvider
    } = await import('piper-tts-web');

    const base = import.meta.env.BASE_URL || '/';
    const provider = new CachedFetchProvider();

    piperEngine = new PiperWebEngine({
      onnxRuntime: new OnnxWebRuntime({
        basePath: base + 'onnx/',
        numThreads: 1
      }),
      phonemizeRuntime: new PhonemizeWebRuntime({
        basePath: base + 'piper/'
      }),
      voiceProvider: new HuggingFaceVoiceProvider({ provider })
    });

    return piperEngine;
  }

  async function speakBanglaFallback() {
    preparing = true;
    error = '';

    try {
      const engine = await getPiperEngine();
      const response = await engine.generate(text, 'bn_BD-google-medium', 0);

      if (!response?.file) throw new Error('No Bengali audio was generated');

      currentUrl = URL.createObjectURL(response.file);
      currentAudio = new Audio(currentUrl);
      currentAudio.preload = 'auto';
      currentAudio.playbackRate = 1;

      currentAudio.onplay = () => {
        preparing = false;
        speaking = true;
      };
      currentAudio.onended = () => {
        speaking = false;
        currentAudio = null;
        if (currentUrl) {
          URL.revokeObjectURL(currentUrl);
          currentUrl = null;
        }
      };
      currentAudio.onerror = () => {
        speaking = false;
        preparing = false;
        error = 'বাংলা অডিও চালানো যায়নি';
      };

      await currentAudio.play();
    } catch (fallbackError) {
      console.error('Bangla TTS fallback failed', fallbackError);
      preparing = false;
      speaking = false;
      error = 'বাংলা ভয়েস লোড করা যায়নি। ইন্টারনেট সংযোগ পরীক্ষা করুন।';
    }
  }

  async function speak() {
    if (!text?.trim() || typeof window === 'undefined') return;

    if (speaking || preparing) {
      stopAll();
      return;
    }

    error = '';
    preparing = true;

    try {
      if ('speechSynthesis' in window) {
        await waitForVoices();

        const lang = $language === 'bn' ? 'bn' : 'en';
        const voice = bestVoice(lang);

        if (voice) {
          preparing = false;
          await speakNative(voice, lang);
          return;
        }

        // Some browsers can synthesize a language even when getVoices() does not expose it.
        if (lang === 'en') {
          const utterance = new SpeechSynthesisUtterance(text);
          utterance.lang = 'en-US';
          utterance.rate = .92;
          utterance.onstart = () => {
            preparing = false;
            speaking = true;
          };
          utterance.onend = () => speaking = false;
          utterance.onerror = () => {
            preparing = false;
            speaking = false;
            error = 'Audio is not available on this browser.';
          };
          window.speechSynthesis.speak(utterance);
          return;
        }
      }

      if ($language === 'bn') {
        await speakBanglaFallback();
        return;
      }

      preparing = false;
      error = 'Audio is not available on this browser.';
    } catch (speechError) {
      console.error('Speech failed', speechError);
      stopAll();

      if ($language === 'bn') {
        await speakBanglaFallback();
      } else {
        error = 'Audio is not available on this browser.';
      }
    }
  }
</script>

<div class="voice-guide-wrap" class:compact>
  <button
    type="button"
    class:compact
    class:speaking
    class:preparing
    class="voice-guide"
    on:click={speak}
    aria-pressed={speaking}
    aria-label={$language === 'bn' ? 'এই লেখা শুনুন' : 'Listen to this text'}
    title={$language === 'bn'
      ? (preparing ? 'বাংলা ভয়েস প্রস্তুত হচ্ছে' : speaking ? 'বন্ধ করতে চাপুন' : 'বাংলায় শুনুন')
      : (preparing ? 'Preparing voice' : speaking ? 'Tap to stop' : 'Listen')}
  >
    <span class="voice-icon">{preparing ? '◌' : speaking ? '◖))' : '🔊'}</span>
    {#if !compact}
      <span>
        {$language === 'bn'
          ? (preparing ? 'ভয়েস প্রস্তুত…' : speaking ? 'শুনছেন…' : 'শুনুন')
          : (preparing ? 'Preparing…' : speaking ? 'Playing…' : 'Listen')}
      </span>
    {/if}
  </button>

  {#if error && !compact}
    <small class="voice-error" role="status">{error}</small>
  {/if}
</div>

<style>
  .voice-guide-wrap {
    display: inline-grid;
    gap: 5px;
  }

  .voice-guide-wrap.compact {
    display: inline-flex;
  }

  .voice-guide.preparing .voice-icon {
    display: inline-block;
    animation: voiceSpin .8s linear infinite;
  }

  .voice-error {
    max-width: 270px;
    color: #9b3d31;
    font-size: .69rem;
    line-height: 1.35;
  }

  @keyframes voiceSpin {
    to { transform: rotate(360deg); }
  }

  @media (prefers-reduced-motion: reduce) {
    .voice-guide.preparing .voice-icon {
      animation: none;
    }
  }
</style>
