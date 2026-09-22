<script lang="ts">
  import { onMount } from 'svelte';
  import LiveGpsMap from '$lib/components/LiveGpsMap.svelte';
  import { fields, rotationPlans, alerts } from '$lib/data';
  import { language, session } from '$lib/stores/app';
  import { tr, localText } from '$lib/i18n';
  import { appPath } from '$lib/nav';
  import { userFields, loadUserFields, removeFarmerField } from '$lib/fields';

  let selectedFieldId = '';

  onMount(loadUserFields);

  $: farmerId = $session?.role === 'farmer' ? $session.id : 'farmer-001';
  $: staticOwnedFields = fields.filter((field) => field.farmerId === farmerId);
  $: storedOwnedFields = $userFields.filter((field) => field.farmerId === farmerId);
  $: myFields = [...staticOwnedFields, ...storedOwnedFields];
  $: primary = myFields.find((field) => field.id === selectedFieldId) ?? myFields[0];

  $: if (primary && selectedFieldId !== primary.id) {
    selectedFieldId = primary.id;
  }

  function removeField(fieldId: string) {
    if (!$session || $session.role !== 'farmer') return;
    removeFarmerField(fieldId, $session.id);
    if (selectedFieldId === fieldId) selectedFieldId = '';
  }
</script>

<svelte:head><title>{tr($language,'farmerHome')} | AgriFusion BD</title></svelte:head>

