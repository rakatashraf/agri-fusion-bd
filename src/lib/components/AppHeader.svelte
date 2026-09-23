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
    <img
      class="brand-logo"
      src={appPath('/agrifusion-logo-visible.webp?v=15')}
      alt="AgriFusion Bangladesh"
      width="260"
      height="64"
    />
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
