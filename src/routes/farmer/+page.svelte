<script lang="ts">
  import { onMount } from 'svelte';
  import LiveGpsMap from '$lib/components/LiveGpsMap.svelte';
  import VoiceGuide from '$lib/components/VoiceGuide.svelte';
  import SimpleStatus from '$lib/components/SimpleStatus.svelte';
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
  $: primary = selectedFieldId
    ? (myFields.find((field) => field.id === selectedFieldId) ?? myFields[0])
    : myFields[0];

  function irrigationAdvice(field: any, lang: 'bn' | 'en') {
    if (!field || !field.soilMoisture) {
      return lang === 'bn'
        ? { title:'আগে মাটি দেখুন', text:'মাটির তথ্য এখনো পাওয়া যায়নি। সেচের আগে মাটি পরীক্ষা করুন।', tone:'info' as const }
        : { title:'Check soil first', text:'Soil data is not available yet. Check the field before irrigating.', tone:'info' as const };
    }
    if (field.soilMoisture >= 55) {
      return lang === 'bn'
        ? { title:'আজ সেচ দেবেন না', text:'মাটিতে এখন যথেষ্ট পানি আছে।', tone:'good' as const }
        : { title:'No irrigation today', text:'The soil currently has enough moisture.', tone:'good' as const };
    }
    return lang === 'bn'
      ? { title:'অল্প করে সেচ দিন', text:'মাটির আর্দ্রতা কম। আবহাওয়া দেখে সেচ দিন।', tone:'warn' as const }
      : { title:'Irrigate carefully', text:'Soil moisture is low. Check the weather before watering.', tone:'warn' as const };
  }

  function pestAdvice(field: any, lang: 'bn' | 'en') {
    if (!field || field.source === 'farmer') {
      return lang === 'bn'
        ? { title:'পাতা দেখে নিন', text:'নতুন জমি। পাতা ও গাছের গোড়া দেখে সমস্যা আছে কি না দেখুন।', tone:'info' as const }
        : { title:'Check the leaves', text:'New field. Inspect leaves and plant bases for visible problems.', tone:'info' as const };
    }
    if (field.risk === 'high') {
      return lang === 'bn'
        ? { title:'আজই সমস্যা দেখুন', text:'ঝুঁকি বেশি। আক্রান্ত জায়গা আগে পরীক্ষা করুন।', tone:'danger' as const }
        : { title:'Inspect today', text:'Risk is high. Check the affected zone first.', tone:'danger' as const };
    }
    return lang === 'bn'
      ? { title:'একবার দেখে আসুন', text:'স্প্রে করার আগে পাতায় দাগ বা পোকা আছে কি না দেখুন।', tone:'warn' as const }
      : { title:'Scout before spraying', text:'Check for spots or insects before using pesticide.', tone:'warn' as const };
  }

  $: irrigation = irrigationAdvice(primary, $language);
  $: pest = pestAdvice(primary, $language);
  $: weatherText = $language === 'bn'
    ? 'আগামী ৪৮ ঘণ্টায় ভারী বৃষ্টি হতে পারে। নিচু জমির পানি বের হওয়ার পথ পরিষ্কার রাখুন।'
    : 'Heavy rain may occur within 48 hours. Keep drainage paths clear in low fields.';
  $: fullVoiceText = primary
    ? ($language === 'bn'
      ? `${localText(primary.name,$language)}। আজকের পরামর্শ। ${localText(primary.action,$language)}। ${irrigation.title}। ${pest.title}। ${weatherText}`
      : `${localText(primary.name,$language)}. Today’s advice. ${localText(primary.action,$language)}. ${irrigation.title}. ${pest.title}. ${weatherText}`)
    : '';

  function removeField(fieldId: string) {
    if (!$session || $session.role !== 'farmer') return;
    removeFarmerField(fieldId, $session.id);
    if (selectedFieldId === fieldId) selectedFieldId = '';
  }
</script>

<svelte:head><title>{tr($language,'farmerHome')} | AgriFusion BD</title></svelte:head>

