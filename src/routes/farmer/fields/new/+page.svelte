<script lang="ts">
  import { onMount } from 'svelte';
  import { goto } from '$app/navigation';
  import VoiceGuide from '$lib/components/VoiceGuide.svelte';
  import { areas } from '$lib/data';
  import { language, session } from '$lib/stores/app';
  import { localText } from '$lib/i18n';
  import { createFarmerField } from '$lib/fields';
  import { appPath } from '$lib/nav';

  let step = 1;
  let fieldName = '';
  let crop = '';
  let nextCrop = '';
  let areaHa = 1;
  let areaId = 'paba';
  let latitude = 24.405;
  let longitude = 88.61;
  let gpsState: 'idle' | 'loading' | 'ready' | 'error' = 'idle';
  let error = '';

  onMount(() => {
    if ($session?.areaId) areaId = $session.areaId;
  });

  $: stepVoice = step === 1
    ? ($language === 'bn' ? 'প্রথম ধাপ। জমির নাম এবং এখন কী ফসল আছে তা লিখুন।' : 'Step one. Enter the field name and current crop.')
    : step === 2
      ? ($language === 'bn' ? 'দ্বিতীয় ধাপ। জমির আয়তন এবং এলাকা নির্বাচন করুন।' : 'Step two. Enter the field size and select the area.')
      : ($language === 'bn' ? 'তৃতীয় ধাপ। GPS দিয়ে জমির অবস্থান নিন। তারপর জমি সংরক্ষণ করুন।' : 'Step three. Capture the field location with GPS, then save the field.');

  function next() {
    error = '';
    if (step === 1 && (!fieldName.trim() || !crop.trim())) {
      error = $language === 'bn' ? 'জমির নাম এবং ফসল লিখুন।' : 'Enter the field name and crop.';
      return;
    }
    if (step === 2 && (!areaHa || areaHa <= 0)) {
      error = $language === 'bn' ? 'জমির আয়তন দিন।' : 'Enter the field size.';
      return;
    }
    step = Math.min(3, step + 1);
  }

  function back() {
    error = '';
    step = Math.max(1, step - 1);
  }

  function useGps() {
    if (!navigator.geolocation) {
      gpsState = 'error';
      return;
    }
    gpsState = 'loading';
    navigator.geolocation.getCurrentPosition(
      (position) => {
        latitude = Number(position.coords.latitude.toFixed(6));
        longitude = Number(position.coords.longitude.toFixed(6));
        gpsState = 'ready';
      },
      () => gpsState = 'error',
      { enableHighAccuracy: true, timeout: 12000, maximumAge: 5000 }
    );
  }

  function saveField() {
    error = '';
    if (!$session || $session.role !== 'farmer') {
      goto(appPath('/login'));
      return;
    }
    if (!fieldName.trim() || !crop.trim() || !areaHa || areaHa <= 0 || !Number.isFinite(latitude) || !Number.isFinite(longitude)) {
      error = $language === 'bn' ? 'সব তথ্য আবার দেখুন।' : 'Please check the field information.';
      return;
    }

    createFarmerField({
      farmerId: $session.id,
      areaId,
      name: fieldName.trim(),
      crop: crop.trim(),
      nextCrop: nextCrop.trim(),
      areaHa: Number(areaHa),
      latitude: Number(latitude),
      longitude: Number(longitude)
    });

    goto(appPath('/farmer'));
  }
</script>

<svelte:head><title>{$language === 'bn' ? 'জমি যোগ করুন' : 'Add field'} | AgriFusion BD</title></svelte:head>

