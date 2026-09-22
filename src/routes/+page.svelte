<svelte:head><title>AgriFusion Bangladesh</title><meta name="description" content="Satellite + rover field intelligence for Bangladeshi agriculture" /></svelte:head>

<header class="topbar">
  <a href="/" class="brand"><span class="brand-mark">🌾</span><span>AgriFusion BD</span></a>
  <nav class="nav"><a href="/farmer">Farmer</a><a href="/specialist">Specialist</a><a href="/map">Add Field</a></nav>
  <select class="lang" aria-label="Language"><option>বাংলা</option><option>English</option></select>
</header>

<main class="shell">
  <section class="hero">
    <div class="eyebrow">Satellite + Rover + Forecast Intelligence</div>
    <h1>কম খরচে, সঠিক সময়ে, ভালো ফলন।</h1>
    <p>বাংলাদেশের কৃষকের জন্য সহজ সিদ্ধান্ত এবং কৃষি বিশেষজ্ঞের জন্য একই মাঠের বিস্তারিত বিশ্লেষণ। স্যাটেলাইট পর্যবেক্ষণ, GPS রোভার, আবহাওয়া ও মাঠের ইতিহাস একসাথে ব্যবহার করে সেচ, রোগ-পোকা, সার, দুর্যোগ প্রস্তুতি ও আন্তঃফসল পরিকল্পনায় সহায়তা করে।</p>
    <div class="mode-switch">
      <a class="mode" href="/farmer"><strong>👨‍🌾 কৃষক মোড</strong><span>আজ কী করতে হবে, কত টাকা/পানি বাঁচতে পারে, কোন ঝুঁকি আগে সামলাতে হবে।</span></a>
      <a class="mode" href="/specialist"><strong>🧪 বিশেষজ্ঞ মোড</strong><span>Zone-wise crop stress, fused measurements, trends, confidence and intervention planning.</span></a>
    </div>
    <div class="actions"><a class="btn btn-primary" href="/map">+ নতুন জমি যোগ করুন</a><a class="btn btn-secondary" href="/farmer">ডেমো রিপোর্ট দেখুন</a></div>
  </section>

  <div class="section-title"><h2>একটি সিদ্ধান্ত কীভাবে তৈরি হয়</h2><span class="muted small">মানুষের বোঝার মতো করে, কেবল সেন্সর-প্যারেড নয়</span></div>
  <section class="grid grid-4">
    <div class="card"><div class="rec-icon">🛰️</div><h3>Satellite</h3><p class="muted">NDVI, canopy condition, land surface temperature, rainfall and broader spatial patterns.</p></div>
    <div class="card"><div class="rec-icon">🤖</div><h3>GPS Rover</h3><p class="muted">Soil moisture, pH, EC, temperature and close-range crop images from planned sampling paths.</p></div>
    <div class="card"><div class="rec-icon">🌦️</div><h3>Forecast</h3><p class="muted">Rain, heat and hazard outlook changes what should be done today, not merely what is happening now.</p></div>
    <div class="card"><div class="rec-icon">🧠</div><h3>Fusion & Advice</h3><p class="muted">Freshness + confidence weighted fusion, crop thresholds, cost impact and explainable recommendations.</p></div>
  </section>
</main>
