<script lang="ts">
  import { onMount } from 'svelte';
  import { language } from '$lib/stores/app';
  import { tr, localText } from '$lib/i18n';
  import {
    NASA_LAYERS,
    createNasaBlueMarble,
    createNasaLabelsLayer,
    createNasaLayer,
    isoDateOffset,
    clampDateToToday,
    type NasaLayerId
  } from '$lib/nasaMap';

  export let fields: any[] = [];
  export let height = '360px';
  export let showLive = true;

  let mapElement: HTMLDivElement;
  let map: any;
  let L: any;
  let livePoint: any;
  let accuracyCircle: any;
  let watchId: number | null = null;
  let gpsStatus: 'idle' | 'waiting' | 'ready' | 'denied' = 'idle';
  let lastCoords: { lat:number; lng:number; accuracy:number } | null = null;
  let centeredOnce = false;
  let polygonEntries: { layer:any; field:any }[] = [];
  let selectedField: any = null;
  let nasaLayer: any;
  let labelsLayer: any;
  let blueMarble: any;
  let activeLayer: NasaLayerId = 'viirs21';
  let imageryDate = isoDateOffset(1);
  let labelsVisible = true;
  let layerLoading = false;

  $: preset = NASA_LAYERS[activeLayer];

  function riskColor(risk: string) {
    return risk === 'high' ? '#ff5b45' : risk === 'medium' ? '#ffca3a' : '#8cff70';
  }

  function popupHtml(field: any, lang: 'bn' | 'en') {
    const health = field.health ? field.health + '/100' : '—';
    return '<div class="satellite-popup"><strong>' + localText(field.name,lang) + '</strong><br/>' +
      localText(field.crop,lang) + '<br/>' + tr(lang,'health') + ': ' + health + '</div>';
  }

  function updatePosition(position: GeolocationPosition) {
    const { latitude, longitude, accuracy } = position.coords;
    lastCoords = { lat: latitude, lng: longitude, accuracy };
    gpsStatus = 'ready';

    if (livePoint) livePoint.setLatLng([latitude, longitude]);
    else livePoint = L.circleMarker([latitude, longitude], {
      radius: 9, color: '#ffffff', weight: 4, fillColor: '#2077ff', fillOpacity: 1
    }).addTo(map).bindTooltip($language === 'bn' ? 'আপনি এখানে' : 'You are here');

    if (accuracyCircle) accuracyCircle.setLatLng([latitude, longitude]).setRadius(accuracy);
    else accuracyCircle = L.circle([latitude, longitude], {
      radius: accuracy, color: '#54a4ff', weight: 1, fillColor: '#2381ff', fillOpacity: .08
    }).addTo(map);

    if (!centeredOnce) {
      map.flyTo([latitude, longitude], 17, { duration: .8 });
      centeredOnce = true;
    }
  }

  function startGps() {
    if (!showLive || typeof navigator === 'undefined' || !navigator.geolocation) {
      gpsStatus = 'denied';
      return;
    }
    gpsStatus = 'waiting';
    if (watchId !== null) navigator.geolocation.clearWatch(watchId);
    watchId = navigator.geolocation.watchPosition(
      updatePosition,
      () => gpsStatus = 'denied',
      { enableHighAccuracy: true, maximumAge: 5000, timeout: 12000 }
    );
  }

  function loadImagery() {
    if (!map || !L) return;
    if (nasaLayer) map.removeLayer(nasaLayer);
    layerLoading = true;
    const p = NASA_LAYERS[activeLayer];
    nasaLayer = createNasaLayer(L, p, imageryDate, p.transparent ? .95 : 1);
    nasaLayer.on('load', () => layerLoading = false);
    nasaLayer.on('tileerror', () => layerLoading = false);
    nasaLayer.addTo(map);
    if (labelsVisible && labelsLayer) labelsLayer.bringToFront();
    polygonEntries.forEach(({layer}) => layer.bringToFront());
    if (livePoint) livePoint.bringToFront();
  }

  function changeLayer(id: NasaLayerId) {
    activeLayer = id;
    if (id === 'hls' && imageryDate > isoDateOffset(2)) imageryDate = isoDateOffset(3);
    loadImagery();
  }

  function dateChanged(value: string) {
    imageryDate = clampDateToToday(value);
    loadImagery();
  }

  function setLatest() {
    imageryDate = activeLayer === 'hls' ? isoDateOffset(3) : isoDateOffset(1);
    loadImagery();
  }

  function toggleLabels() {
    labelsVisible = !labelsVisible;
    if (!map || !labelsLayer) return;
    if (labelsVisible) labelsLayer.addTo(map).bringToFront();
    else map.removeLayer(labelsLayer);
  }

  onMount(async () => {
    L = await import('leaflet');
    map = L.map(mapElement, {
      zoomControl: true,
      attributionControl: true,
      preferCanvas: true,
      zoomSnap: .5,
      zoomDelta: .5
    }).setView([24.405, 88.61], 12);

    blueMarble = createNasaBlueMarble(L).addTo(map);
    labelsLayer = createNasaLabelsLayer(L);
    loadImagery();
    if (labelsVisible) labelsLayer.addTo(map);

    const bounds: any[] = [];

    fields.forEach((field) => {
      if (!field.boundary?.length) return;
      const polygon = L.polygon(field.boundary, {
        color: riskColor(field.risk),
        weight: 4,
        fillColor: riskColor(field.risk),
        fillOpacity: .2,
        opacity: .95,
        className: 'field-risk-polygon'
      }).addTo(map);

      polygon.bindPopup(popupHtml(field, $language));
      polygon.on('click', () => {
        selectedField = field;
        polygonEntries.forEach(({layer, field: other}) => {
          const active = other.id === field.id;
          layer.setStyle({
            weight: active ? 6 : 4,
            fillOpacity: active ? .36 : .2,
            opacity: active ? 1 : .9
          });
        });
      });

      polygonEntries.push({ layer: polygon, field });
      bounds.push(...field.boundary);
    });

    const unsubscribe = language.subscribe((lang) => {
      polygonEntries.forEach(({ layer, field }) => layer.setPopupContent(popupHtml(field, lang)));
    });

    if (bounds.length) map.fitBounds(bounds, { padding: [32,32], maxZoom: 17 });
    if (showLive) startGps();

    return () => {
      unsubscribe();
      if (watchId !== null && navigator.geolocation) navigator.geolocation.clearWatch(watchId);
      if (map) map.remove();
    };
  });