<main class="page">
  <section class="farmer-simple-head">
    <div>
      <span class="eyebrow">{tr($language,'farmer')}</span>
      <h1>{$language === 'bn' ? 'আমার জমি' : 'My farm'}</h1>
      <p>{$language === 'bn' ? 'এক নজরে দেখুন আজ কী করতে হবে।' : 'See what you need to do today at a glance.'}</p>
    </div>
    <div class="farmer-simple-actions">
      {#if fullVoiceText}<VoiceGuide text={fullVoiceText} />{/if}
      <a class="button primary" href={appPath('/farmer/fields/new')}>
        <span aria-hidden="true">＋</span>&nbsp;{$language === 'bn' ? 'জমি যোগ করুন' : 'Add field'}
      </a>
    </div>
  </section>

  {#if myFields.length === 0}
    <section class="empty-state field-empty">
      <div class="empty-icon">🌱</div>
      <h2>{$language === 'bn' ? 'প্রথম জমি যোগ করুন' : 'Add your first field'}</h2>
      <p>{$language === 'bn'
        ? 'শুধু জমির নাম, ফসল, আয়তন এবং GPS অবস্থান দিন।'
        : 'Just provide the field name, crop, size and GPS location.'}</p>
      <a class="button primary" href={appPath('/farmer/fields/new')}>
        {$language === 'bn' ? '＋ জমি যোগ করুন' : '＋ Add field'}
      </a>
    </section>
  {:else}
    <section class="field-picker-label">
      <div>
        <span class="eyebrow">{$language === 'bn' ? 'কোন জমি দেখবেন?' : 'Choose a field'}</span>
        <h2>{myFields.length} {$language === 'bn' ? 'টি জমি' : myFields.length === 1 ? 'field' : 'fields'}</h2>
      </div>
      <a href={appPath('/map')}>{$language === 'bn' ? '📍 সব জমি' : '📍 All fields'}</a>
    </section>

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
            <span class="risk-badge {field.risk}">{field.risk === 'high' ? '⚠️' : field.risk === 'medium' ? '●' : '✓'}</span>
          </div>
          <strong>🌾 {localText(field.name,$language)}</strong>
          <span>{localText(field.crop,$language)} • {field.areaHa} ha</span>
          <div class="field-card-health">
            <span>{$language === 'bn' ? 'অবস্থা' : 'Condition'}</span>
            <b>{field.health ? field.health + '/100' : 'নতুন'}</b>
          </div>
        </button>
      {/each}

      <a class="field-add-card" href={appPath('/farmer/fields/new')}>
        <span>＋</span>
        <strong>{$language === 'bn' ? 'আরও জমি' : 'Another field'}</strong>
      </a>
    </div>

    {#if primary}
      <section class="today-board">
        <div class="today-icon">☀️</div>
        <div class="today-copy">
          <span class="eyebrow">{$language === 'bn' ? 'আজ কী করবেন' : 'What to do today'}</span>
          <h2>{localText(primary.action,$language)}</h2>
          <p>{localText(primary.name,$language)} • {localText(primary.crop,$language)} • {primary.areaHa} ha</p>
        </div>
        <VoiceGuide text={localText(primary.action,$language)} />
      </section>

      <section class="simple-action-grid" aria-label={$language === 'bn' ? 'আজকের সহজ পরামর্শ' : 'Simple actions for today'}>
        <SimpleStatus icon="💧" title={irrigation.title} text={irrigation.text} tone={irrigation.tone}>
          <VoiceGuide text={`${irrigation.title}. ${irrigation.text}`} compact={true} />
        </SimpleStatus>

        <SimpleStatus icon="🐛" title={pest.title} text={pest.text} tone={pest.tone}>
          <VoiceGuide text={`${pest.title}. ${pest.text}`} compact={true} />
        </SimpleStatus>

        <SimpleStatus icon="🌧️" title={$language === 'bn' ? 'বৃষ্টির জন্য প্রস্তুত থাকুন' : 'Prepare for rain'} text={weatherText} tone="warn">
          <VoiceGuide text={weatherText} compact={true} />
        </SimpleStatus>
      </section>

      <details class="tech-details">
        <summary>{$language === 'bn' ? 'আরও তথ্য দেখুন' : 'See more details'}</summary>
        <section class="metric-grid">
          <article><span>💧 {tr($language,'soilMoisture')}</span><strong>{primary.soilMoisture ? primary.soilMoisture + '%' : '—'}</strong><small>{tr($language,'roverLayer')}</small></article>
          <article><span>🌿 NDVI</span><strong>{primary.ndvi || '—'}</strong><small>{tr($language,'nasaLayer')}</small></article>
          <article><span>💰 {tr($language,'savings')}</span><strong>{primary.savingBdt ? '৳' + primary.savingBdt : '—'}</strong><small>{$language === 'bn' ? 'সম্ভাব্য' : 'Potential'}</small></article>
          <article><span>🚿 {tr($language,'waterSaved')}</span><strong>{primary.waterSavedL ? primary.waterSavedL + ' L' : '—'}</strong><small>{$language === 'bn' ? 'সম্ভাব্য' : 'Potential'}</small></article>
        </section>
      </details>

      <section class="content-section">
        <div class="farmer-section-title">
          <div class="section-picto">📍</div>
          <div><h2>{$language === 'bn' ? 'আমার জমি কোথায়?' : 'Where is my field?'}</h2><p>{$language === 'bn' ? 'GPS দিয়ে জমি ও নিজের অবস্থান দেখুন।' : 'See your field and your live GPS position.'}</p></div>
        </div>
        <LiveGpsMap fields={[primary]} height="330px" />
      </section>

      <section class="content-section">
        <div class="farmer-section-title">
          <div class="section-picto">🔄</div>
          <div><h2>{$language === 'bn' ? 'পরের ফসল কী হতে পারে?' : 'What could grow next?'}</h2><p>{$language === 'bn' ? 'সহজ তিনটি ফসলের ক্রম।' : 'Three simple rotation options.'}</p></div>
        </div>
        <div class="rotation-list">
          {#each rotationPlans as plan, index}
            <article class:recommended={index === 0}>
              <div class="rotation-rank">{index + 1}</div>
              <div class="rotation-main">
                <strong>🌱 {localText(plan.sequence,$language)}</strong>
                <p>{localText(plan.reason,$language)}</p>
                <div class="tag-row"><span>💧 {plan.water}</span><span>🧺 {plan.fertilizer}</span></div>
              </div>
              <div class="fit-score"><strong>{plan.fit}</strong><small>{$language === 'bn' ? 'মিল' : 'fit'}</small></div>
            </article>
          {/each}
        </div>
      </section>

      {#if primary.source === 'farmer'}
        <div class="field-owner-tools">
          <div>
            <strong>{$language === 'bn' ? '⚙️ জমির তথ্য বদলাতে চান?' : '⚙️ Need to correct this field?'}</strong>
            <small>{$language === 'bn' ? 'ভুল হলে জমিটি মুছে আবার যোগ করুন।' : 'If details are wrong, remove it and add it again.'}</small>
          </div>
          <button class="button danger small" on:click={() => removeField(primary.id)}>
            {$language === 'bn' ? 'মুছুন' : 'Remove'}
          </button>
        </div>
      {/if}
    {/if}
  {/if}
</main>
