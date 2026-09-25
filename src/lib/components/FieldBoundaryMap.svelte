<script lang="ts">
  import { createEventDispatcher, onMount } from 'svelte';
  import {
    NASA_LAYERS,
    createNasaBlueMarble,
    createNasaLabelsLayer,
    createNasaLayer,
    isoDateOffset,
    clampDateToToday,
    type NasaLayerId
  } from '$lib/nasaMap';

  export let language: 'bn' | 'en' = 'bn';
  export let boundary: [number, number][] = [];
  export let initialCenter: [number, number] = [24.405, 88.61];

  const dispatch = createEventDispatcher();

  let mapElement: HTMLDivElement;
  let map: any;
  let L: any;
  let nasaLayer: any;
  let blueMarble: any;
  let labelsLayer: any;
  let boundaryLayer: any;
  let previewLine: any;
  let pointLayers: any[] = [];
  let gpsMarker: any;
  let gpsState: 'idle' | 'loading' | 'ready' | 'error' = 'idle';
  let activeLayer: NasaLayerId = 'viirs21';
  let imageryDate = isoDateOffset(1);
  let labelsVisible = true;
  let drawing = true;
  let layerLoading = false;
  let tileErrors = 0;

  $: preset = NASA_LAYERS[activeLayer];
  $: areaHa = polygonAreaHa(boundary);
  $: perimeterM = polygonPerimeterM(boundary);
  $: ready = boundary.length >= 3;

  function polygonCenter(points: [number, number][]) {
    if (!points.length) return initialCenter;
    const lat = points.reduce((sum, p) => sum + p[0], 0) / points.length;
    const lng = points.reduce((sum, p) => sum + p[1], 0) / points.length;
    return [lat, lng] as [number, number];
  }

  function polygonAreaHa(points: [number, number][]) {
    if (points.length < 3) return 0;
    const centerLat = points.reduce((sum, p) => sum + p[0], 0) / points.length;
    const metersPerLng = 111320 * Math.cos(centerLat * Math.PI / 180);
    const xy = points.map(([lat, lng]) => [lng * metersPerLng, lat * 111320]);

    let area = 0;
    for (let i = 0; i < xy.length; i++) {
      const [x1, y1] = xy[i];
      const [x2, y2] = xy[(i + 1) % xy.length];
      area += x1 * y2 - x2 * y1;
    }
    return Math.abs(area) / 2 / 10000;
  }

  function distanceM(a: [number, number], b: [number, number]) {
    const R = 6371000;
    const p1 = a[0] * Math.PI / 180;
    const p2 = b[0] * Math.PI / 180;
    const dp = (b[0] - a[0]) * Math.PI / 180;
    const dl = (b[1] - a[1]) * Math.PI / 180;
    const q = Math.sin(dp/2) ** 2 + Math.cos(p1) * Math.cos(p2) * Math.sin(dl/2) ** 2;
    return 2 * R * Math.atan2(Math.sqrt(q), Math.sqrt(1-q));
  }

  function polygonPerimeterM(points: [number, number][]) {
    if (points.length < 2) return 0;
    let total = 0;
    for (let i = 1; i < points.length; i++) total += distanceM(points[i-1], points[i]);
    if (points.length >= 3) total += distanceM(points[points.length-1], points[0]);
    return total;
  }

  function emitChange() {
    dispatch('change', {
      boundary,
      areaHa: polygonAreaHa(boundary),
      perimeterM: polygonPerimeterM(boundary),
      center: polygonCenter(boundary)
    });
  }

  function removeDrawingLayers() {
    if (!map) return;
    if (boundaryLayer) {
      map.removeLayer(boundaryLayer);
      boundaryLayer = null;
    }
    if (previewLine) {
      map.removeLayer(previewLine);
      previewLine = null;
    }
    pointLayers.forEach((layer) => map.removeLayer(layer));
    pointLayers = [];
  }

  function pointIcon(index: number) {
    return L.divIcon({
      className: 'field-vertex-shell',
      html: '<span class="field-vertex">' + (index + 1) + '</span>',
      iconSize: [32,32],
      iconAnchor: [16,16]
    });
  }

  function updatePoint(index: number, lat: number, lng: number) {
    boundary = boundary.map((point, i) =>
      i === index ? [Number(lat.toFixed(7)), Number(lng.toFixed(7))] as [number, number] : point
    );
    redraw();
    emitChange();
  }

  function redraw() {
    if (!map || !L) return;
    removeDrawingLayers();

    boundary.forEach((point, index) => {
      const marker = L.marker(point, {
        icon: pointIcon(index),
        draggable: true,
        riseOnHover: true,
        keyboard: true,
        title: (language === 'bn' ? 'সীমানা পয়েন্ট ' : 'Boundary point ') + (index + 1)
      }).addTo(map);

      marker.on('drag', (event: any) => {
        const { lat, lng } = event.target.getLatLng();
        const working = boundary.map((p, i) => i === index ? [lat, lng] : p);
        if (boundaryLayer) boundaryLayer.setLatLngs(working);
      });
      marker.on('dragend', (event: any) => {
        const { lat, lng } = event.target.getLatLng();
        updatePoint(index, lat, lng);
      });
      marker.on('dblclick', (event: any) => {
        L.DomEvent.stopPropagation(event);
        boundary = boundary.filter((_, i) => i !== index);
        redraw();
        emitChange();
      });

      pointLayers.push(marker);
    });

    if (boundary.length >= 3) {
      boundaryLayer = L.polygon(boundary, {
        color: drawing ? '#d9ff54' : '#73f58d',
        weight: drawing ? 4 : 5,
        opacity: 1,
        fillColor: drawing ? '#43d66d' : '#35d978',
        fillOpacity: drawing ? .24 : .34,
        lineJoin: 'round',
        className: 'farmer-selection-polygon'
      }).addTo(map);
    } else if (boundary.length >= 2) {
      boundaryLayer = L.polyline(boundary, {
        color: '#ffce56',
        weight: 4,
        opacity: 1,
        dashArray: '10 8',
        lineJoin: 'round'
      }).addTo(map);
    }
  }

  function addPoint(lat: number, lng: number) {
    if (!drawing) return;
    boundary = [...boundary, [Number(lat.toFixed(7)), Number(lng.toFixed(7))]];
    redraw();
    emitChange();
  }

  function undoPoint() {
    if (!boundary.length) return;
    boundary = boundary.slice(0, -1);
    redraw();
    emitChange();
  }

  function clearBoundary() {
    boundary = [];
    drawing = true;
    redraw();
    emitChange();
  }

  function finishBoundary() {
    if (boundary.length < 3) return;
    drawing = false;
    redraw();
    emitChange();
  }

  function editBoundary() {
    drawing = true;
    redraw();
  }

  function useGps() {
    if (!navigator.geolocation) {
      gpsState = 'error';
      return;
    }

    gpsState = 'loading';
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const point: [number, number] = [position.coords.latitude, position.coords.longitude];
        gpsState = 'ready';
        map.setView(point, 18);

        if (gpsMarker) gpsMarker.setLatLng(point);
        else {
          gpsMarker = L.circleMarker(point, {
            radius: 10,
            color: '#ffffff',
            weight: 4,
            fillColor: '#2077ff',
            fillOpacity: 1
          }).addTo(map).bindTooltip(language === 'bn' ? 'আপনি এখানে' : 'You are here');
        }

        dispatch('center', { center: point });
      },
      () => gpsState = 'error',
      { enableHighAccuracy: true, timeout: 12000, maximumAge: 3000 }
    );
  }

  function loadImagery() {
    if (!map || !L) return;

    if (nasaLayer) map.removeLayer(nasaLayer);
    layerLoading = true;
    tileErrors = 0;

    const selectedPreset = NASA_LAYERS[activeLayer];
    nasaLayer = createNasaLayer(L, selectedPreset, imageryDate, selectedPreset.transparent ? .96 : 1);

    nasaLayer.on('loading', () => layerLoading = true);
    nasaLayer.on('load', () => layerLoading = false);
    nasaLayer.on('tileerror', () => {
      tileErrors += 1;
      layerLoading = false;
    });

    nasaLayer.addTo(map);
    if (labelsVisible && labelsLayer) labelsLayer.bringToFront();
    redraw();
  }

  function changeLayer(id: NasaLayerId) {
    activeLayer = id;
    if (id === 'hls' && imageryDate > isoDateOffset(2)) imageryDate = isoDateOffset(3);
    loadImagery();
  }

  function setLatest() {
    imageryDate = activeLayer === 'hls' ? isoDateOffset(3) : isoDateOffset(1);
    loadImagery();
  }

  function dateChanged(value: string) {
    imageryDate = clampDateToToday(value);
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
      zoomDelta: .5,
      wheelPxPerZoomLevel: 90,
      doubleClickZoom: false
    }).setView(initialCenter, 17);

    blueMarble = createNasaBlueMarble(L).addTo(map);
    labelsLayer = createNasaLabelsLayer(L);
    loadImagery();
    if (labelsVisible) labelsLayer.addTo(map);

    map.on('click', (event: any) => addPoint(event.latlng.lat, event.latlng.lng));
    map.on('mousemove', (event: any) => {
      if (!drawing || !boundary.length) return;
      const last = boundary[boundary.length - 1];
      const points = [last, [event.latlng.lat, event.latlng.lng]];
      if (!previewLine) {
        previewLine = L.polyline(points, {
          color: '#ffffff',
          weight: 2,
          opacity: .9,
          dashArray: '6 7',
          interactive: false
        }).addTo(map);
      } else {
        previewLine.setLatLngs(points);
      }
    });
    map.on('mouseout', () => {
      if (previewLine) {
        map.removeLayer(previewLine);
        previewLine = null;
      }
    });

    redraw();
    if (boundary.length >= 3) map.fitBounds(boundary, { padding: [40, 40], maxZoom: 18 });

    setTimeout(() => map.invalidateSize(), 120);

    return () => {
      if (map) map.remove();
    };
  });
