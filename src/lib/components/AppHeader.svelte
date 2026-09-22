<script lang="ts">
  import { onMount } from 'svelte';
  import { language, session, setLanguage, loadAppState } from '$lib/stores/app';
  import { tr } from '$lib/i18n';

  onMount(loadAppState);
  $: dashboardHref = $session?.role === 'specialist' ? '/specialist' : '/farmer';
</script>

<header class="app-header">
  <a class="app-brand" href="/">
    <span class="brand-icon">A</span>
    <span><strong>AgriFusion</strong><small>Bangladesh</small></span>
  </a>

  <nav class="desktop-nav">
    <a href={dashboardHref}>{tr($language, 'dashboard')}</a>
    <a href="/map">{tr($language, 'map')}</a>
    <a href="/account">{tr($language, 'account')}</a>
  </nav>

  <div class="header-actions">
    <div class="language-switch" aria-label={tr($language,'language')}>
      <button class:active={$language === 'bn'} on:click={() => setLanguage('bn')}>বাংলা</button>
      <button class:active={$language === 'en'} on:click={() => setLanguage('en')}>EN</button>
    </div>
    {#if $session}
      <a class="profile-chip" href="/account">
        <span>{$session.name.slice(0,1)}</span>
        <em>{$session.name}</em>
      </a>
    {:else}
      <a class="button small primary" href="/login">{tr($language,'login')}</a>
    {/if}
  </div>
</header>

<nav class="mobile-nav">
  <a href={dashboardHref}><span>⌂</span>{tr($language,'home')}</a>
  <a href="/map"><span>⌖</span>{tr($language,'map')}</a>
  <a href="/account"><span>◎</span>{tr($language,'account')}</a>
</nav>
