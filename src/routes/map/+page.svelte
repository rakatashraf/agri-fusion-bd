<script lang="ts">
  import { onMount } from 'svelte';
  import LiveGpsMap from '$lib/components/LiveGpsMap.svelte';
  import { areas, fields, fieldsForArea } from '$lib/data';
  import { language, session, specialistArea, setSpecialistArea } from '$lib/stores/app';
  import { tr, localText } from '$lib/i18n';
  import { userFields, loadUserFields } from '$lib/fields';
  import { cropPhoto } from '$lib/images';

  onMount(loadUserFields);

  $: visibleFields = $session?.role === 'farmer'
    ? [...fields.filter((field) => field.farmerId === $session.id), ...$userFields.filter((field) => field.farmerId === $session.id)]
    : $session?.role === 'specialist'
      ? [...fieldsForArea($specialistArea), ...$userFields.filter((field) => field.areaId === $specialistArea)]
      : [...fields, ...$userFields];
</script>

<svelte:head><title>{tr($language,'map')} | AgriFusion BD</title></svelte:head>

<main class="page">
  <section class="page-title map-title">
    <div>
      <span class="eyebrow">NASA GIBS • GPS • POLYGON FIELDS</span>
      <h1>{tr($language,'map')}</h1>
      <p>{$language === 'bn'
        ? 'NASA Earth Observation স্যাটেলাইট ইমেজারি, আপনার GPS অবস্থান এবং জমির আসল polygon সীমানা একই ইন্টার‍্যাক্টিভ ম্যাপে।'
        : 'NASA Earth Observation imagery, your live GPS position and real field polygons in one interactive map.'}</p>
    </div>
    {#if $session?.role === 'specialist'}
      <label class="area-select">{tr($language,'responsibleArea')}
        <select value={$specialistArea} on:change={(e) => setSpecialistArea(e.currentTarget.value)}>
          {#each areas as area}<option value={area.id}>{localText(area.name,$language)}</option>{/each}
        </select>
      </label>
    {/if}
  </section>

  <LiveGpsMap fields={visibleFields} height="clamp(420px, 56svh, 620px)" />

  <section class="content-section">
    <div class="section-heading">
      <div>
        <h2>{tr($language,'allFields')}</h2>
        <p>{visibleFields.length} {$language === 'bn' ? 'টি নিবন্ধিত জমি • রঙ দিয়ে ঝুঁকি দেখানো হয়েছে' : 'registered fields • risk is color-coded'}</p>
      </div>
    </div>

    <div class="map-field-list">
      {#each visibleFields as field}
        <article class="map-field-photo-card">
          <img class="map-field-photo" src={cropPhoto(localText(field.crop,'en'))} alt="" loading="lazy" />
          <span class="status-dot {field.risk}"></span>
          <div><strong>{localText(field.name,$language)}</strong><small>{localText(field.crop,$language)} • {field.areaHa} ha</small></div>
          <div class="mini-health">{field.health || '—'}</div>
        </article>
      {/each}
    </div>
  </section>
</main>
