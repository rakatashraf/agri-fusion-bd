<script lang="ts">
  import { page } from '$app/stores';
  import LiveGpsMap from '$lib/components/LiveGpsMap.svelte';
  import { farmers, fields, areas, rotationPlans } from '$lib/data';
  import { language } from '$lib/stores/app';
  import { tr, localText } from '$lib/i18n';

  $: farmer = farmers.find((item) => item.id === $page.params.id);
  $: farmerFields = farmer ? fields.filter((field) => farmer.fieldIds.includes(field.id)) : [];
  $: area = farmer ? areas.find((item) => item.id === farmer.areaId) : null;
  $: avgHealth = farmerFields.length ? Math.round(farmerFields.reduce((sum, field) => sum + field.health, 0) / farmerFields.length) : 0;
</script>

<svelte:head><title>{farmer ? localText(farmer.name,$language) : tr($language,'individualReports')} | AgriFusion BD</title></svelte:head>

<main class="page">
  <a class="back-link" href="/specialist">← {tr($language,'back')}</a>
  {#if farmer}
    <section class="page-title">
      <div>
        <span class="eyebrow">{tr($language,'individualReports')}</span>
        <h1>{localText(farmer.name,$language)}</h1>
        <p>{farmer.phone} • {area ? localText(area.name,$language) : ''}</p>
      </div>
      <div class="health-pill"><span>{tr($language,'avgHealth')}</span><strong>{avgHealth}/100</strong></div>
    </section>

    <section class="content-section">
      <LiveGpsMap fields={farmerFields} height="360px" />
    </section>

    <section class="field-report-list">
      {#each farmerFields as field}
        <article class="field-report-card">
          <div class="field-report-head">
            <div><span class="eyebrow">{localText(field.crop,$language)}</span><h2>{localText(field.name,$language)}</h2><p>{field.areaHa} ha • {tr($language,'updated')}: {field.updated}</p></div>
            <span class="risk-badge {field.risk}">{tr($language,field.risk)}</span>
          </div>

          <div class="metric-grid compact">
            <div><span>{tr($language,'fieldHealth')}</span><strong>{field.health}/100</strong></div>
            <div><span>{tr($language,'soilMoisture')}</span><strong>{field.soilMoisture}%</strong></div>
            <div><span>NDVI</span><strong>{field.ndvi}</strong></div>
            <div><span>{tr($language,'nextCrop')}</span><strong>{localText(field.nextCrop,$language)}</strong></div>
          </div>

          <div class="decision-box">
            <span>{tr($language,'doNow')}</span>
            <strong>{localText(field.action,$language)}</strong>
          </div>
        </article>
      {/each}
    </section>

    <section class="content-section">
      <div class="section-heading"><div><h2>{tr($language,'rotation')}</h2><p>{tr($language,'rotationIntro')}</p></div></div>
      <div class="rotation-list">
        {#each rotationPlans.slice(0,2) as plan}
          <article><div class="rotation-main"><strong>{localText(plan.sequence,$language)}</strong><p>{localText(plan.reason,$language)}</p></div><div class="fit-score"><strong>{plan.fit}</strong><small>fit</small></div></article>
        {/each}
      </div>
    </section>
  {:else}
    <section class="empty-state"><h1>{$language === 'bn' ? 'কৃষক পাওয়া যায়নি' : 'Farmer not found'}</h1><a class="button primary" href="/specialist">{tr($language,'back')}</a></section>
  {/if}
</main>
