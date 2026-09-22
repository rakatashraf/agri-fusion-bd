<script lang="ts">
  import { farmerKpis, recommendations, weatherAlerts, field } from '$lib/data';
  let language = 'bn';
</script>
<svelte:head><title>Farmer Dashboard | AgriFusion BD</title></svelte:head>
<header class="topbar">
  <a href="/" class="brand"><span class="brand-mark">🌾</span><span>AgriFusion BD</span></a>
  <nav class="nav"><a href="/farmer">আজকের পরামর্শ</a><a href="/field">আমার জমি</a><a href="/map">নতুন জমি</a><a href="/specialist">বিশেষজ্ঞ ভিউ</a></nav>
  <select class="lang" bind:value={language}><option value="bn">বাংলা</option><option value="en">English</option></select>
</header>
<main class="shell">
  <section class="hero" style="padding:28px 30px">
    <div class="eyebrow">{field.name} • {field.areaHa} ha • {field.crop}</div>
    <h1 style="font-size:clamp(2rem,4vw,3.2rem)">আজকের কাজ ৩টি। অপ্রয়োজনীয় সেচ এখনই বন্ধ রাখুন।</h1>
    <p>সর্বশেষ স্যাটেলাইট, রোভার এবং আবহাওয়া তথ্য একত্র করে সাজানো হয়েছে। আপডেট: {field.updated}</p>
    <div class="actions"><a class="btn btn-primary" href="#actions">আজকের কাজ দেখুন</a><a class="btn btn-secondary" href="/field">জমির স্বাস্থ্য দেখুন</a></div>
  </section>

  <div class="alert-strip"><span>⚠️</span><div><strong>বৃহস্পতি–শুক্রবার ভারী বৃষ্টির সম্ভাবনা।</strong><div class="small">আগে থেকেই ড্রেন পরিষ্কার করুন। বৃষ্টির 24 ঘণ্টা আগে ইউরিয়া বা কীটনাশক প্রয়োগ এড়িয়ে চলুন।</div></div></div>

  <div class="section-title"><h2>এক নজরে</h2><span class="badge">ডেটা মান: ভালো • 87%</span></div>
  <section class="grid grid-4">
    {#each farmerKpis as item}
      <div class="card {item.tone === 'urgent' ? 'danger' : item.tone === 'watch' ? 'priority' : 'good'}">
        <div class="muted small">{item.label}</div><div class="metric">{item.value}</div><div class="small">{item.note}</div>
      </div>
    {/each}
  </section>

  <div class="section-title" id="actions"><h2>আজ কী করবেন</h2><span class="muted small">কারণ + সাশ্রয় + পরবর্তী পদক্ষেপ</span></div>
  <section class="grid grid-3">
    {#each recommendations as rec}
      <article class="card {rec.severity === 'urgent' ? 'danger' : rec.severity === 'watch' ? 'priority' : 'good'}">
        <div class="kpi"><span class="badge {rec.severity === 'watch' ? 'badge-warn' : ''}">Priority {rec.priority}</span><span>✓</span></div>
        <h3 style="margin-top:12px">{rec.title}</h3>
        <p class="muted">{rec.why}</p>
        <p><strong>সাশ্রয়/লাভ:</strong> {rec.saving}</p>
        <div class="small"><strong>এখন করুন:</strong> {rec.action}</div>
      </article>
    {/each}
  </section>

  <div class="section-title"><h2>৪ দিনের প্রস্তুতি</h2><span class="muted small">Forecast-aware farm plan</span></div>
  <section class="card table-wrap">
    <table><thead><tr><th>দিন</th><th>বৃষ্টি</th><th>ঝুঁকি</th><th>করণীয়</th></tr></thead><tbody>
      {#each weatherAlerts as row}<tr><td><strong>{row.day}</strong></td><td>{row.rain}</td><td><span class="badge {row.risk === 'উচ্চ' ? 'badge-danger' : row.risk === 'মাঝারি' ? 'badge-warn' : ''}">{row.risk}</span></td><td>{row.note}</td></tr>{/each}
    </tbody></table>
  </section>

  <div class="section-title"><h2>মিশ্র/আন্তঃফসলের সুযোগ</h2></div>
  <section class="grid grid-2">
    <div class="card"><div class="recommendation"><div class="rec-icon">🌱</div><div><h3>ধানের আইলে মুগ</h3><p class="muted">বর্তমান আলো ও খালি আইলের ভিত্তিতে পরীক্ষামূলকভাবে ছোট অংশে বিবেচনা করা যায়। মূল ফসলের পানি ব্যবস্থাপনা যেন ক্ষতিগ্রস্ত না হয়।</p><span class="badge">Potential extra income</span></div></div></div>
    <div class="card"><div class="recommendation"><div class="rec-icon">♻️</div><div><h3>ধৈঞ্চা / green manure strip</h3><p class="muted">মাটির জৈব পদার্থ ও নাইট্রোজেন ব্যবস্থাপনায় সহায়ক হতে পারে। স্থানীয় জাত, মৌসুম ও কৃষি কর্মকর্তার পরামর্শের সাথে মিলিয়ে নিন।</p><span class="badge">Soil improvement</span></div></div></div>
  </section>
</main>