<main class="page narrow">
  <a class="back-link" href={appPath('/farmer')}>← {$language === 'bn' ? 'আমার জমি' : 'My farm'}</a>

  <section class="wizard-shell">
    <header class="wizard-head">
      <span class="eyebrow">{$language === 'bn' ? 'সহজ ৩ ধাপ' : '3 simple steps'}</span>
      <h1>{$language === 'bn' ? 'নতুন জমি যোগ করুন' : 'Add a new field'}</h1>
      <VoiceGuide text={stepVoice} />

      <div class="wizard-steps" aria-label="Progress">
        <div class="wizard-step" class:active={step===1} class:done={step>1}><span class="step-icon">🌾</span><strong>{$language === 'bn' ? 'ফসল' : 'Crop'}</strong></div>
        <div class="wizard-step" class:active={step===2} class:done={step>2}><span class="step-icon">📏</span><strong>{$language === 'bn' ? 'আয়তন' : 'Size'}</strong></div>
        <div class="wizard-step" class:active={step===3}><span class="step-icon">📍</span><strong>GPS</strong></div>
      </div>
    </header>

    <div class="wizard-body">
      {#if !$session || $session.role !== 'farmer'}
        <div class="wizard-picture">👨‍🌾</div>
        <h2>{$language === 'bn' ? 'কৃষক অ্যাকাউন্টে লগইন করুন' : 'Sign in as a farmer'}</h2>
        <a class="button primary full" href={appPath('/login')}>{$language === 'bn' ? 'লগইন' : 'Login'}</a>
      {:else if step === 1}
        <div class="wizard-picture">🌾</div>
        <h2>{$language === 'bn' ? 'এই জমিতে কী আছে?' : 'What is growing here?'}</h2>
        <p>{$language === 'bn' ? 'জমিকে চেনার জন্য একটি সহজ নাম দিন।' : 'Give the field a simple name you recognize.'}</p>

        <div class="form-stack">
          <label>
            {$language === 'bn' ? '🏷️ জমির নাম' : '🏷️ Field name'}
            <input bind:value={fieldName} placeholder={$language === 'bn' ? 'যেমন: বাড়ির পাশের জমি' : 'e.g. Field near home'} />
          </label>
          <label>
            {$language === 'bn' ? '🌱 এখন কী ফসল?' : '🌱 Current crop'}
            <input bind:value={crop} placeholder={$language === 'bn' ? 'যেমন: ধান' : 'e.g. Rice'} />
          </label>
          <label>
            {$language === 'bn' ? '🔄 পরের ফসল (না জানলে খালি রাখুন)' : '🔄 Next crop (optional)'}
            <input bind:value={nextCrop} placeholder={$language === 'bn' ? 'যেমন: মুগ' : 'e.g. Mung bean'} />
          </label>
        </div>

      {:else if step === 2}
        <div class="wizard-picture">📏</div>
        <h2>{$language === 'bn' ? 'জমি কত বড়?' : 'How big is the field?'}</h2>
        <p>{$language === 'bn' ? 'আনুমানিক হলেও চলবে। পরে ঠিক করা যাবে।' : 'An estimate is okay for now.'}</p>

        <div class="form-stack">
          <label>
            {$language === 'bn' ? '📐 আয়তন (হেক্টর)' : '📐 Area (hectares)'}
            <input type="number" min="0.01" step="0.01" bind:value={areaHa} />
          </label>
          <label>
            {$language === 'bn' ? '🗺️ কোন এলাকা?' : '🗺️ Which area?'}
            <select bind:value={areaId}>
              {#each areas as area}<option value={area.id}>{localText(area.name,$language)}</option>{/each}
            </select>
          </label>
        </div>

      {:else}
        <div class="wizard-picture">📍</div>
        <h2>{$language === 'bn' ? 'জমির জায়গা ধরুন' : 'Capture the field location'}</h2>
        <p>{$language === 'bn' ? 'জমিতে দাঁড়িয়ে নিচের বড় GPS বোতাম চাপুন।' : 'Stand in the field and press the large GPS button.'}</p>

        <button type="button" class="gps-big-button" on:click={useGps}>
          <span class="gps-icon">{gpsState === 'loading' ? '⌛' : gpsState === 'ready' ? '✅' : '📍'}</span>
          <span>
            {gpsState === 'loading'
              ? ($language === 'bn' ? 'অবস্থান খোঁজা হচ্ছে…' : 'Finding location…')
              : gpsState === 'ready'
                ? ($language === 'bn' ? 'GPS পাওয়া গেছে' : 'GPS captured')
                : ($language === 'bn' ? 'আমার GPS নিন' : 'Use my GPS')}
          </span>
        </button>

        {#if gpsState === 'error'}
          <p class="form-error">{$language === 'bn' ? 'GPS পাওয়া যায়নি। নিচে অবস্থান লিখতে পারেন।' : 'GPS was unavailable. You can enter coordinates below.'}</p>
        {/if}

        <details class="tech-details">
          <summary>{$language === 'bn' ? 'GPS সংখ্যা দেখতে বা বদলাতে' : 'View or edit GPS numbers'}</summary>
          <div class="form-grid-2" style="padding:16px">
            <label>Latitude<input type="number" step="0.000001" bind:value={latitude} /></label>
            <label>Longitude<input type="number" step="0.000001" bind:value={longitude} /></label>
          </div>
        </details>

        <div class="review-list">
          <div class="review-row"><span>🏷️</span><div><small>{$language === 'bn' ? 'জমি' : 'Field'}</small><strong>{fieldName}</strong></div></div>
          <div class="review-row"><span>🌾</span><div><small>{$language === 'bn' ? 'ফসল' : 'Crop'}</small><strong>{crop}</strong></div></div>
          <div class="review-row"><span>📏</span><div><small>{$language === 'bn' ? 'আয়তন' : 'Size'}</small><strong>{areaHa} ha</strong></div></div>
        </div>
      {/if}

      {#if error}<p class="form-error">{error}</p>{/if}

      {#if $session?.role === 'farmer'}
        <div class="wizard-actions">
          {#if step > 1}<button type="button" class="button secondary" on:click={back}>← {$language === 'bn' ? 'পেছনে' : 'Back'}</button>{:else}<span></span>{/if}
          {#if step < 3}
            <button type="button" class="button primary" on:click={next}>{$language === 'bn' ? 'পরের ধাপ' : 'Next'} →</button>
          {:else}
            <button type="button" class="button primary" on:click={saveField}>✅ {$language === 'bn' ? 'জমি সংরক্ষণ' : 'Save field'}</button>
          {/if}
        </div>
      {/if}
    </div>
  </section>
</main>
