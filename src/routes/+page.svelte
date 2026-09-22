<script lang="ts">
  import VoiceGuide from '$lib/components/VoiceGuide.svelte';
  import { language, session } from '$lib/stores/app';
  import { tr } from '$lib/i18n';
  import { appPath } from '$lib/nav';
  import { farmPhotos } from '$lib/images';

  $: dashboardHref = appPath($session?.role === 'specialist' ? '/specialist' : '/farmer');
  $: introVoice = $language === 'bn'
    ? 'এগ্রিফিউশন বাংলাদেশ। কৃষক হলে কৃষক ছবিতে চাপুন। কৃষি বিশেষজ্ঞ হলে বিশেষজ্ঞ ছবিতে চাপুন। জমি দেখতে ম্যাপ ছবিতে চাপুন।'
    : 'AgriFusion Bangladesh. Tap the farmer card if you are a farmer, the specialist card if you are an agriculture specialist, or the map card to view fields.';
</script>

<svelte:head>
  <title>AgriFusion BD</title>
  <meta name="description" content="NASA Earth observations and rover-assisted farm decision support for Bangladesh" />
</svelte:head>

<main class="ag-home">
  <section class="ag-hero">
    <div class="ag-hero-copy">
      <span class="eyebrow">NASA EARTH DATA × LOCAL FARM INTELLIGENCE</span>
      <h1>{$language === 'bn' ? 'কৃষি হোক সহজ। সিদ্ধান্ত হোক পরিষ্কার।' : 'Farming made simple. Decisions made clear.'}</h1>
      <p>{$language === 'bn'
        ? 'জমি, পানি, আবহাওয়া আর ফসলের তথ্যকে সহজ ছবিতে ও কথায় বুঝুন।'
        : 'Understand field, water, weather and crop information through simple visuals and clear actions.'}</p>
      <div class="ag-hero-actions">
        <a class="button primary" href={$session ? dashboardHref : appPath('/login')}>
          {$session ? tr($language,'openDashboard') : ($language === 'bn' ? 'শুরু করুন' : 'Get started')}
        </a>
        <VoiceGuide text={introVoice} />
      </div>
    </div>
    <div class="ag-hero-badge">
      <strong>🛰️ + 🤖 + 📍</strong>
      <span>{$language === 'bn' ? 'স্যাটেলাইট • রোভার • GPS' : 'Satellite • Rover • GPS'}</span>
    </div>
  </section>

  <section class="low-literacy-entry">
    <div class="entry-title">
      <span class="eyebrow">{$language === 'bn' ? 'আপনি কী করতে চান?' : 'What do you want to do?'}</span>
      <h2>{$language === 'bn' ? 'ছবিতে চাপুন' : 'Tap a picture'}</h2>
      <p>{$language === 'bn' ? 'বেশি লেখা পড়তে হবে না।' : 'No need to read a lot of text.'}</p>
    </div>

    <div class="entry-choice-grid">
      <a class="entry-choice farmer" href={$session?.role === 'farmer' ? dashboardHref : appPath('/login')}>
        <img class="entry-photo" src={farmPhotos.farmer} alt="" loading="lazy" />
        <div class="entry-choice-body">
          <strong>👨‍🌾 {$language === 'bn' ? 'আমি কৃষক' : 'I am a farmer'}</strong>
          <span>{$language === 'bn' ? 'আজ কী করব দেখুন' : 'See what to do today'}</span>
        </div>
      </a>

      <a class="entry-choice specialist" href={$session?.role === 'specialist' ? dashboardHref : appPath('/login')}>
        <img class="entry-photo" src={farmPhotos.specialist} alt="" loading="lazy" />
        <div class="entry-choice-body">
          <strong>🧑‍🔬 {$language === 'bn' ? 'আমি কৃষি বিশেষজ্ঞ' : 'I am a specialist'}</strong>
          <span>{$language === 'bn' ? 'এলাকার সব জমি দেখুন' : 'See fields across an area'}</span>
        </div>
      </a>

      <a class="entry-choice map" href={appPath('/map')}>
        <img class="entry-photo" src={farmPhotos.aerial} alt="" loading="lazy" />
        <div class="entry-choice-body">
          <strong>🗺️ {$language === 'bn' ? 'ম্যাপ দেখুন' : 'Open map'}</strong>
          <span>{$language === 'bn' ? 'GPS ও জমির অবস্থান' : 'GPS and field locations'}</span>
        </div>
      </a>
    </div>
  </section>

  <section class="ag-editorial">
    <div><span class="ag-kicker">{$language === 'bn' ? 'কীভাবে কাজ করে' : 'How it works'}</span></div>
    <div>
      <h2>{$language === 'bn' ? 'তথ্য নয়, আগে করণীয়।' : 'Actions first, data second.'}</h2>
      <p>{$language === 'bn'
        ? 'কৃষকের স্ক্রিনে আগে দেখা যাবে পানি দিতে হবে কি না, সমস্যা আছে কি না, আর বৃষ্টির জন্য কী প্রস্তুতি নিতে হবে। প্রয়োজন হলে পরে বিস্তারিত তথ্য দেখা যাবে।'
        : 'The farmer sees irrigation, crop problems and weather preparation first. Detailed satellite and rover numbers stay available only when needed.'}</p>
    </div>
  </section>

  <section class="ag-solutions">
    <div class="ag-solution-grid">
      <article class="ag-solution primary">
        <div><span class="solution-icon">🔊</span><span class="eyebrow">01</span></div>
        <div><h3>{$language === 'bn' ? 'শুনে বুঝুন' : 'Listen instead of read'}</h3><p>{$language === 'bn' ? 'মূল পরামর্শ স্পিকার বোতাম চাপলে পড়ে শোনাবে।' : 'Key advice can be read aloud with the speaker button.'}</p></div>
      </article>

      <article class="ag-solution">
        <img class="solution-photo" src={farmPhotos.irrigation} alt="" loading="lazy" />
        <div>
          <span class="solution-icon">💧</span>
          <h3>{$language === 'bn' ? 'পানি' : 'Water'}</h3>
          <p>{$language === 'bn' ? 'সেচ দেবেন কি দেবেন না, সরাসরি দেখুন।' : 'See directly whether irrigation is needed.'}</p>
        </div>
      </article>

      <article class="ag-solution">
        <img class="solution-photo" src={farmPhotos.storm} alt="" loading="lazy" />
        <div>
          <span class="solution-icon">⚠️</span>
          <h3>{$language === 'bn' ? 'ঝুঁকি' : 'Risk'}</h3>
          <p>{$language === 'bn' ? 'রঙ, ছবি এবং সহজ কথায় আগাম সতর্কতা।' : 'Warnings through color, photos and simple language.'}</p>
        </div>
      </article>
    </div>
  </section>
</main>
