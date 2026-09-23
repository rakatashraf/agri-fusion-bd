<script lang="ts">
  import { onMount } from 'svelte';

  let mounted = false;
  let leaving = false;
  let visible = true;

  onMount(() => {
    mounted = true;
    document.documentElement.classList.add('agri-loading');

    const reduced = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches ?? false;
    const hold = reduced ? 350 : 2050;

    const leaveTimer = window.setTimeout(() => {
      leaving = true;

      window.setTimeout(() => {
        visible = false;
        document.documentElement.classList.remove('agri-loading');
      }, reduced ? 80 : 320);
    }, hold);

    return () => {
      window.clearTimeout(leaveTimer);
      document.documentElement.classList.remove('agri-loading');
    };
  });
</script>

{#if visible}
  <div
    id="agri-loader"
    class="agri-loader"
    class:mounted
    class:leaving
    role="status"
    aria-label="Loading AgriFusion"
  >
    <div class="loader-symbol" aria-hidden="true">
      <svg viewBox="0 0 160 160">
        <circle class="loader-disc" cx="80" cy="80" r="61" />

        <g class="loader-grains loader-grains-a">
          <ellipse cx="79" cy="16" rx="3.2" ry="7.6" transform="rotate(-18 79 16)" />
          <ellipse cx="111" cy="24" rx="2.7" ry="6.5" transform="rotate(34 111 24)" />
          <ellipse cx="136" cy="48" rx="2.7" ry="6.3" transform="rotate(62 136 48)" />
          <ellipse cx="144" cy="80" rx="2.8" ry="6.4" transform="rotate(90 144 80)" />
          <ellipse cx="131" cy="113" rx="2.6" ry="6.2" transform="rotate(122 131 113)" />
          <ellipse cx="106" cy="135" rx="2.8" ry="6.4" transform="rotate(151 106 135)" />
          <ellipse cx="52" cy="133" rx="2.8" ry="6.4" transform="rotate(-151 52 133)" />
          <ellipse cx="27" cy="111" rx="2.6" ry="6.2" transform="rotate(-122 27 111)" />
          <ellipse cx="16" cy="78" rx="2.8" ry="6.4" transform="rotate(-90 16 78)" />
          <ellipse cx="29" cy="47" rx="2.7" ry="6.3" transform="rotate(-62 29 47)" />
          <ellipse cx="52" cy="25" rx="2.7" ry="6.5" transform="rotate(-34 52 25)" />
        </g>

        <g class="loader-grains loader-grains-b">
          <ellipse class="gold" cx="95" cy="20" rx="2.4" ry="5.6" transform="rotate(18 95 20)" />
          <ellipse class="gold" cx="139" cy="64" rx="2.4" ry="5.8" transform="rotate(76 139 64)" />
          <ellipse class="gold" cx="122" cy="128" rx="2.4" ry="5.8" transform="rotate(138 122 128)" />
          <ellipse class="gold" cx="39" cy="122" rx="2.4" ry="5.8" transform="rotate(-138 39 122)" />
          <ellipse class="gold" cx="21" cy="61" rx="2.4" ry="5.8" transform="rotate(-76 21 61)" />
        </g>

        <g class="loader-leaves">
          <path class="leaf leaf-small"
            d="M69 111C50 102 40 83 41 62c22 6 35 22 39 46-8-15-17-25-28-33 8 10 14 22 17 36Z" />
          <path class="leaf leaf-large"
            d="M69 126c4-35 25-66 66-81 1 40-19 73-58 91 12-27 28-49 47-65-26 13-44 31-55 55Z" />
          <path class="leaf-cut leaf-cut-small"
            d="M67 104c-5-12-11-22-19-30 11 8 20 18 27 31-2 2-5 2-8-1Z" />
          <path class="leaf-cut leaf-cut-large"
            d="M77 124c11-25 27-45 47-59-18 16-34 38-46 66-2-2-2-4-1-7Z" />
        </g>
      </svg>
    </div>
  </div>
{/if}

<style>
  :global(html.agri-loading),
  :global(html.agri-loading body) {
    overflow: hidden !important;
  }

  .agri-loader {
    position: fixed;
    inset: 0;
    z-index: 100000;
    display: grid;
    place-items: center;
    background: #f6f4eb;
    opacity: 0;
    visibility: hidden;
    pointer-events: none;
    transition: opacity .3s ease, visibility .3s ease;
  }

  .agri-loader.mounted {
    opacity: 1;
    visibility: visible;
    pointer-events: auto;
  }

  .agri-loader.leaving {
    opacity: 0;
    visibility: visible;
    pointer-events: none;
  }

  .loader-symbol {
    width: clamp(138px, 17vw, 220px);
    aspect-ratio: 1;
    display: grid;
    place-items: center;
    filter: drop-shadow(0 18px 34px rgba(20, 53, 29, .08));
  }

  svg {
    width: 100%;
    height: 100%;
    overflow: visible;
  }

  .loader-disc {
    fill: #d9ff54;
    opacity: 0;
    transform-origin: 80px 80px;
    transform: scale(.08);
    animation: discAppear .48s cubic-bezier(.2,.9,.25,1.12) 1.22s forwards;
  }

  .leaf {
    fill: #082d14;
  }

  .leaf-cut {
    fill: #d9ff54;
    opacity: 0;
    animation: cutsAppear .18s ease 1.42s forwards;
  }

  .loader-leaves {
    transform-box: fill-box;
    transform-origin: center bottom;
    opacity: 0;
    transform: translateY(12px) scale(.16);
    animation: leavesBloom .88s cubic-bezier(.18,.88,.3,1.15) .37s forwards;
  }

  .leaf-small {
    transform-box: fill-box;
    transform-origin: bottom right;
    animation: smallLeafGrow .72s cubic-bezier(.2,.8,.25,1.1) .42s both;
  }

  .leaf-large {
    transform-box: fill-box;
    transform-origin: bottom left;
    animation: largeLeafGrow .8s cubic-bezier(.18,.88,.28,1.13) .5s both;
  }

  .loader-grains {
    fill: #789f3e;
    transform-origin: 80px 80px;
    transform-box: view-box;
    opacity: 0;
  }

  .loader-grains .gold {
    fill: #c6a547;
  }

  .loader-grains-a {
    animation: grainsInA 1.1s cubic-bezier(.16,.7,.24,1) .12s forwards;
  }

  .loader-grains-b {
    animation: grainsInB 1.05s cubic-bezier(.16,.7,.24,1) .2s forwards;
  }

  @keyframes grainsInA {
    0% {
      opacity: 0;
      transform: rotate(-35deg) scale(1.34);
    }
    18% {
      opacity: .92;
    }
    72% {
      opacity: .82;
      transform: rotate(240deg) scale(.76);
    }
    100% {
      opacity: 0;
      transform: rotate(325deg) scale(.26);
    }
  }

  @keyframes grainsInB {
    0% {
      opacity: 0;
      transform: rotate(25deg) scale(1.42);
    }
    20% {
      opacity: .85;
    }
    75% {
      opacity: .72;
      transform: rotate(-215deg) scale(.72);
    }
    100% {
      opacity: 0;
      transform: rotate(-300deg) scale(.24);
    }
  }

  @keyframes leavesBloom {
    0% {
      opacity: 0;
      transform: translateY(13px) scale(.16);
    }
    35% {
      opacity: 1;
    }
    100% {
      opacity: 1;
      transform: translateY(0) scale(1);
    }
  }

  @keyframes smallLeafGrow {
    from { transform: rotate(-16deg) scale(.18); }
    to { transform: rotate(0) scale(1); }
  }

  @keyframes largeLeafGrow {
    from { transform: rotate(13deg) scale(.12); }
    to { transform: rotate(0) scale(1); }
  }

  @keyframes discAppear {
    0% {
      opacity: 0;
      transform: scale(.08);
    }
    58% {
      opacity: 1;
      transform: scale(1.045);
    }
    100% {
      opacity: 1;
      transform: scale(1);
    }
  }

  @keyframes cutsAppear {
    to { opacity: 1; }
  }

  @media (max-width: 640px) {
    .loader-symbol {
      width: clamp(128px, 42vw, 180px);
    }
  }

  @media (prefers-reduced-motion: reduce) {
    .agri-loader {
      transition-duration: .08s;
    }

    .loader-grains {
      display: none;
    }

    .loader-disc,
    .loader-leaves,
    .leaf-small,
    .leaf-large,
    .leaf-cut {
      animation: none !important;
      opacity: 1;
      transform: none;
    }
  }
</style>
