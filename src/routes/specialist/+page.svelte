<script lang="ts">
  import { onMount } from 'svelte';
  import LiveGpsMap from '$lib/components/LiveGpsMap.svelte';
  import { areas, fieldsForArea, farmersForArea, fields } from '$lib/data';
  import { language, specialistArea, setSpecialistArea } from '$lib/stores/app';
  import { tr, localText } from '$lib/i18n';
  import { appPath } from '$lib/nav';
  import { userFields, loadUserFields } from '$lib/fields';
  import { cropPhoto, farmPhotos } from '$lib/images';

  onMount(loadUserFields);

  $: scopedFields = [
    ...fieldsForArea($specialistArea),
    ...$userFields.filter((field) => field.areaId === $specialistArea)
  ];
  $: scopedFarmers = farmersForArea($specialistArea);
  $: summary = {
    fields: scopedFields.length,
    hectares: Number(scopedFields.reduce((sum, field) => sum + field.areaHa, 0).toFixed(1)),
    avgHealth: scopedFields.length
      ? Math.round(scopedFields.reduce((sum, field) => sum + field.health, 0) / scopedFields.length)
      : 0,
    highRisk: scopedFields.filter((field) => field.risk === 'high').length,
    savings: scopedFields.reduce((sum, field) => sum + field.savingBdt, 0),
    waterSaved: scopedFields.reduce((sum, field) => sum + field.waterSavedL, 0)
  };
  $: selectedArea = areas.find((area) => area.id === $specialistArea);
</script>

<svelte:head><title>{tr($language,'specialistHome')} | AgriFusion BD</title></svelte:head>

<main class="page">
  <section class="page-title specialist-title photo-page-title">
    <img src={farmPhotos.specialist} alt="" loading="lazy" />
    <div><span class="eyebrow">{tr($language,'specialist')}</span><h1>{tr($language,'specialistHome')}</h1><p>{selectedArea ? localText(selectedArea.name,$language) : ''}</p></div>
    <label class="area-select">{tr($language,'responsibleArea')}
      <select value={$specialistArea} on:change={(e) => setSpecialistArea(e.currentTarget.value)}>
        {#each areas as area}<option value={area.id}>{localText(area.name,$language)}</option>{/each}
      </select>
    </label>
  </section>

  <section class="metric-grid specialist-metrics">
    <article><img class="metric-card-photo" src={farmPhotos.farmer} alt="" loading="lazy" /><span>{tr($language,'farmers')}</span><strong>{scopedFarmers.length}</strong><small>{summary.fields} {tr($language,'field')}</small></article>
    <article><img class="metric-card-photo" src={farmPhotos.aerial} alt="" loading="lazy" /><span>{tr($language,'totalLand')}</span><strong>{summary.hectares} ha</strong><small>{tr($language,'responsibleArea')}</small></article>
    <article><img class="metric-card-photo" src={farmPhotos.greenField} alt="" loading="lazy" /><span>{tr($language,'avgHealth')}</span><strong>{summary.avgHealth}/100</strong><small>{tr($language,'nasaLayer')} + {tr($language,'roverLayer')}</small></article>
    <article><img class="metric-card-photo" src={farmPhotos.storm} alt="" loading="lazy" /><span>{tr($language,'attention')}</span><strong>{summary.highRisk}</strong><small>{tr($language,'high')} {tr($language,'risk')}</small></article>
  </section>

  <section class="content-section">
    <div class="section-heading"><div><span class="eyebrow">{tr($language,'areaSummary')}</span><h2>{tr($language,'map')}</h2></div><div class="map-summary"><span>৳{summary.savings}</span><small>{tr($language,'savings')}</small></div></div>
    <LiveGpsMap fields={scopedFields} height="420px" />
  </section>

  <section class="content-section">
    <div class="section-heading"><div><h2>{tr($language,'individualReports')}</h2><p>{$language === 'bn' ? 'প্রতিটি নিবন্ধিত কৃষকের জমির অবস্থা, ঝুঁকি এবং করণীয় দেখুন।' : 'Open each registered farmer’s field condition, risk and next actions.'}</p></div></div>
    <div class="farmer-list">
      {#each scopedFarmers as farmer}
        {@const farmerFields = fields.filter((field) => farmer.fieldIds.includes(field.id))}
        {@const avg = farmerFields.length ? Math.round(farmerFields.reduce((sum, field) => sum + field.health, 0) / farmerFields.length) : 0}
        {@const firstField = farmerFields[0]}
        <a class="farmer-row" href={appPath("/specialist/farmer/" + farmer.id)}>
          <img class="farmer-thumb" src={firstField ? cropPhoto(localText(firstField.crop,'en')) : farmPhotos.farmer} alt="" loading="lazy" />
          <div class="farmer-main"><strong>{localText(farmer.name,$language)}</strong><span>{farmerFields.length} {tr($language,'field')} • {farmer.phone}</span></div>
          <div class="farmer-health"><strong>{avg}</strong><span>{tr($language,'health')}</span></div>
          <span class="row-arrow">→</span>
        </a>
      {/each}
    </div>
  </section>

  <section class="content-section">
    <div class="section-heading"><div><h2>{tr($language,'areaSummary')}</h2></div></div>
    <div class="summary-panel">
      <div><img class="summary-card-photo" src={farmPhotos.irrigation} alt="" loading="lazy" /><strong>{summary.waterSaved.toLocaleString()} L</strong><span>{$language === 'bn' ? 'সম্ভাব্য সাপ্তাহিক পানি সাশ্রয়' : 'Potential weekly water savings'}</span></div>
      <div><img class="summary-card-photo" src={farmPhotos.specialist} alt="" loading="lazy" /><strong>৳{summary.savings.toLocaleString()}</strong><span>{$language === 'bn' ? 'সম্ভাব্য ইনপুট খরচ সাশ্রয়' : 'Potential input-cost savings'}</span></div>
      <div><img class="summary-card-photo" src={farmPhotos.watering} alt="" loading="lazy" /><strong>{scopedFields.filter(f => f.soilMoisture < 45).length}</strong><span>{$language === 'bn' ? 'কম আর্দ্রতার জমি' : 'Fields with low soil moisture'}</span></div>
    </div>
  </section>
</main>
