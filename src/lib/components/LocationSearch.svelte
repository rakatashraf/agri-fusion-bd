<script lang="ts">
  import { createEventDispatcher } from 'svelte';

  export let language: 'bn' | 'en' = 'bn';
  export let compact = false;

  const dispatch = createEventDispatcher();

  let query = '';
  let searching = false;
  let error = '';
  let results: any[] = [];
  let activeController: AbortController | null = null;

  function parseCoordinates(value: string) {
    const match = value.trim().match(/^(-?\d{1,2}(?:\.\d+)?)\s*[, ]\s*(-?\d{1,3}(?:\.\d+)?)$/);
    if (!match) return null;
    const lat = Number(match[1]);
    const lng = Number(match[2]);
    if (!Number.isFinite(lat) || !Number.isFinite(lng) || Math.abs(lat) > 90 || Math.abs(lng) > 180) return null;
    return { lat, lng };
  }

  async function search() {
    const value = query.trim();
    if (value.length < 2) return;

    error = '';
    results = [];

    const coords = parseCoordinates(value);
    if (coords) {
      choose({ lat: coords.lat, lon: coords.lng, display_name: value });
      return;
    }

    activeController?.abort();
    activeController = new AbortController();
    searching = true;

    try {
      const params = new URLSearchParams({
        q: value,
        format: 'jsonv2',
        countrycodes: 'bd',
        limit: '6',
        addressdetails: '1',
        'accept-language': language === 'bn' ? 'bn,en' : 'en,bn'
      });

      const response = await fetch('https://nominatim.openstreetmap.org/search?' + params.toString(), {
        signal: activeController.signal,
        headers: { Accept: 'application/json' }
      });

      if (!response.ok) throw new Error('Search failed');
      results = await response.json();

      if (!results.length) {
        error = language === 'bn'
          ? 'স্থানটি পাওয়া যায়নি। কাছের গ্রাম, বাজার বা উপজেলা লিখে চেষ্টা করুন।'
          : 'Place not found. Try a nearby village, market or upazila.';
      }
    } catch (e: any) {
      if (e?.name !== 'AbortError') {
        error = language === 'bn'
          ? 'লোকেশন সার্চ করা যায়নি। আবার চেষ্টা করুন।'
          : 'Location search failed. Please try again.';
      }
    } finally {
      searching = false;
    }
  }

  function choose(item: any) {
    const lat = Number(item.lat);
    const lng = Number(item.lon ?? item.lng);
    if (!Number.isFinite(lat) || !Number.isFinite(lng)) return;

    query = item.display_name || lat.toFixed(6) + ', ' + lng.toFixed(6);
    results = [];
    error = '';
    dispatch('select', {
      lat,
      lng,
      label: item.display_name || query,
      bbox: item.boundingbox || null
    });
  }

  function clear() {
    query = '';
    results = [];
    error = '';
    dispatch('clear');
  }
</script>

<div class:compact class="location-search">
  <form class="location-search-form" on:submit|preventDefault={search}>
    <span class="search-pin" aria-hidden="true">⌖</span>
    <input
      bind:value={query}
      autocomplete="off"
      inputmode="search"
      placeholder={language === 'bn'
        ? 'গ্রাম, রাস্তা, বাজার, উপজেলা বা GPS লিখুন'
        : 'Village, road, market, upazila or GPS coordinates'}
      aria-label={language === 'bn' ? 'জমির লোকেশন খুঁজুন' : 'Search land location'}
    />
    {#if query}
      <button class="search-clear" type="button" on:click={clear} aria-label="Clear">×</button>
    {/if}
    <button class="search-submit" type="submit" disabled={searching || query.trim().length < 2}>
      {searching ? '…' : (language === 'bn' ? 'খুঁজুন' : 'Search')}
    </button>
  </form>

  {#if results.length}
    <div class="location-results">
      {#each results as item}
        <button type="button" on:click={() => choose(item)}>
          <span>📍</span>
          <span>
            <strong>{item.display_name?.split(',')[0] || (language === 'bn' ? 'লোকেশন' : 'Location')}</strong>
            <small>{item.display_name}</small>
          </span>
        </button>
      {/each}
    </div>
  {/if}

  {#if error}
    <div class="location-search-error">{error}</div>
  {/if}
</div>

<style>
  .location-search {
    position: relative;
    width: min(100%, 720px);
    z-index: 800;
  }

  .location-search.compact {
    width: min(100%, 560px);
  }

  .location-search-form {
    min-height: 50px;
    display: grid;
    grid-template-columns: auto minmax(0,1fr) auto auto;
    align-items: center;
    gap: 7px;
    padding: 5px 6px 5px 12px;
    background: rgba(255,255,255,.98);
    border: 1px solid rgba(16,48,29,.14);
    border-radius: 15px;
    box-shadow: 0 7px 24px rgba(15,48,29,.09);
  }

  .search-pin {
    color: #1d7040;
    font-size: 1.15rem;
    font-weight: 900;
  }

  .location-search input {
    min-width: 0;
    height: 40px;
    padding: 0 4px;
    border: 0;
    box-shadow: none;
    background: transparent;
    font-size: .88rem;
    color: #153522;
  }

  .location-search input:focus {
    border: 0;
    box-shadow: none;
  }

  .search-clear,
  .search-submit {
    border: 0;
    border-radius: 10px;
    font-weight: 850;
  }

  .search-clear {
    width: 34px;
    height: 34px;
    background: #f0f2ed;
    color: #69766d;
    font-size: 1.15rem;
  }

  .search-submit {
    min-height: 40px;
    padding: 0 14px;
    background: #173b25;
    color: #fff;
  }

  .search-submit:disabled {
    opacity: .5;
    cursor: default;
  }

  .location-results {
    position: absolute;
    left: 0;
    right: 0;
    top: calc(100% + 6px);
    max-height: 300px;
    overflow: auto;
    padding: 6px;
    background: #fff;
    border: 1px solid rgba(16,48,29,.12);
    border-radius: 14px;
    box-shadow: 0 18px 45px rgba(15,48,29,.16);
  }

  .location-results button {
    width: 100%;
    display: grid;
    grid-template-columns: auto minmax(0,1fr);
    gap: 9px;
    text-align: left;
    padding: 9px 10px;
    border: 0;
    border-radius: 10px;
    background: transparent;
    color: #173522;
  }

  .location-results button:hover,
  .location-results button:focus-visible {
    background: #eef5eb;
  }

  .location-results button > span:last-child {
    min-width: 0;
    display: grid;
    gap: 2px;
  }

  .location-results strong {
    font-size: .8rem;
  }

  .location-results small {
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
    font-size: .68rem;
    color: #6b766e;
  }

  .location-search-error {
    margin-top: 6px;
    padding: 7px 9px;
    border-radius: 9px;
    background: #fff1e7;
    color: #8f4d24;
    font-size: .72rem;
  }

  @media(max-width:560px) {
    .location-search-form {
      grid-template-columns: auto minmax(0,1fr) auto;
      min-height: 48px;
    }

    .search-submit {
      grid-column: 1 / -1;
      width: 100%;
      min-height: 38px;
    }
  }
</style>
