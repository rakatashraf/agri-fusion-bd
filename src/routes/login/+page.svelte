<script lang="ts">
  import { goto } from '$app/navigation';
  import VoiceGuide from '$lib/components/VoiceGuide.svelte';
  import { areas } from '$lib/data';
  import { language, setSession } from '$lib/stores/app';
  import { tr, localText } from '$lib/i18n';
  import { loginAccount, registerAccount, demoCredentials } from '$lib/auth';
  import { appPath } from '$lib/nav';
  import { farmPhotos } from '$lib/images';

  let mode: 'login' | 'register' = 'login';
  let name = '';
  let identifier = '';
  let password = '';
  let role: 'farmer' | 'specialist' = 'farmer';
  let areaId = 'paba';
  let error = '';

  $: loginVoice = $language === 'bn'
    ? 'মোবাইল নম্বর বা ইমেইল লিখুন। তারপর চার সংখ্যার পাসকোড লিখে লগইন চাপুন।'
    : 'Enter your mobile number or email, then enter your passcode and press login.';

  function submit() {
    error = '';
    if (mode === 'login') {
      const user = loginAccount(identifier, password);
      if (!user) {
        error = $language === 'bn' ? 'মোবাইল/ইমেইল বা পাসকোড সঠিক নয়।' : 'Mobile/email or passcode is incorrect.';
        return;
      }
      setSession(user);
      goto(appPath(user.role === 'specialist' ? '/specialist' : '/farmer'));
      return;
    }

    if (!name || !identifier || !password) {
      error = $language === 'bn' ? 'সব তথ্য পূরণ করুন।' : 'Please complete all fields.';
      return;
    }

    const user = registerAccount({ name, identifier, password, role, areaId });
    setSession(user);
    goto(appPath(role === 'specialist' ? '/specialist' : '/farmer'));
  }

  function useDemo(item: any) {
    identifier = item.identifier;
    password = item.password;
    mode = 'login';
    submit();
  }
</script>

<svelte:head><title>{tr($language,'login')} | AgriFusion BD</title></svelte:head>

<main class="page narrow">
  <section class="auth-card photo-auth-card">
    <img class="auth-card-photo" src={role === 'specialist' ? farmPhotos.specialist : farmPhotos.farmer} alt="" loading="lazy" />

    <div class="auth-intro">
      <span class="eyebrow">AgriFusion BD</span>
      <h1>{$language === 'bn' ? 'সহজে ঢুকুন' : 'Simple sign in'}</h1>
      <p>{$language === 'bn' ? 'আপনার নিজের জমির তথ্য দেখতে অ্যাকাউন্ট ব্যবহার করুন।' : 'Use your account to see your own farm information.'}</p>
      <VoiceGuide text={loginVoice} />
    </div>

    <div class="tab-switch">
      <button class:active={mode === 'login'} on:click={() => mode='login'}>🔑 {tr($language,'login')}</button>
      <button class:active={mode === 'register'} on:click={() => mode='register'}>＋ {tr($language,'createAccount')}</button>
    </div>

    <form on:submit|preventDefault={submit} class="form-stack">
      {#if mode === 'register'}
        <label>👤 {tr($language,'name')}<input bind:value={name} autocomplete="name" /></label>

        <div>
          <span class="eyebrow">{$language === 'bn' ? 'আপনি কে?' : 'Who are you?'}</span>
          <div class="role-choice-row">
            <button type="button" class="role-choice photo-role-choice" class:active={role==='farmer'} on:click={() => role='farmer'}>
              <img src={farmPhotos.farmer} alt="" loading="lazy" />
              <span>👨‍🌾</span>{tr($language,'farmer')}
            </button>
            <button type="button" class="role-choice photo-role-choice" class:active={role==='specialist'} on:click={() => role='specialist'}>
              <img src={farmPhotos.specialist} alt="" loading="lazy" />
              <span>🧑‍🔬</span>{tr($language,'specialist')}
            </button>
          </div>
        </div>

        <label>🗺️ {tr($language,'area')}
          <select bind:value={areaId}>{#each areas as area}<option value={area.id}>{localText(area.name,$language)}</option>{/each}</select>
        </label>
      {/if}

      <label>📱 {tr($language,'identifier')}<input bind:value={identifier} inputmode="tel" autocomplete="username" /></label>
      <label>🔒 {tr($language,'password')}<input type="password" bind:value={password} inputmode="numeric" autocomplete="current-password" /></label>
      {#if error}<p class="form-error">⚠️ {error}</p>{/if}
      <button class="button primary full" type="submit">{mode === 'login' ? '🔑 ' + tr($language,'login') : '✅ ' + tr($language,'createAccount')}</button>
    </form>

    <div class="demo-box photo-demo-box">
      <img src={farmPhotos.aerial} alt="" loading="lazy" />
      <strong>{$language === 'bn' ? 'এক চাপেই ডেমো দেখুন' : 'Open a demo in one tap'}</strong>
      <div class="demo-actions">
        <button class="button secondary" on:click={() => useDemo(demoCredentials[0])}>👨‍🌾 {$language === 'bn' ? 'কৃষক ডেমো' : 'Farmer demo'}</button>
        <button class="button secondary" on:click={() => useDemo(demoCredentials[1])}>🧑‍🔬 {$language === 'bn' ? 'বিশেষজ্ঞ ডেমো' : 'Specialist demo'}</button>
      </div>
    </div>
  </section>
</main>
