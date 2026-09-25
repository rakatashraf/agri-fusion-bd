<script lang="ts">
  import { onMount } from 'svelte';
  import { language } from '$lib/stores/app';

  export let text = '';
  export let compact = false;

  let speaking = false;
  let preparing = false;
  let error = '';
  let voices: SpeechSynthesisVoice[] = [];
  let speechToken = 0;

  const vowelSigns: Record<string,string> = {
    'া':'a','ি':'i','ী':'ee','ু':'u','ূ':'oo','ৃ':'ri','ে':'e','ৈ':'oi','ো':'o','ৌ':'ou'
  };
  const independentVowels: Record<string,string> = {
    'অ':'o','আ':'a','ই':'i','ঈ':'ee','উ':'u','ঊ':'oo','ঋ':'ri','এ':'e','ঐ':'oi','ও':'o','ঔ':'ou'
  };
  const consonants: Record<string,string> = {
    'ক':'k','খ':'kh','গ':'g','ঘ':'gh','ঙ':'ng',
    'চ':'ch','ছ':'chh','জ':'j','ঝ':'jh','ঞ':'ny',
    'ট':'t','ঠ':'th','ড':'d','ঢ':'dh','ণ':'n',
    'ত':'t','থ':'th','দ':'d','ধ':'dh','ন':'n',
    'প':'p','ফ':'f','ব':'b','ভ':'bh','ম':'m',
    'য':'j','র':'r','ল':'l','শ':'sh','ষ':'sh','স':'s','হ':'h',
    'ড়':'r','ঢ়':'rh','য়':'y','ৎ':'t'
  };
  const marks: Record<string,string> = { 'ং':'ng','ঃ':'h','ঁ':'n' };
  const bengaliDigits: Record<string,string> = {
    '০':'0','১':'1','২':'2','৩':'3','৪':'4','৫':'5','৬':'6','৭':'7','৮':'8','৯':'9'
  };

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
      stopSpeech();
      if ('speechSynthesis' in window) {
        window.speechSynthesis.removeEventListener('voiceschanged', refreshVoices);
      }
    };
  });

  $: if ($language) {
    error = '';
    stopSpeech();
  }

  function normalize(value = '') {
    return value.toLowerCase().replace(/_/g, '-');
  }

  function scoreVoice(voice: SpeechSynthesisVoice, lang: 'bn'|'en') {
    const voiceLang = normalize(voice.lang);
    const name = normalize(voice.name);
    let score = 0;

    if (lang === 'bn') {
      if (voiceLang === 'bn-bd') score += 150;
      else if (voiceLang === 'bn-in') score += 140;
      else if (voiceLang.startsWith('bn')) score += 130;

      if (name.includes('bangla')) score += 60;
      if (name.includes('bengali')) score += 60;
      if (name.includes('বাংলা')) score += 60;
      if (name.includes('nabanita')) score += 30;
      if (name.includes('pradeep')) score += 25;
      if (name.includes('tanishaa')) score += 25;
      if (name.includes('bashkar')) score += 25;
      if (name.includes('google')) score += 8;
      if (name.includes('microsoft')) score += 6;
      if (voice.localService) score += 3;
    } else {
      if (voiceLang === 'en-us') score += 110;
      else if (voiceLang === 'en-gb') score += 100;
      else if (voiceLang.startsWith('en')) score += 90;

      if (name.includes('natural')) score += 12;
      if (name.includes('google')) score += 8;
      if (name.includes('microsoft')) score += 6;
      if (voice.localService) score += 3;
    }

    return score;
  }

  function bestVoice(lang: 'bn'|'en') {
    const list = voices.length ? voices : (
      typeof window !== 'undefined' && 'speechSynthesis' in window
        ? window.speechSynthesis.getVoices()
        : []
    );

    return list
      .map((voice) => ({ voice, score: scoreVoice(voice, lang) }))
      .sort((a,b) => b.score - a.score)
      .find((item) => item.score > 0)?.voice ?? null;
  }

  async function waitForVoices(timeout = 1800) {
    refreshVoices();
    if (voices.length) return;

    await new Promise<void>((resolve) => {
      const start = Date.now();
      const timer = window.setInterval(() => {
        refreshVoices();
        if (voices.length || Date.now() - start >= timeout) {
          window.clearInterval(timer);
          resolve();
        }
      }, 80);
    });
  }

  function isConsonant(char = '') {
    return Boolean(consonants[char]);
  }

  function transliterateBangla(value: string) {
    let out = '';

    for (let i = 0; i < value.length; i++) {
      const char = value[i];

      if (independentVowels[char]) {
        out += independentVowels[char];
        continue;
      }

      if (consonants[char]) {
        const next = value[i + 1] || '';
        const next2 = value[i + 2] || '';
        let part = consonants[char];

        if (next === '্') {
          out += part;
          i += 1;
          continue;
        }

        if (vowelSigns[next]) {
          out += part + vowelSigns[next];
          i += 1;
          continue;
        }

        const atWordEnd = !next || /[\s,.;:!?।()\-–—/]/.test(next);
        const beforeMark = marks[next] || bengaliDigits[next];

        if (atWordEnd || beforeMark) {
          out += part;
        } else if (isConsonant(next) || (next === '্' && isConsonant(next2))) {
          out += part + 'o';
        } else {
          out += part + 'o';
        }
        continue;
      }

      if (vowelSigns[char]) {
        out += vowelSigns[char];
        continue;
      }

      if (marks[char]) {
        out += marks[char];
        continue;
      }

      if (bengaliDigits[char]) {
        out += bengaliDigits[char];
        continue;
      }

      if (char === '্') continue;
      out += char;
    }

    return out
      .replace(/oo+/g,'oo')
      .replace(/aa+/g,'aa')
      .replace(/\s+/g,' ')
      .trim();
  }

  function splitForSpeech(value: string) {
    const cleaned = value.replace(/\s+/g, ' ').trim();
    if (!cleaned) return [];
    if (cleaned.length <= 180) return [cleaned];

    const sentences = cleaned.split(/(?<=[।.!?])\s+/).filter(Boolean);
    const chunks: string[] = [];
    let active = '';

    for (const sentence of sentences.length ? sentences : [cleaned]) {
      if ((active + ' ' + sentence).trim().length <= 180) {
        active = (active + ' ' + sentence).trim();
      } else {
        if (active) chunks.push(active);
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

    if (active) chunks.push(active);
    return chunks;
  }

  function stopSpeech() {
    speechToken += 1;
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }
    speaking = false;
    preparing = false;
  }

  async function speakChunks(
    chunks: string[],
    voice: SpeechSynthesisVoice | null,
    langCode: string,
    rate: number,
    token: number
  ) {
    if (!chunks.length) return;

    speaking = true;
    preparing = false;

    for (const chunk of chunks) {
      if (token !== speechToken) return;

      await new Promise<void>((resolve, reject) => {
        const utterance = new SpeechSynthesisUtterance(chunk);
        if (voice) utterance.voice = voice;
        utterance.lang = voice?.lang || langCode;
        utterance.rate = rate;
        utterance.pitch = 1;
        utterance.volume = 1;

        utterance.onend = () => resolve();
        utterance.onerror = (event) => {
          if (event.error === 'canceled' || event.error === 'interrupted') resolve();
          else reject(new Error(event.error || 'Speech failed'));
        };

        window.speechSynthesis.speak(utterance);

        // Chrome can occasionally leave synthesis paused after language/voice changes.
        window.setTimeout(() => {
          if (window.speechSynthesis.paused) window.speechSynthesis.resume();
        }, 120);
      });
    }

    if (token === speechToken) speaking = false;
  }

  async function speak() {
    if (!text?.trim() || typeof window === 'undefined') return;

    if (speaking || preparing) {
      stopSpeech();
      return;
    }

    if (!('speechSynthesis' in window)) {
      error = $language === 'bn'
        ? 'এই ব্রাউজারে ভয়েস সুবিধা নেই'
        : 'Voice is not supported in this browser.';
      return;
    }

    error = '';
    preparing = true;
    const token = ++speechToken;

    try {
      await waitForVoices();
      if (token !== speechToken) return;

      if ($language === 'bn') {
        const banglaVoice = bestVoice('bn');

        if (banglaVoice) {
          await speakChunks(splitForSpeech(text), banglaVoice, 'bn-BD', .86, token);
          return;
        }

        // Last-resort accessibility fallback for devices (notably some Windows installs)
        // that expose no Bengali TTS voice at all.
        const englishVoice = bestVoice('en');
        const phonetic = transliterateBangla(text);

        if (!phonetic) throw new Error('Could not prepare Bangla speech');
        await speakChunks(splitForSpeech(phonetic), englishVoice, 'en-US', .78, token);
        return;
      }

      const englishVoice = bestVoice('en');
      await speakChunks(splitForSpeech(text), englishVoice, 'en-US', .92, token);
    } catch (speechError) {
      console.error('Speech failed', speechError);
      if (token === speechToken) {
        speaking = false;
        preparing = false;
        error = $language === 'bn'
          ? 'বাংলা অডিও চালানো যায়নি'
          : 'Audio could not be played.';
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
