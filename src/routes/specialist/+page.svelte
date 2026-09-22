<script lang="ts">
  import { specialistMetrics, zones, field, roverMission } from '$lib/data';
</script>
<svelte:head><title>Specialist Workspace | AgriFusion BD</title></svelte:head>
<header class="topbar"><a href="/" class="brand"><span class="brand-mark">🌾</span><span>AgriFusion BD</span></a><nav class="nav"><a href="/specialist">Area Analytics</a><a href="/field">Field Report</a><a href="/map">Boundary & Rover</a><a href="/farmer">Farmer View</a></nav><span class="badge">Specialist mode</span></header>
<main class="shell">
  <section class="hero" style="padding:26px 30px">
    <div class="eyebrow">Field intelligence workspace</div><h1 style="font-size:clamp(2rem,4vw,3.1rem)">{field.name}</h1>
    <p>{field.crop} • {field.stage} • {field.areaHa} ha • Data fusion confidence 87%</p>
    <div class="fusion"><span class="source-chip">🛰️ Sentinel/MODIS layer</span><span class="source-chip">🤖 Rover: 46 samples</span><span class="source-chip">🌦️ Forecast: 4-day</span><span class="source-chip">📚 Field history</span></div>
  </section>

  <section class="grid grid-2">
    <div class="card"><div class="kpi"><div><div class="eyebrow" style="color:#557166">Spatial health overview</div><h2>Priority zones</h2></div><span class="badge badge-warn">1 intervention zone</span></div>
      <div class="field-map"><div class="zone zone-a">Zone A • 87</div><div class="zone zone-b">Zone B • 72</div><div class="zone zone-c">Zone C • 54 ⚠</div></div>
    </div>
    <div class="card"><div class="eyebrow" style="color:#557166">Diagnosis</div><h2>Why vegetation is lower in Zone C</h2>
      <div class="recommendation"><div class="rec-icon">1</div><div><strong>Ground evidence overrides broad satellite average</strong><p class="muted small">Rover images show moderate leaf symptoms while satellite signal remains only mildly stressed.</p></div></div>
      <div class="recommendation"><div class="rec-icon">2</div><div><strong>Moisture is not the main constraint</strong><p class="muted small">Fused soil moisture is adequate, reducing the likelihood that irrigation alone explains stress.</p></div></div>
      <div class="recommendation"><div class="rec-icon">3</div><div><strong>Nitrogen variability + disease pressure</strong><p class="muted small">Best next step is targeted scouting and a soil/tissue check before any field-wide chemical application.</p></div></div>
    </div>
  </section>

  <div class="section-title"><h2>Fused observations</h2><span class="muted small">Raw sources remain visible for auditability</span></div>
  <section class="card table-wrap"><table><thead><tr><th>Metric</th><th>Satellite</th><th>Rover</th><th>Fused state</th><th>Trend</th></tr></thead><tbody>{#each specialistMetrics as row}<tr><td><strong>{row.metric}</strong></td><td>{row.satellite}</td><td>{row.rover}</td><td>{row.fused}</td><td>{row.trend}</td></tr>{/each}</tbody></table></section>

  <div class="section-title"><h2>Zone intervention plan</h2></div>
  <section class="grid grid-3">{#each zones as zone}<div class="card {zone.health < 60 ? 'danger' : zone.health < 80 ? 'priority' : 'good'}"><div class="kpi"><h3>Zone {zone.id}</h3><span class="metric">{zone.health}</span></div><div class="progress"><span style={`width:${zone.health}%`}></span></div><p class="muted small" style="margin-top:12px">Moisture {zone.moisture}% • {zone.issue}</p><strong>{zone.action}</strong></div>{/each}</section>

  <div class="section-title"><h2>Rover mission</h2><a class="btn btn-ghost" href="/map">Edit boundary</a></div>
  <section class="card grid grid-4"><div><div class="muted small">Sampling spacing</div><div class="metric">{roverMission.spacingM} m</div></div><div><div class="muted small">Route length</div><div class="metric">{roverMission.estimatedDistanceKm} km</div></div><div><div class="muted small">Sample points</div><div class="metric">{roverMission.samplePoints}</div></div><div><div class="muted small">Route strategy</div><strong>{roverMission.strategy}</strong></div></section>
</main>
