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

<main class="ag-home">
  <section class="ag-hero">
    <div class="ag-hero-copy">
      <span class="eyebrow">NASA EARTH DATA × LOCAL FARM INTELLIGENCE</span>
      <h1>{$language === 'bn' ? 'ভবিষ্যতের জন্য আরও বুদ্ধিমান কৃষি।' : 'Smart farming for future generations.'}</h1>
      <p>{$language === 'bn'
        ? 'স্যাটেলাইট, রোভার, আবহাওয়া এবং কৃষকের নিজস্ব জমির তথ্য একত্র করে সেচ, ফসল নির্বাচন, রোগ-পোকা ও ঝুঁকির সিদ্ধান্ত সহজ করে।'
        : 'Satellite, rover, weather and field-level data come together to simplify irrigation, crop choice, pest scouting and climate-risk decisions.'}</p>
      <div class="ag-hero-actions">
        <a class="button primary" href={$session ? dashboardHref : appPath('/login')}>
          {$session ? tr($language,'openDashboard') : ($language === 'bn' ? 'শুরু করুন' : 'Get started')}
        </a>
        <a class="button secondary" href={appPath('/map')}>{tr($language,'seeLiveMap')}</a>
      </div>
    </div>
    <div class="ag-hero-badge">
      <strong>NASA + Rover + GPS</strong>
      <span>{$language === 'bn' ? 'একই সিদ্ধান্ত ব্যবস্থায়' : 'one decision system'}</span>
    </div>
  </section>

  <section class="ag-trust">
    <div><span>{$language === 'bn' ? 'ডেটা স্তর' : 'Data layers'}</span><strong>4+</strong></div>
    <div><span>{$language === 'bn' ? 'কৃষক মোড' : 'Farmer mode'}</span><strong>{$language === 'bn' ? 'সহজ করণীয়' : 'Action first'}</strong></div>
    <div><span>{$language === 'bn' ? 'বিশেষজ্ঞ মোড' : 'Specialist mode'}</span><strong>{$language === 'bn' ? 'এলাকাভিত্তিক' : 'Area-wide'}</strong></div>
    <div><span>{$language === 'bn' ? 'ম্যাপ' : 'Mapping'}</span><strong>Live GPS</strong></div>
  </section>

  <section class="ag-editorial">
    <div>
      <span class="ag-kicker">{$language === 'bn' ? 'AgriFusion কী করে' : 'What AgriFusion does'}</span>
    </div>
    <div>
      <h2>{$language === 'bn' ? 'জটিল কৃষি ডেটাকে বাস্তব মাঠের সিদ্ধান্তে রূপান্তর করে।' : 'Turns complex farm data into clear field decisions.'}</h2>
      <p>{$language === 'bn'
        ? 'কৃষকের জন্য উত্তরটি হয় সহজ: আজ কী করতে হবে। বিশেষজ্ঞের জন্য একই ডেটা দেখায় কোথায় সমস্যা হচ্ছে, কোন জমি আগে দেখতে হবে এবং কেন।'
        : 'For farmers, the answer stays simple: what should I do today? For specialists, the same data explains where problems are developing, which fields need attention first, and why.'}</p>
    </div>
  </section>

  <section class="ag-solutions">
    <div class="section-heading">
      <div>
        <span class="eyebrow">{$language === 'bn' ? 'স্মার্ট ফার্মিং সল্যুশন' : 'Smart farming solutions'}</span>
        <h2>{$language === 'bn' ? 'বাস্তব ফলাফলের জন্য ডিজাইন করা।' : 'Designed around real outcomes.'}</h2>
      </div>
    </div>

    <div class="ag-solution-grid">
      <article class="ag-solution primary">
        <div>
          <span class="solution-icon">◎</span>
          <span class="eyebrow">01</span>
        </div>
        <div>
          <h3>{tr($language,'today')}</h3>
          <p>{$language === 'bn'
            ? 'মাটির আর্দ্রতা, বৃষ্টি, NDVI এবং মাঠের পর্যবেক্ষণ থেকে সরাসরি করণীয়।'
            : 'Direct actions from soil moisture, rainfall, NDVI and ground observations.'}</p>
        </div>
      </article>

      <article class="ag-solution">
        <div class="solution-number">02</div>
        <div>
          <span class="solution-icon">↻</span>
          <h3>{tr($language,'rotation')}</h3>
          <p>{tr($language,'rotationIntro')}</p>
        </div>
      </article>

      <article class="ag-solution">
        <div class="solution-number">03</div>
        <div>
          <span class="solution-icon">⌖</span>
          <h3>{tr($language,'map')}</h3>
          <p>{$language === 'bn'
            ? 'লাইভ GPS, জমির সীমানা, রোভার নমুনা এবং ঝুঁকি একই ভিউতে।'
            : 'Live GPS, field boundaries, rover samples and risk in one view.'}</p>
        </div>
      </article>
    </div>
  </section>
</main>
