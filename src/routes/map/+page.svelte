<script lang="ts">
  import LiveGpsMap from '$lib/components/LiveGpsMap.svelte';
  import { areas, fields, fieldsForArea, farmers } from '$lib/data';
  import { language, session, specialistArea, setSpecialistArea } from '$lib/stores/app';
  import { tr, localText } from '$lib/i18n';

  $: farmer = $session?.role === 'farmer' ? farmers.find((item) => item.id === $session?.id) : null;
  $: visibleFields = farmer
    ? fields.filter((field) => farmer.fieldIds.includes(field.id))
    : $session?.role === 'specialist'
      ? fieldsForArea($specialistArea)
      : fields;
</script>

<svelte:head><title>{tr($language,'map')} | AgriFusion BD</title></svelte:head>

<main class="page">
  <section class="page-title map-title">
    <div><span class="eyebrow">GPS + field boundaries</span><h1>{tr($language,'map')}</h1><p>{$language === 'bn' ? 'আপনার অবস্থান, জমির সীমানা এবং ঝুঁকি একই মানচিত্রে।' : 'Your position, field boundaries and risk in one map.'}</p></div>
    {#if $session?.role === 'specialist'}
      <label class="area-select">{tr($language,'responsibleArea')}
        <select value={$specialistArea} on:change={(e) => setSpecialistArea(e.currentTarget.value)}>
          {#each areas as area}<option value={area.id}>{localText(area.name,$language)}</option>{/each}
        </select>
      </label>
    {/if}
  </section>

  <LiveGpsMap fields={visibleFields} height="min(68vh, 620px)" />

  <section class="content-section">
    <div class="section-heading"><div><h2>{tr($language,'allFields')}</h2></div></div>
    <div class="map-field-list">
      {#each visibleFields as field}
        <article>
          <span class="status-dot {field.risk}"></span>
          <div><strong>{localText(field.name,$language)}</strong><small>{localText(field.crop,$language)} • {field.areaHa} ha</small></div>
          <div class="mini-health">{field.health}</div>
        </article>
      {/each}
    </div>
  </section>
</main>
