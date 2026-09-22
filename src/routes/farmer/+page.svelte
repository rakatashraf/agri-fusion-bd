<script lang="ts">
  import LiveGpsMap from '$lib/components/LiveGpsMap.svelte';
  import { fields, farmers, rotationPlans, alerts } from '$lib/data';
  import { language, session } from '$lib/stores/app';
  import { tr, localText } from '$lib/i18n';
  import { appPath } from '$lib/nav';

  $: farmerId = $session?.role === 'farmer' ? $session.id : 'farmer-001';
  $: farmer = farmers.find((item) => item.id === farmerId) ?? farmers[0];
  $: myFields = fields.filter((field) => farmer.fieldIds.includes(field.id));
  $: primary = myFields[0] ?? fields[0];
</script>

<svelte:head><title>{tr($language,'farmerHome')} | AgriFusion BD</title></svelte:head>

<main class="page">
  <section class="page-title">
    <div><span class="eyebrow">{localText(primary.name,$language)} • {primary.areaHa} ha</span><h1>{tr($language,'farmerHome')}</h1><p>{localText(primary.crop,$language)} • {tr($language,'updated')}: {primary.updated}</p></div>
    <div class="health-pill"><span>{tr($language,'fieldHealth')}</span><strong>{primary.health}/100</strong></div>
  </section>

  <section class="action-card">
    <div class="action-number">1</div>
    <div>
      <span class="eyebrow">{tr($language,'today')}</span>
      <h2>{localText(primary.action,$language)}</h2>
      <p>{tr($language,'why')}: {$language === 'bn' ? 'স্যাটেলাইট NDVI, রোভার মাটির আর্দ্রতা এবং পরবর্তী 48 ঘণ্টার বৃষ্টির পূর্বাভাস একসাথে বিবেচনা করা হয়েছে।' : 'Satellite vegetation signal, rover soil moisture and the next 48-hour rainfall outlook were considered together.'}</p>
    </div>
  </section>

  <section class="metric-grid">
    <article><span>{tr($language,'soilMoisture')}</span><strong>{primary.soilMoisture}%</strong><small>{tr($language,'roverLayer')}</small></article>
    <article><span>NDVI</span><strong>{primary.ndvi}</strong><small>{tr($language,'nasaLayer')}</small></article>
    <article><span>{tr($language,'savings')}</span><strong>৳{primary.savingBdt}</strong><small>{$language === 'bn' ? 'এই সপ্তাহে সম্ভাব্য' : 'Potential this week'}</small></article>
    <article><span>{tr($language,'waterSaved')}</span><strong>{primary.waterSavedL} L</strong><small>{$language === 'bn' ? 'অপ্রয়োজনীয় সেচ এড়ালে' : 'By avoiding unnecessary irrigation'}</small></article>
  </section>

  <section class="content-section">
    <div class="section-heading"><div><span class="eyebrow">GPS + field boundary</span><h2>{tr($language,'map')}</h2></div><a href={appPath('/map')}>{tr($language,'allFields')} →</a></div>
    <LiveGpsMap fields={myFields} height="330px" />
  </section>

  <section class="content-section">
    <div class="section-heading"><div><span class="eyebrow">{tr($language,'currentSeason')}</span><h2>{tr($language,'rotation')}</h2><p>{tr($language,'rotationIntro')}</p></div></div>
    <div class="rotation-list">
      {#each rotationPlans as plan, index}
        <article class:recommended={index === 0}>
          <div class="rotation-rank">{index + 1}</div>
          <div class="rotation-main"><strong>{localText(plan.sequence,$language)}</strong><p>{localText(plan.reason,$language)}</p><div class="tag-row"><span>{tr($language,'waterSaved')} {plan.water}</span><span>{$language === 'bn' ? 'সার' : 'Fertilizer'} {plan.fertilizer}</span></div></div>
          <div class="fit-score"><strong>{plan.fit}</strong><small>{$language === 'bn' ? 'উপযোগিতা' : 'fit score'}</small></div>
        </article>
      {/each}
    </div>
  </section>

  <section class="content-section">
    <div class="section-heading"><div><h2>{tr($language,'alerts')}</h2></div></div>
    <div class="alert-list">{#each alerts as alert}<article class="alert-item {alert.severity}"><span>!</span><div><strong>{localText(alert.title,$language)}</strong><p>{localText(alert.detail,$language)}</p></div></article>{/each}</div>
  </section>
</main>
