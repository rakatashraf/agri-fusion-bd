<script lang="ts">
  import { onMount } from 'svelte';
  import { language, session, setLanguage, loadAppState } from '$lib/stores/app';
  import { tr } from '$lib/i18n';
  import { appPath } from '$lib/nav';

  onMount(loadAppState);
  $: dashboardHref = appPath($session?.role === 'specialist' ? '/specialist' : '/farmer');
</script>

<header class="app-header">
  <a class="app-brand" href={appPath('/')} aria-label="AgriFusion Bangladesh">
    <span class="brand-mark" aria-hidden="true">
      <svg viewBox="0 0 64 64" role="img">
        <circle cx="32" cy="32" r="30" class="brand-mark-bg" />
        <path class="brand-leaf brand-leaf-large"
          d="M29 48c2-15 11-28 28-34 0 17-8 31-24 38 5-11 11-20 18-27-10 5-17 13-22 23Z" />
        <path class="brand-leaf brand-leaf-small"
          d="M25 42C15 37 10 28 10 18c11 3 18 11 20 23-4-7-8-12-13-15 4 5 7 10 8 16Z" />
      </svg>
    </span>
    <span class="brand-wordmark">
      <strong>AgriFusion</strong>
      <small>BANGLADESH</small>
    </span>
  </a>

  <nav class="desktop-nav">
    <a href={appPath('/')}><span>🏠</span><span>{tr($language,'home')}</span></a>
    <a href={dashboardHref}><span>🌾</span><span>{tr($language,'dashboard')}</span></a>
    <a href={appPath('/map')}><span>📍</span><span>{tr($language,'map')}</span></a>
    <a href={appPath('/account')}><span>👤</span><span>{tr($language,'account')}</span></a>
  </nav>

  <div class="header-actions">
    <div class="language-switch" aria-label={tr($language,'language')}>
      <button class:active={$language === 'bn'} on:click={() => setLanguage('bn')}>বাংলা</button>
      <button class:active={$language === 'en'} on:click={() => setLanguage('en')}>EN</button>
    </div>
    {#if $session}
      <a class="profile-chip" href={appPath('/account')}>
        <span>{$session.name.slice(0,1)}</span>
        <em>{$session.name}</em>
      </a>
    {:else}
      <a class="button small primary" href={appPath('/login')}>{tr($language,'login')}</a>
    {/if}
  </div>
</header>

<nav class="mobile-nav">
  <a href={dashboardHref}><span>🌾</span>{tr($language,'home')}</a>
  <a href={appPath('/map')}><span>📍</span>{tr($language,'map')}</a>
  <a href={appPath('/account')}><span>👤</span>{tr($language,'account')}</a>
</nav>