</script>

<svelte:head>
  <link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css" />
</svelte:head>

<div class="boundary-editor nasa-boundary-editor">
  <div class="nasa-map-head">
    <div class="nasa-badge"><span class="pulse-dot"></span> NASA EO</div>
    <div>
      <strong>{language === 'bn' ? 'স্যাটেলাইট ম্যাপে জমির সীমানা আঁকুন' : 'Draw your field on NASA satellite imagery'}</strong>
      <span>{language === 'bn'
        ? 'প্রতিটি কোণা বা বাঁকে ট্যাপ করুন। পয়েন্ট টেনে ঠিক করুন। ডাবল ট্যাপ/ক্লিকে পয়েন্ট মুছুন।'
        : 'Tap every corner or bend. Drag points to refine. Double-click a point to remove it.'}</span>
    </div>
  </div>

  <div class="nasa-layer-toolbar">
    <div class="layer-pills">
      <button type="button" class:active={activeLayer === 'viirs21'} on:click={() => changeLayer('viirs21')}>
        <b>Near-live</b><small>NOAA-21 VIIRS</small>
      </button>
      <button type="button" class:active={activeLayer === 'hls'} on:click={() => changeLayer('hls')}>
        <b>Field detail</b><small>HLS 30 m</small>
      </button>
      <button type="button" class:active={activeLayer === 'modis'} on:click={() => changeLayer('modis')}>
        <b>Terra</b><small>MODIS</small>
      </button>
    </div>

    <div class="imagery-date">
      <label>
        <span>{language === 'bn' ? 'তারিখ' : 'Imagery date'}</span>
        <input type="date" value={imageryDate} max={new Date().toISOString().slice(0,10)}
          on:change={(e) => dateChanged(e.currentTarget.value)} />
      </label>
      <button type="button" on:click={setLatest}>{language === 'bn' ? 'সর্বশেষ' : 'Latest'}</button>
      <button type="button" class:active={labelsVisible} on:click={toggleLabels}>Aa</button>
    </div>
  </div>

  <div class="imagery-meta">
    <span><b>{preset.label}</b></span>
    <span>{preset.resolution}</span>
    <span>{preset.latency}</span>
    <span>{imageryDate}</span>
    {#if layerLoading}<span class="loading-chip">↻ {language === 'bn' ? 'ইমেজ লোড হচ্ছে' : 'Loading imagery'}</span>{/if}
    {#if tileErrors > 2}<span class="warning-chip">⚠ {language === 'bn' ? 'এই তারিখে কিছু টাইল পাওয়া যায়নি' : 'Some imagery is unavailable for this date'}</span>{/if}
  </div>

  <div class="boundary-map-wrap">
    <div class="boundary-map" bind:this={mapElement}></div>

    <div class="draw-state" class:ready>
      <span class="draw-dot"></span>
      {drawing
        ? (language === 'bn' ? 'সীমানা আঁকা হচ্ছে' : 'Drawing boundary')
        : (language === 'bn' ? 'সীমানা সম্পন্ন' : 'Boundary complete')}
    </div>

    <div class="map-quality-badge">HiDPI • NASA GIBS</div>
  </div>

  <div class="boundary-tools boundary-tools-strong">
    <button type="button" class="boundary-tool gps" on:click={useGps}>
      <span>{gpsState === 'loading' ? '⌛' : gpsState === 'ready' ? '✅' : '◎'}</span>
      {language === 'bn' ? 'আমার অবস্থান' : 'My location'}
    </button>

    {#if drawing}
      <button type="button" class="boundary-tool finish" on:click={finishBoundary} disabled={boundary.length < 3}>
        ✓ {language === 'bn' ? 'সীমানা শেষ করুন' : 'Finish boundary'}
      </button>
    {:else}
      <button type="button" class="boundary-tool finish" on:click={editBoundary}>
        ✎ {language === 'bn' ? 'আবার সম্পাদনা' : 'Edit boundary'}
      </button>
    {/if}

    <button type="button" class="boundary-tool" on:click={undoPoint} disabled={!boundary.length}>
      ↶ {language === 'bn' ? 'শেষ পয়েন্ট মুছুন' : 'Undo'}
    </button>

    <button type="button" class="boundary-tool danger" on:click={clearBoundary} disabled={!boundary.length}>
      ✕ {language === 'bn' ? 'সব মুছুন' : 'Clear'}
    </button>
  </div>

  <div class="boundary-result boundary-result-color" class:ready>
    <div>
      <span>{language === 'bn' ? 'সীমানা পয়েন্ট' : 'Vertices'}</span>
      <strong>{boundary.length}</strong>
    </div>
    <div>
      <span>{language === 'bn' ? 'হিসাব করা আয়তন' : 'Calculated area'}</span>
      <strong>{areaHa > 0 ? areaHa.toFixed(2) + ' ha' : '—'}</strong>
    </div>
    <div>
      <span>{language === 'bn' ? 'পরিধি' : 'Perimeter'}</span>
      <strong>{perimeterM > 0 ? Math.round(perimeterM) + ' m' : '—'}</strong>
    </div>
    <div>
      <span>{language === 'bn' ? 'স্ট্যাটাস' : 'Status'}</span>
      <strong>{ready ? (drawing ? '● ' + (language === 'bn' ? 'সম্পাদনাযোগ্য' : 'Editable') : '✓ ' + (language === 'bn' ? 'প্রস্তুত' : 'Ready')) : (language === 'bn' ? 'আরও পয়েন্ট দিন' : 'Add points')}</strong>
    </div>
  </div>

  <p class="nasa-map-note">
    {language === 'bn'
      ? 'NASA Near-live স্তর সাধারণত কয়েক ঘণ্টার মধ্যে আসে। HLS 30 m স্তর বেশি বিস্তারিত কিন্তু কয়েক দিন পিছিয়ে থাকতে পারে এবং মেঘ/কক্ষপথের কারণে ফাঁক থাকতে পারে।'
      : 'NASA near-live layers are typically available within hours. HLS 30 m is sharper but can be days behind and may contain cloud/orbit gaps.'}
  </p>

  {#if gpsState === 'error'}
    <p class="form-error">{language === 'bn'
      ? 'GPS পাওয়া যায়নি। ম্যাপ সরিয়ে আপনার জমিতে গিয়ে পয়েন্ট দিতে পারেন।'
      : 'GPS was unavailable. Pan the map to your field and mark it manually.'}</p>
  {/if}
</div>