<main class="page">
  <section class="page-title farmer-title">
    <div>
      <span class="eyebrow">{tr($language,'farmer')}</span>
      <h1>{tr($language,'farmerHome')}</h1>
      <p>{$language === 'bn'
        ? 'প্রতিটি জমি আলাদা crop field হিসেবে রাখুন এবং আলাদা বিশ্লেষণ দেখুন।'
        : 'Keep each land parcel as a separate crop field and track its insights independently.'}</p>
    </div>
    <a class="button primary" href={appPath('/farmer/fields/new')}>
      {$language === 'bn' ? '+ নতুন জমি যোগ করুন' : '+ Add crop field'}
    </a>
  </section>

  {#if myFields.length === 0}
    <section class="empty-state field-empty">
      <div class="empty-icon">🌱</div>
      <h2>{$language === 'bn' ? 'এখনও কোনো জমি যোগ করা হয়নি' : 'No crop fields added yet'}</h2>
      <p>{$language === 'bn'
        ? 'প্রথম জমিটি যোগ করুন। এরপর প্রতিটি জমির জন্য আলাদা GPS, ফসল, স্যাটেলাইট এবং রোভার তথ্য রাখা যাবে।'
        : 'Add your first field. Each field can then keep its own GPS, crop, satellite and rover observations.'}</p>
      <a class="button primary" href={appPath('/farmer/fields/new')}>
        {$language === 'bn' ? '+ প্রথম জমি যোগ করুন' : '+ Add first field'}
      </a>
    </section>
  {:else}
    <section class="content-section field-switch-section">
      <div class="section-heading">
        <div>
          <span class="eyebrow">{$language === 'bn' ? 'আমার জমিসমূহ' : 'My crop fields'}</span>
          <h2>{myFields.length} {$language === 'bn' ? 'টি জমি' : myFields.length === 1 ? 'field' : 'fields'}</h2>
        </div>
        <a href={appPath('/map')}>{tr($language,'map')} →</a>
      </div>

      <div class="field-card-grid">
        {#each myFields as field, index}
          <button
            type="button"
            class="field-select-card"
            class:active={primary?.id === field.id}
            on:click={() => selectedFieldId = field.id}
          >
            <div class="field-card-top">
              <span class="field-index">{index + 1}</span>
              <span class="risk-badge {field.risk}">{tr($language,field.risk)}</span>
            </div>
            <strong>{localText(field.name,$language)}</strong>
            <span>{localText(field.crop,$language)} • {field.areaHa} ha</span>
            <div class="field-card-health">
              <span>{tr($language,'fieldHealth')}</span>
              <b>{field.health || '—'}</b>
            </div>
          </button>
        {/each}

        <a class="field-add-card" href={appPath('/farmer/fields/new')}>
          <span>＋</span>
          <strong>{$language === 'bn' ? 'আরও জমি যোগ করুন' : 'Add another field'}</strong>
        </a>
      </div>
    </section>

    {#if primary}
      <section class="selected-field-header">
        <div>
          <span class="eyebrow">{$language === 'bn' ? 'নির্বাচিত জমি' : 'Selected field'}</span>
          <h2>{localText(primary.name,$language)}</h2>
          <p>{localText(primary.crop,$language)} • {primary.areaHa} ha • {tr($language,'updated')}: {primary.updated}</p>
        </div>
        <div class="health-pill">
          <span>{tr($language,'fieldHealth')}</span>
          <strong>{primary.health ? primary.health + '/100' : '—'}</strong>
        </div>
      </section>

      <section class="action-card">
        <div class="action-number">1</div>
        <div>
          <span class="eyebrow">{tr($language,'today')}</span>
          <h2>{localText(primary.action,$language)}</h2>
          <p>{tr($language,'why')}: {primary.source === 'farmer'
            ? ($language === 'bn'
              ? 'জমিটি নতুন যোগ হয়েছে। ডেটা সোর্স সংযুক্ত হলে এই অংশটি স্বয়ংক্রিয়ভাবে জমিভিত্তিক পরামর্শ দেখাবে।'
              : 'This field was newly registered. Once data sources are connected, this section will show field-specific advice automatically.')
            : ($language === 'bn'
              ? 'স্যাটেলাইট NDVI, রোভার মাটির আর্দ্রতা এবং পরবর্তী 48 ঘণ্টার বৃষ্টির পূর্বাভাস একসাথে বিবেচনা করা হয়েছে।'
              : 'Satellite vegetation signal, rover soil moisture and the next 48-hour rainfall outlook were considered together.')}</p>
        </div>
      </section>

      <section class="metric-grid">
        <article><span>{tr($language,'soilMoisture')}</span><strong>{primary.soilMoisture ? primary.soilMoisture + '%' : '—'}</strong><small>{tr($language,'roverLayer')}</small></article>
        <article><span>NDVI</span><strong>{primary.ndvi || '—'}</strong><small>{tr($language,'nasaLayer')}</small></article>
        <article><span>{tr($language,'savings')}</span><strong>{primary.savingBdt ? '৳' + primary.savingBdt : '—'}</strong><small>{$language === 'bn' ? 'এই সপ্তাহে সম্ভাব্য' : 'Potential this week'}</small></article>
        <article><span>{tr($language,'waterSaved')}</span><strong>{primary.waterSavedL ? primary.waterSavedL + ' L' : '—'}</strong><small>{$language === 'bn' ? 'অপ্রয়োজনীয় সেচ এড়ালে' : 'By avoiding unnecessary irrigation'}</small></article>
      </section>

      <section class="content-section">
        <div class="section-heading">
          <div><span class="eyebrow">GPS + field boundary</span><h2>{localText(primary.name,$language)}</h2></div>
          <a href={appPath('/map')}>{tr($language,'allFields')} →</a>
        </div>
        <LiveGpsMap fields={[primary]} height="330px" />
      </section>

      {#if primary.source === 'farmer'}
        <div class="field-owner-tools">
          <div>
            <strong>{$language === 'bn' ? 'এই জমিটি আপনার যোগ করা' : 'You added this field'}</strong>
            <small>{$language === 'bn'
              ? 'প্রয়োজনে এটি মুছে আবার সঠিক তথ্য দিয়ে যোগ করতে পারেন।'
              : 'You can remove it and add it again if its details need correction.'}</small>
          </div>
          <button class="button danger small" on:click={() => removeField(primary.id)}>
            {$language === 'bn' ? 'জমি মুছুন' : 'Remove field'}
          </button>
        </div>
      {/if}

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
    {/if}
  {/if}
</main>
