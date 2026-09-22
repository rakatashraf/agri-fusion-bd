<script lang="ts">
  import LiveGpsMap from '$lib/components/LiveGpsMap.svelte';
  import { fields, farmers, rotationPlans } from '$lib/data';
  import { language, session } from '$lib/stores/app';
  import { tr, localText } from '$lib/i18n';

  $: farmer = farmers.find((item) => item.id === ($session?.role === 'farmer' ? $session.id : 'farmer-001')) ?? farmers[0];
  $: myFields = fields.filter((field) => farmer.fieldIds.includes(field.id));
  $: primary = myFields[0] ?? fields[0];
</script>

<svelte:head><title>{tr($language,'field')} | AgriFusion BD</title></svelte:head>

<main class="page">
  <section class="page-title">
    <div><span class="eyebrow">{localText(primary.crop,$language)}</span><h1>{localText(primary.name,$language)}</h1><p>{primary.areaHa} ha • {primary.updated}</p></div>
    <div class="health-pill"><span>{tr($language,'health')}</span><strong>{primary.health}/100</strong></div>
  </section>

  <LiveGpsMap fields={myFields} height="340px" />

  <section class="metric-grid">
    <article><span>{tr($language,'soilMoisture')}</span><strong>{primary.soilMoisture}%</strong></article>
    <article><span>NDVI</span><strong>{primary.ndvi}</strong></article>
    <article><span>{tr($language,'risk')}</span><strong>{tr($language,primary.risk)}</strong></article>
    <article><span>{tr($language,'nextCrop')}</span><strong>{localText(primary.nextCrop,$language)}</strong></article>
  </section>

  <section class="decision-box large"><span>{tr($language,'doNow')}</span><strong>{localText(primary.action,$language)}</strong></section>

  <section class="content-section">
    <div class="section-heading"><div><h2>{tr($language,'rotation')}</h2></div></div>
    <div class="rotation-list">{#each rotationPlans as plan}<article><div class="rotation-main"><strong>{localText(plan.sequence,$language)}</strong><p>{localText(plan.reason,$language)}</p></div><div class="fit-score"><strong>{plan.fit}</strong><small>fit</small></div></article>{/each}</div>
  </section>
</main>
