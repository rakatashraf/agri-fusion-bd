<script lang="ts">
  import { onMount } from 'svelte';
  import { goto } from '$app/navigation';
  import VoiceGuide from '$lib/components/VoiceGuide.svelte';
  import FieldBoundaryMap from '$lib/components/FieldBoundaryMap.svelte';
  import { areas } from '$lib/data';
  import { language, session } from '$lib/stores/app';
  import { localText } from '$lib/i18n';
  import { createFarmerField } from '$lib/fields';
  import { cropPhoto, farmPhotos } from '$lib/images';
  import { appPath } from '$lib/nav';

  let step = 1;
  let fieldName = '';
  let crop = '';
  let nextCrop = '';
  let areaHa = 1;
  let areaId = 'paba';
  let boundary: [number, number][] = [];
  let mapCenter: [number, number] = [24.405, 88.61];
  let error = '';

  onMount(() => {
    if ($session?.areaId) areaId = $session.areaId;
    const selected = areas.find((area) => area.id === areaId);
    if (selected) mapCenter = selected.center as [number, number];
  });

  $: selectedArea = areas.find((area) => area.id === areaId);
  $: if (selectedArea && step < 3 && boundary.length === 0) {
    mapCenter = selectedArea.center as [number, number];
  }

  $: stepVoice = step === 1
    ? ($language === 'bn' ? 'প্রথম ধাপ। জমির নাম এবং এখন কী ফসল আছে তা লিখুন।' : 'Step one. Enter the field name and current crop.')
    : step === 2
      ? ($language === 'bn' ? 'দ্বিতীয় ধাপ। জমির আনুমানিক আয়তন এবং এলাকা নির্বাচন করুন।' : 'Step two. Enter the approximate field size and select the area.')
      : ($language === 'bn'
        ? 'তৃতীয় ধাপ। ম্যাপে জমির চারপাশের প্রতিটি কোণা বা বাঁকে চাপুন। অন্তত তিনটি পয়েন্ট দিন।'
        : 'Step three. Tap every corner or bend around the field on the map. Add at least three points.');

  function next() {
    error = '';
    if (step === 1 && (!fieldName.trim() || !crop.trim())) {
      error = $language === 'bn' ? 'জমির নাম এবং ফসল লিখুন।' : 'Enter the field name and crop.';
      return;
    }
    if (step === 2 && (!areaHa || areaHa <= 0)) {
      error = $language === 'bn' ? 'জমির আনুমানিক আয়তন দিন।' : 'Enter the approximate field size.';
      return;
    }
    step = Math.min(3, step + 1);
  }

  function back() {
    error = '';
    step = Math.max(1, step - 1);
  }

  function handleBoundaryChange(event: CustomEvent) {
    boundary = event.detail.boundary;
    if (event.detail.areaHa > 0) areaHa = Number(event.detail.areaHa.toFixed(2));
    mapCenter = event.detail.center;
  }

  function handleCenter(event: CustomEvent) {
    mapCenter = event.detail.center;
  }

  function saveField() {
    error = '';

    if (!$session || $session.role !== 'farmer') {
      goto(appPath('/login'));
      return;
    }

    if (!fieldName.trim() || !crop.trim()) {
      error = $language === 'bn' ? 'জমির নাম এবং ফসল দিন।' : 'Provide the field name and crop.';
      return;
    }

    if (boundary.length < 3) {
      error = $language === 'bn'
        ? 'জমির সীমানা তৈরি করতে ম্যাপে অন্তত ৩টি পয়েন্ট দিন।'
        : 'Add at least 3 boundary points on the map before saving.';
      return;
    }

    createFarmerField({
      farmerId: $session.id,
      areaId,
      name: fieldName.trim(),
      crop: crop.trim(),
      nextCrop: nextCrop.trim(),
      areaHa: Number(areaHa),
      boundary
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
        <div class="wizard-step" class:active={step===3}><span class="step-icon">🗺️</span><strong>{$language === 'bn' ? 'সীমানা' : 'Boundary'}</strong></div>
      </div>
    </header>

    <div class="wizard-body">
      {#if !$session || $session.role !== 'farmer'}
        <img class="wizard-step-photo" src={farmPhotos.farmer} alt="" />
        <h2>{$language === 'bn' ? 'কৃষক অ্যাকাউন্টে লগইন করুন' : 'Sign in as a farmer'}</h2>
        <a class="button primary full" href={appPath('/login')}>{$language === 'bn' ? 'লগইন' : 'Login'}</a>

      {:else if step === 1}
        <img class="wizard-step-photo" src={crop ? cropPhoto(crop) : farmPhotos.rice} alt="" loading="lazy" />
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
        <img class="wizard-step-photo" src={farmPhotos.aerial} alt="" loading="lazy" />
        <h2>{$language === 'bn' ? 'জমি কত বড়?' : 'How big is the field?'}</h2>
        <p>{$language === 'bn'
          ? 'আনুমানিক আয়তন দিন। পরের ধাপে ম্যাপে সীমানা আঁকলে সিস্টেম নিজে আয়তন হিসাব করবে।'
          : 'Give an approximate size. The next step will calculate the area from the boundary you draw.'}</p>

        <div class="form-stack">
          <label>
            {$language === 'bn' ? '📐 আনুমানিক আয়তন (হেক্টর)' : '📐 Approximate area (hectares)'}
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
        <img class="wizard-step-photo boundary-photo" src={farmPhotos.aerial} alt="" loading="lazy" />
        <h2>{$language === 'bn' ? 'জমির আসল সীমানা দেখান' : 'Mark the real field boundary'}</h2>
        <p>{$language === 'bn'
          ? 'ম্যাপের ওপর জমির চারপাশের প্রতিটি কোণা বা বাঁকে চাপুন। স্কয়ার বক্স ব্যবহার করা হবে না।'
          : 'Tap every corner or bend around the actual field. No fixed square box is used.'}</p>

        <FieldBoundaryMap
          language={$language}
          initialCenter={mapCenter}
          boundary={boundary}
          on:change={handleBoundaryChange}
          on:center={handleCenter}
        />

        <div class="review-list">
          <div class="review-row"><span>🏷️</span><div><small>{$language === 'bn' ? 'জমি' : 'Field'}</small><strong>{fieldName}</strong></div></div>
          <div class="review-row"><span>🌾</span><div><small>{$language === 'bn' ? 'ফসল' : 'Crop'}</small><strong>{crop}</strong></div></div>
          <div class="review-row"><span>📐</span><div><small>{$language === 'bn' ? 'ম্যাপ থেকে আয়তন' : 'Mapped area'}</small><strong>{areaHa} ha</strong></div></div>
          <div class="review-row"><span>📍</span><div><small>{$language === 'bn' ? 'সীমানা পয়েন্ট' : 'Boundary points'}</small><strong>{boundary.length}</strong></div></div>
        </div>
      {/if}

      {#if error}<p class="form-error">⚠️ {error}</p>{/if}

      {#if $session?.role === 'farmer'}
        <div class="wizard-actions">
          {#if step > 1}<button type="button" class="button secondary" on:click={back}>← {$language === 'bn' ? 'পেছনে' : 'Back'}</button>{:else}<span></span>{/if}
          {#if step < 3}
            <button type="button" class="button primary" on:click={next}>{$language === 'bn' ? 'পরের ধাপ' : 'Next'} →</button>
          {:else}
            <button type="button" class="button primary" on:click={saveField} disabled={boundary.length < 3}>
              ✅ {$language === 'bn' ? 'এই সীমানা দিয়ে সংরক্ষণ' : 'Save this boundary'}
            </button>
          {/if}
        </div>
      {/if}
    </div>
  </section>
</main>
