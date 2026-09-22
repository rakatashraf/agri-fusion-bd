<script lang="ts">
  import { createEventDispatcher, onMount } from 'svelte';

  export let language: 'bn' | 'en' = 'bn';
  export let boundary: [number, number][] = [];
  export let initialCenter: [number, number] = [24.405, 88.61];

  const dispatch = createEventDispatcher();

  let mapElement: HTMLDivElement;
  let map: any;
  let L: any;
  let boundaryLayer: any;
  let pointLayers: any[] = [];
  let gpsMarker: any;
  let gpsState: 'idle' | 'loading' | 'ready' | 'error' = 'idle';

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

  function emitChange() {
    const areaHa = polygonAreaHa(boundary);
    const center = polygonCenter(boundary);
    dispatch('change', { boundary, areaHa, center });
  }

  function clearDrawings() {
    if (!map) return;
    if (boundaryLayer) {
      map.removeLayer(boundaryLayer);
      boundaryLayer = null;
    }
    pointLayers.forEach((layer) => map.removeLayer(layer));
    pointLayers = [];
  }

  function redraw() {
    if (!map || !L) return;
    clearDrawings();

    boundary.forEach((point, index) => {
      const marker = L.circleMarker(point, {
        radius: 10,
        color: '#ffffff',
        weight: 3,
        fillColor: '#1d3a2a',
        fillOpacity: 1
      }).addTo(map);
      marker.bindTooltip(String(index + 1), {
        permanent: true,
        direction: 'center',
        className: 'boundary-point-number'
      });
      pointLayers.push(marker);
    });

    if (boundary.length >= 3) {
      boundaryLayer = L.polygon(boundary, {
        color: '#1d3a2a',
        weight: 3,
        fillColor: '#78a66e',
        fillOpacity: .25
      }).addTo(map);
    } else if (boundary.length >= 2) {
      boundaryLayer = L.polyline(boundary, {
        color: '#1d3a2a',
        weight: 3,
        dashArray: '7 7'
      }).addTo(map);
    }
  }

  function addPoint(lat: number, lng: number) {
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
    redraw();
    emitChange();
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
            radius: 9,
            color: '#1769aa',
            weight: 3,
            fillColor: '#ffffff',
            fillOpacity: 1
          }).addTo(map);
        }

        dispatch('center', { center: point });
      },
      () => gpsState = 'error',
      { enableHighAccuracy: true, timeout: 12000, maximumAge: 3000 }
    );
  }

  onMount(async () => {
    L = await import('leaflet');
    map = L.map(mapElement, {
      zoomControl: true,
      attributionControl: true,
      tap: true
    }).setView(initialCenter, 17);

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: 20,
      attribution: '© OpenStreetMap'
    }).addTo(map);

    map.on('click', (event: any) => addPoint(event.latlng.lat, event.latlng.lng));

    redraw();
    if (boundary.length >= 3) {
      map.fitBounds(boundary, { padding: [28, 28], maxZoom: 19 });
    }

    setTimeout(() => map.invalidateSize(), 100);

    return () => {
      if (map) map.remove();
    };
  });

  $: areaHa = polygonAreaHa(boundary);
</script>

<svelte:head>
  <link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css" />
</svelte:head>

<div class="boundary-editor">
  <div class="boundary-instruction">
    <div class="boundary-instruction-icon">👆</div>
    <div>
      <strong>{language === 'bn' ? 'ম্যাপে জমির চারপাশে চাপুন' : 'Tap around the edge of your field'}</strong>
      <span>{language === 'bn'
        ? 'প্রতিটি কোণা বা বাঁক একবার করে চাপুন। অন্তত ৩টি পয়েন্ট দিন।'
        : 'Tap each corner or bend once. Add at least 3 points.'}</span>
    </div>
  </div>

  <div class="boundary-map" bind:this={mapElement}></div>

  <div class="boundary-tools">
    <button type="button" class="boundary-tool gps" on:click={useGps}>
      <span>{gpsState === 'loading' ? '⌛' : gpsState === 'ready' ? '✅' : '📍'}</span>
      {language === 'bn' ? 'আমার জায়গায় যান' : 'Go to my location'}
    </button>
    <button type="button" class="boundary-tool" on:click={undoPoint} disabled={!boundary.length}>
      ↶ {language === 'bn' ? 'শেষ পয়েন্ট মুছুন' : 'Undo point'}
    </button>
    <button type="button" class="boundary-tool danger" on:click={clearBoundary} disabled={!boundary.length}>
      ✕ {language === 'bn' ? 'সব মুছুন' : 'Clear'}
    </button>
  </div>

  <div class="boundary-result" class:ready={boundary.length >= 3}>
    <div>
      <span>{language === 'bn' ? 'পয়েন্ট' : 'Points'}</span>
      <strong>{boundary.length}</strong>
    </div>
    <div>
      <span>{language === 'bn' ? 'ম্যাপ থেকে আয়তন' : 'Mapped area'}</span>
      <strong>{areaHa > 0 ? areaHa.toFixed(2) + ' ha' : '—'}</strong>
    </div>
    <div>
      <span>{language === 'bn' ? 'সীমানা' : 'Boundary'}</span>
      <strong>{boundary.length >= 3 ? (language === 'bn' ? '✓ প্রস্তুত' : '✓ Ready') : (language === 'bn' ? 'আরও পয়েন্ট দিন' : 'Add more points')}</strong>
    </div>
  </div>

  {#if gpsState === 'error'}
    <p class="form-error">{language === 'bn'
      ? 'GPS পাওয়া যায়নি। ম্যাপ সরিয়ে আপনার জমিতে গিয়ে সরাসরি পয়েন্ট দিতে পারেন।'
      : 'GPS was unavailable. Move the map to your field and tap the boundary manually.'}</p>
  {/if}
</div>
