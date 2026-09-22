<script lang="ts">
  import { field, specialistMetrics, zones, recommendations } from '$lib/data';
</script>
<svelte:head><title>Field Report | AgriFusion BD</title></svelte:head>
<header class="topbar"><a href="/" class="brand"><span class="brand-mark">🌾</span><span>AgriFusion BD</span></a><nav class="nav"><a href="/farmer">Farmer</a><a href="/specialist">Specialist</a><a href="/map">Boundary</a></nav><span class="badge">{field.id}</span></header>
<main class="shell">
  <section class="hero" style="padding:26px 30px"><div class="eyebrow">Unified field report</div><h1 style="font-size:clamp(2rem,4vw,3rem)">{field.name}</h1><p>{field.crop} • {field.stage} • {field.areaHa} ha • Updated {field.updated}</p></section>
  <section class="grid grid-3">
    <div class="card good"><div class="muted small">Overall crop health</div><div class="metric">78 / 100</div><div class="progress"><span style="width:78%"></span></div></div>
    <div class="card priority"><div class="muted small">Expected yield range</div><div class="metric">5.1–5.6 t/ha</div><div class="small">Model estimate, not a guarantee</div></div>
    <div class="card good"><div class="muted small">Input cost opportunity</div><div class="metric">৳1.2k–1.8k</div><div class="small">Potential weekly savings from targeted irrigation/spraying</div></div>
  </section>
  <div class="section-title"><h2>Evidence summary</h2></div>
  <section class="card table-wrap"><table><thead><tr><th>Indicator</th><th>Satellite</th><th>Ground rover</th><th>Combined interpretation</th></tr></thead><tbody>{#each specialistMetrics as row}<tr><td><strong>{row.metric}</strong></td><td>{row.satellite}</td><td>{row.rover}</td><td>{row.fused} • {row.trend}</td></tr>{/each}</tbody></table></section>
  <div class="section-title"><h2>Field zones</h2></div>
  <section class="grid grid-3">{#each zones as zone}<div class="card"><h3>Zone {zone.id}</h3><div class="metric">{zone.health}</div><p class="muted">{zone.issue}</p><strong>{zone.action}</strong></div>{/each}</section>
  <div class="section-title"><h2>Recommended actions</h2></div>
  <section class="grid grid-3">{#each recommendations as rec}<div class="card"><span class="badge">Priority {rec.priority}</span><h3 style="margin-top:12px">{rec.title}</h3><p class="muted">{rec.why}</p><strong>{rec.action}</strong></div>{/each}</section>
</main>
