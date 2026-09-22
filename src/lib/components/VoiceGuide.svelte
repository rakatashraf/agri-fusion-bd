<script lang="ts">
  import { language } from '$lib/stores/app';

  export let text = '';
  export let compact = false;
  let speaking = false;

  function speak() {
    if (typeof window === 'undefined' || !('speechSynthesis' in window) || !text) return;

    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = $language === 'bn' ? 'bn-BD' : 'en-US';
    utterance.rate = $language === 'bn' ? 0.82 : 0.9;
    utterance.pitch = 1;
    utterance.onstart = () => speaking = true;
    utterance.onend = () => speaking = false;
    utterance.onerror = () => speaking = false;
    window.speechSynthesis.speak(utterance);
  }
</script>

<button
  type="button"
  class:compact
  class:speaking
  class="voice-guide"
  on:click={speak}
  aria-label={$language === 'bn' ? 'এই লেখা শুনুন' : 'Listen to this text'}
>
  <span class="voice-icon">{speaking ? '◖))' : '🔊'}</span>
  {#if !compact}
    <span>{$language === 'bn' ? (speaking ? 'শুনছেন…' : 'শুনুন') : (speaking ? 'Playing…' : 'Listen')}</span>
  {/if}
</button>
