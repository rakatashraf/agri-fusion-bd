<script lang="ts">
  import { goto } from '$app/navigation';
  import { areas } from '$lib/data';
  import { language, session, setSession } from '$lib/stores/app';
  import { tr, localText } from '$lib/i18n';
  import { appPath } from '$lib/nav';
  import { farmPhotos } from '$lib/images';

  $: area = areas.find((item) => item.id === $session?.areaId);
  $: profilePhoto = $session?.role === 'specialist' ? farmPhotos.specialist : farmPhotos.farmer;

  function logout() {
    setSession(null);
    goto(appPath('/'));
  }
</script>

<svelte:head><title>{tr($language,'account')} | AgriFusion BD</title></svelte:head>

<main class="page narrow">
  {#if $session}
    <section class="profile-card photo-profile-card">
      <img src={profilePhoto} alt="" loading="lazy" />
      <div class="profile-avatar">{$session.name.slice(0,1)}</div>
      <div><span class="eyebrow">{tr($language,'signedInAs')}</span><h1>{$session.name}</h1><p>{$session.identifier}</p></div>
    </section>

    <section class="info-list photo-info-list">
      <div><img src={profilePhoto} alt="" loading="lazy" /><span>{tr($language,'role')}</span><strong>{$session.role === 'specialist' ? tr($language,'specialist') : tr($language,'farmer')}</strong></div>
      <div><img src={farmPhotos.aerial} alt="" loading="lazy" /><span>{tr($language,'area')}</span><strong>{area ? localText(area.name,$language) : '-'}</strong></div>
      <div><img src={farmPhotos.greenField} alt="" loading="lazy" /><span>{tr($language,'language')}</span><strong>{$language === 'bn' ? 'বাংলা' : 'English'}</strong></div>
    </section>

    <button class="button danger full" on:click={logout}>{tr($language,'logout')}</button>
  {:else}
    <section class="empty-state photo-empty-state"><img src={farmPhotos.farmer} alt="" loading="lazy" /><div><h1>{tr($language,'account')}</h1><p>{tr($language,'privacy')}</p><a class="button primary" href={appPath('/login')}>{tr($language,'login')}</a></div></section>
  {/if}
</main>
