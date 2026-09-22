<script lang="ts">
  import { onMount } from 'svelte';
  import { language } from '$lib/stores/app';
  import { tr, localText } from '$lib/i18n';

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

  function riskColor(risk: string) {
    return risk === 'high' ? '#c2410c' : risk === 'medium' ? '#d97706' : '#16804b';
  }

  function popupHtml(field: any, lang: 'bn' | 'en') {
    return `<strong>${localText(field.name,lang)}</strong><br/>${localText(field.crop,lang)}<br/>${tr(lang,'health')}: ${field.health}/100`;
  }

  function updatePosition(position: GeolocationPosition) {
    const { latitude, longitude, accuracy } = position.coords;
    lastCoords = { lat: latitude, lng: longitude, accuracy };
    gpsStatus = 'ready';

    if (livePoint) livePoint.setLatLng([latitude, longitude]);
    else livePoint = L.circleMarker([latitude, longitude], {
      radius: 9, color: '#0f5bd8', weight: 3, fillColor: '#ffffff', fillOpacity: 1
    }).addTo(map);

    if (accuracyCircle) accuracyCircle.setLatLng([latitude, longitude]).setRadius(accuracy);
    else accuracyCircle = L.circle([latitude, longitude], {
      radius: accuracy, color: '#0f5bd8', weight: 1, fillOpacity: .08
    }).addTo(map);

    if (!centeredOnce) {
      map.flyTo([latitude, longitude], 15);
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

  onMount(async () => {
    L = await import('leaflet');
    map = L.map(mapElement, { zoomControl: true, attributionControl: true }).setView([24.405, 88.61], 12);
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: 19,
      attribution: '© OpenStreetMap'
    }).addTo(map);

    const bounds: any[] = [];
    fields.forEach((field) => {
      const polygon = L.polygon(field.boundary, {
        color: riskColor(field.risk), weight: 2, fillOpacity: .16
      }).addTo(map);
      polygon.bindPopup(popupHtml(field, $language));
      polygonEntries.push({ layer: polygon, field });
      bounds.push(...field.boundary);
    });

    const unsubscribe = language.subscribe((lang) => {
      polygonEntries.forEach(({ layer, field }) => layer.setPopupContent(popupHtml(field, lang)));
    });

    if (bounds.length) map.fitBounds(bounds, { padding: [24,24], maxZoom: 15 });
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

<div class="live-map-card">
  <div class="map-toolbar">
    <div>
      <strong>{tr($language,'map')}</strong>
      <small>
        {gpsStatus === 'waiting' ? tr($language,'gpsWaiting') :
         gpsStatus === 'ready' ? tr($language,'gpsReady') :
         gpsStatus === 'denied' ? tr($language,'gpsDenied') : tr($language,'liveLocation')}
      </small>
    </div>
    {#if showLive}
      <button class="button small secondary" on:click={startGps}>{tr($language,'useGps')}</button>
    {/if}
  </div>
  <div class="map-canvas" bind:this={mapElement} style:height></div>
  <div class="map-legend">
    <span><i class="dot good"></i>{tr($language,'good')}</span>
    <span><i class="dot medium"></i>{tr($language,'medium')}</span>
    <span><i class="dot high"></i>{tr($language,'high')}</span>
    {#if lastCoords}<span class="coords">{lastCoords.lat.toFixed(5)}, {lastCoords.lng.toFixed(5)} • ±{Math.round(lastCoords.accuracy)}m</span>{/if}
  </div>
</div>
