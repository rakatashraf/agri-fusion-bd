<script lang="ts">
  import { goto } from '$app/navigation';
  import { areas } from '$lib/data';
  import { language, session, setSession } from '$lib/stores/app';
  import { tr, localText } from '$lib/i18n';

  $: area = areas.find((item) => item.id === $session?.areaId);

  function logout() {
    setSession(null);
    goto('/');
  }
</script>

<svelte:head><title>{tr($language,'account')} | AgriFusion BD</title></svelte:head>

<main class="page narrow">
  {#if $session}
    <section class="profile-card">
      <div class="profile-avatar">{$session.name.slice(0,1)}</div>
      <div><span class="eyebrow">{tr($language,'signedInAs')}</span><h1>{$session.name}</h1><p>{$session.identifier}</p></div>
    </section>

    <section class="info-list">
      <div><span>{tr($language,'role')}</span><strong>{$session.role === 'specialist' ? tr($language,'specialist') : tr($language,'farmer')}</strong></div>
      <div><span>{tr($language,'area')}</span><strong>{area ? localText(area.name,$language) : '-'}</strong></div>
      <div><span>{tr($language,'language')}</span><strong>{$language === 'bn' ? 'বাংলা' : 'English'}</strong></div>
    </section>

    <button class="button danger full" on:click={logout}>{tr($language,'logout')}</button>
  {:else}
    <section class="empty-state"><h1>{tr($language,'account')}</h1><p>{tr($language,'privacy')}</p><a class="button primary" href="/login">{tr($language,'login')}</a></section>
  {/if}
</main>
