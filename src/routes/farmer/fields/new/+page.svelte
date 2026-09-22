<script lang="ts">
  import { onMount } from 'svelte';
  import { goto } from '$app/navigation';
  import { areas } from '$lib/data';
  import { language, session } from '$lib/stores/app';
  import { tr, localText } from '$lib/i18n';
  import { createFarmerField } from '$lib/fields';
  import { appPath } from '$lib/nav';

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
      error = $language === 'bn' ? 'জমির নাম, ফসল, আয়তন এবং অবস্থান সঠিকভাবে দিন।' : 'Please provide a valid field name, crop, area and location.';
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

<svelte:head><title>{$language === 'bn' ? 'নতুন জমি যোগ করুন' : 'Add crop field'} | AgriFusion BD</title></svelte:head>

<main class="page narrow">
  <a class="back-link" href={appPath('/farmer')}>← {tr($language,'back')}</a>

  <section class="auth-card add-field-card">
    <span class="eyebrow">{$language === 'bn' ? 'আমার জমি' : 'My fields'}</span>
    <h1>{$language === 'bn' ? 'নতুন ফসলের জমি যোগ করুন' : 'Add a crop field'}</h1>
    <p>{$language === 'bn'
      ? 'প্রতিটি জমি আলাদাভাবে যোগ করুন। পরে প্রতিটি জমির জন্য আলাদা স্যাটেলাইট, রোভার, আবহাওয়া ও পরামর্শ দেখা যাবে।'
      : 'Register each field separately so satellite, rover, weather and recommendations can be tracked per field.'}</p>

    {#if !$session || $session.role !== 'farmer'}
      <div class="form-error">{$language === 'bn' ? 'জমি যোগ করতে কৃষক অ্যাকাউন্টে লগইন করুন।' : 'Sign in with a farmer account to add fields.'}</div>
      <a class="button primary full" href={appPath('/login')}>{tr($language,'login')}</a>
    {:else}
      <form class="form-stack" on:submit|preventDefault={saveField}>
        <label>
          {$language === 'bn' ? 'জমির নাম' : 'Field name'}
          <input bind:value={fieldName} placeholder={$language === 'bn' ? 'যেমন: উত্তর মাঠ' : 'e.g. North Field'} />
        </label>

        <div class="form-grid-2">
          <label>
            {$language === 'bn' ? 'বর্তমান ফসল' : 'Current crop'}
            <input bind:value={crop} placeholder={$language === 'bn' ? 'যেমন: আমন ধান' : 'e.g. Aman rice'} />
          </label>
          <label>
            {$language === 'bn' ? 'পরবর্তী ফসল (ঐচ্ছিক)' : 'Next crop (optional)'}
            <input bind:value={nextCrop} placeholder={$language === 'bn' ? 'যেমন: মুগ' : 'e.g. Mung bean'} />
          </label>
        </div>

        <div class="form-grid-2">
          <label>
            {$language === 'bn' ? 'জমির আয়তন (হেক্টর)' : 'Field area (hectares)'}
            <input type="number" min="0.01" step="0.01" bind:value={areaHa} />
          </label>
          <label>
            {tr($language,'area')}
            <select bind:value={areaId}>
              {#each areas as area}<option value={area.id}>{localText(area.name,$language)}</option>{/each}
            </select>
          </label>
        </div>

        <div class="field-location-box">
          <div class="field-location-head">
            <div>
              <strong>{$language === 'bn' ? 'জমির অবস্থান' : 'Field location'}</strong>
              <small>{$language === 'bn' ? 'GPS ব্যবহার করুন অথবা latitude/longitude লিখুন।' : 'Use live GPS or enter latitude/longitude.'}</small>
            </div>
            <button type="button" class="button secondary small" on:click={useGps}>
              {gpsState === 'loading'
                ? ($language === 'bn' ? 'GPS খোঁজা হচ্ছে…' : 'Finding GPS…')
                : ($language === 'bn' ? 'আমার GPS ব্যবহার করুন' : 'Use my GPS')}
            </button>
          </div>

          <div class="form-grid-2">
            <label>Latitude<input type="number" step="0.000001" bind:value={latitude} /></label>
            <label>Longitude<input type="number" step="0.000001" bind:value={longitude} /></label>
          </div>

          {#if gpsState === 'ready'}<small class="success-text">{$language === 'bn' ? 'লাইভ GPS অবস্থান নেয়া হয়েছে।' : 'Live GPS location captured.'}</small>{/if}
          {#if gpsState === 'error'}<small class="form-error">{$language === 'bn' ? 'GPS পাওয়া যায়নি। অবস্থান ম্যানুয়ালি দিন।' : 'GPS unavailable. Enter the location manually.'}</small>{/if}
        </div>

        <div class="field-note">
          {$language === 'bn'
            ? 'এই ডেমোতে জমির আয়তন ও কেন্দ্রের GPS থেকে একটি আনুমানিক বর্গাকার সীমানা তৈরি হবে। পরে সরাসরি ম্যাপে হাঁটিয়ে/পয়েন্ট দিয়ে সঠিক polygon boundary নেয়া যাবে।'
            : 'For this demo, an approximate square boundary is created from the field area and GPS center. Precise polygon drawing/walk-the-boundary capture can be added next.'}
        </div>

        {#if error}<p class="form-error">{error}</p>{/if}
        <button class="button primary full" type="submit">{$language === 'bn' ? '+ জমি সংরক্ষণ করুন' : '+ Save field'}</button>
      </form>
    {/if}
  </section>
</main>