</script>

<svelte:head>
  <link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css" />
</svelte:head>

<div class="live-map-card nasa-live-map">
  <div class="map-toolbar nasa-map-toolbar">
    <div>
      <div class="nasa-badge"><span class="pulse-dot"></span> NASA EO</div>
      <strong>{tr($language,'map')}</strong>
      <small>
        {gpsStatus === 'waiting' ? tr($language,'gpsWaiting') :
         gpsStatus === 'ready' ? tr($language,'gpsReady') :
         gpsStatus === 'denied' ? tr($language,'gpsDenied') :
         ($language === 'bn' ? 'NASA স্যাটেলাইট ইমেজারি' : 'NASA satellite imagery')}
      </small>
    </div>

    <div class="live-map-actions">
      {#if showLive}
        <button class="button small secondary" on:click={startGps}>◎ {tr($language,'useGps')}</button>
      {/if}
      <button class="button small secondary" on:click={toggleLabels}>{labelsVisible ? 'Aa ✓' : 'Aa'}</button>
    </div>
  </div>

  <div class="nasa-layer-toolbar compact">
    <div class="layer-pills">
      <button type="button" class:active={activeLayer === 'viirs21'} on:click={() => changeLayer('viirs21')}>
        <b>Near-live</b><small>VIIRS</small>
      </button>
      <button type="button" class:active={activeLayer === 'hls'} on:click={() => changeLayer('hls')}>
        <b>30 m detail</b><small>HLS</small>
      </button>
      <button type="button" class:active={activeLayer === 'modis'} on:click={() => changeLayer('modis')}>
        <b>Terra</b><small>MODIS</small>
      </button>
    </div>

    <div class="imagery-date">
      <label>
        <span>{$language === 'bn' ? 'তারিখ' : 'Date'}</span>
        <input type="date" value={imageryDate} max={new Date().toISOString().slice(0,10)}
          on:change={(e) => dateChanged(e.currentTarget.value)} />
      </label>
      <button type="button" on:click={setLatest}>{$language === 'bn' ? 'সর্বশেষ' : 'Latest'}</button>
    </div>
  </div>

  <div class="imagery-meta">
    <span><b>{preset.label}</b></span>
    <span>{preset.resolution}</span>
    <span>{imageryDate}</span>
    {#if layerLoading}<span class="loading-chip">↻ {$language === 'bn' ? 'ইমেজ লোড হচ্ছে' : 'Loading'}</span>{/if}
  </div>

  <div class="map-canvas-wrap">
    <div class="map-canvas" bind:this={mapElement} style:height></div>
    <div class="map-quality-badge">HiDPI • NASA GIBS</div>
  </div>

  <div class="map-legend">
    <span><i class="dot good"></i>{tr($language,'good')}</span>
    <span><i class="dot medium"></i>{tr($language,'medium')}</span>
    <span><i class="dot high"></i>{tr($language,'high')}</span>
    {#if lastCoords}<span class="coords">{lastCoords.lat.toFixed(5)}, {lastCoords.lng.toFixed(5)} • ±{Math.round(lastCoords.accuracy)}m</span>{/if}
  </div>

  {#if selectedField}
    <div class="selected-field-strip">
      <span class="risk-swatch" style:background={riskColor(selectedField.risk)}></span>
      <div>
        <strong>{localText(selectedField.name,$language)}</strong>
        <small>{localText(selectedField.crop,$language)} • {selectedField.areaHa} ha</small>
      </div>
      <b>{selectedField.health || '—'}/100</b>
    </div>
  {/if}
</div>
