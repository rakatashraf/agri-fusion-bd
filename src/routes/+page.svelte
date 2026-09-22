<script lang="ts">
  import { language, session } from '$lib/stores/app';
  import { tr } from '$lib/i18n';
  import { appPath } from '$lib/nav';

  $: dashboardHref = appPath($session?.role === 'specialist' ? '/specialist' : '/farmer');
</script>

<svelte:head>
  <title>AgriFusion BD</title>
  <meta name="description" content="NASA Earth observations and rover-assisted farm decision support for Bangladesh" />
</svelte:head>

<main class="page">
  <section class="welcome-card">
    <div class="welcome-copy">
      <span class="eyebrow">{tr($language,'nasaChallenge')}</span>
      <h1>{tr($language,'welcomeTitle')}</h1>
      <p>{tr($language,'welcomeBody')}</p>
      <div class="button-row">
        <a class="button primary" href={$session ? dashboardHref : appPath('/login')}>{tr($language,'openDashboard')}</a>
        <a class="button secondary" href={appPath('/map')}>{tr($language,'seeLiveMap')}</a>
      </div>
    </div>
    <div class="simple-flow">
      <div><span>1</span><strong>{tr($language,'nasaLayer')}</strong></div>
      <div><span>2</span><strong>{tr($language,'roverLayer')}</strong></div>
      <div><span>3</span><strong>{tr($language,'weatherLayer')}</strong></div>
      <div><span>4</span><strong>{tr($language,'today')}</strong></div>
    </div>
  </section>

  <section class="content-section">
    <div class="section-heading">
      <div><span class="eyebrow">{tr($language,'nasaChallenge')}</span><h2>{tr($language,'challengeFocus')}</h2></div>
    </div>
    <div class="feature-grid">
      <article class="feature-card"><span>💧</span><h3>{tr($language,'irrigation')}</h3><p>{$language === 'bn' ? 'মাটির আর্দ্রতা, বৃষ্টি ও ফসলের পর্যায় মিলিয়ে কখন পানি দরকার তা সহজভাবে দেখায়।' : 'Uses soil moisture, rainfall and crop stage to explain when irrigation is actually needed.'}</p></article>
      <article class="feature-card"><span>🌱</span><h3>{tr($language,'rotation')}</h3><p>{$language === 'bn' ? 'একই জমিতে পরের মৌসুমে কোন ফসলের ক্রম মাটি ও পানির জন্য বেশি উপযোগী তা তুলনা করে।' : 'Compares next-season crop sequences for soil health, water demand and resilience.'}</p></article>
      <article class="feature-card"><span>⚠️</span><h3>{tr($language,'alerts')}</h3><p>{$language === 'bn' ? 'ভারী বৃষ্টি, পানি জমা, রোগ-পোকা ও অন্যান্য ঝুঁকির আগে করণীয় জানায়।' : 'Surfaces preparation steps before heavy rain, waterlogging, pest and disease risk.'}</p></article>
      <article class="feature-card"><span>📍</span><h3>{tr($language,'map')}</h3><p>{$language === 'bn' ? 'GPS অবস্থান, জমির সীমানা, স্বাস্থ্য ও ঝুঁকি একই মানচিত্রে দেখায়।' : 'Shows GPS position, field boundaries, health and risk on one clear map.'}</p></article>
    </div>
  </section>
</main>
