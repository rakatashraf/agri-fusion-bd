<script lang="ts">
  import { field, roverMission } from '$lib/data';
  let north = field.boundary.north;
  let south = field.boundary.south;
  let east = field.boundary.east;
  let west = field.boundary.west;
  let spacing = roverMission.spacingM;
  $: widthApprox = Math.max(0, Math.round((east - west) * 102000));
  $: heightApprox = Math.max(0, Math.round((north - south) * 111000));
  $: areaApprox = Math.round(widthApprox * heightApprox / 100) / 100;
</script>
<svelte:head><title>Field Boundary & Rover | AgriFusion BD</title></svelte:head>
<header class="topbar"><a href="/" class="brand"><span class="brand-mark">🌾</span><span>AgriFusion BD</span></a><nav class="nav"><a href="/farmer">Farmer</a><a href="/specialist">Specialist</a><a href="/field">Field Report</a></nav><span class="badge">GPS boundary setup</span></header>
<main class="shell">
  <section class="hero" style="padding:26px 30px"><div class="eyebrow">Field registration + rover planning</div><h1 style="font-size:clamp(2rem,4vw,3rem)">জমির চারটি GPS সীমা দিন</h1><p>রোভার এই boundary box-এর ভেতরে serpentine route অনুসরণ করবে। পরে polygon drawing, obstacle avoidance এবং RTK-GPS route refinement যুক্ত করা যাবে।</p></section>
  <section class="grid grid-2">
    <div class="card">
      <h2>Boundary coordinates</h2>
      <div class="form-grid"><label>North latitude<input type="number" step="0.0001" bind:value={north} /></label><label>South latitude<input type="number" step="0.0001" bind:value={south} /></label><label>East longitude<input type="number" step="0.0001" bind:value={east} /></label><label>West longitude<input type="number" step="0.0001" bind:value={west} /></label></div>
      <label style="margin-top:12px">Rover sampling spacing (m)<input type="number" min="5" max="50" bind:value={spacing} /></label>
      <div class="actions"><button class="btn btn-primary">Generate Rover Route</button><a class="btn btn-ghost" href="/specialist">View specialist report</a></div>
      <p class="small muted">Approximate rectangle: {widthApprox} m × {heightApprox} m. This is a quick planning estimate, not cadastral surveying.</p>
    </div>
    <div class="card"><h2>Mission preview</h2><div class="field-map"><div class="zone zone-a" style="left:7%;top:7%;width:86%;height:86%;background:repeating-linear-gradient(0deg,rgba(255,255,255,.05),rgba(255,255,255,.05) 18px,rgba(23,76,53,.22) 19px,rgba(23,76,53,.22) 21px)">GPS boundary<br><span class="small">serpentine sampling • {spacing} m spacing</span></div></div><div class="fusion"><span class="source-chip">📍 {north.toFixed(4)}, {west.toFixed(4)}</span><span class="source-chip">📍 {south.toFixed(4)}, {east.toFixed(4)}</span></div></div>
  </section>
  <div class="section-title"><h2>What the rover collects</h2></div>
  <section class="grid grid-3"><div class="card"><h3>Soil</h3><p class="muted">Moisture, pH, EC, temperature at GPS-tagged points.</p></div><div class="card"><h3>Crop</h3><p class="muted">Close-range RGB imagery for leaf symptoms, canopy coverage and ground verification.</p></div><div class="card"><h3>Navigation</h3><p class="muted">GPS track, timestamps and sample IDs so each observation can be aligned with satellite pixels.</p></div></section>
</main>
