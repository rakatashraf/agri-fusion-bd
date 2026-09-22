<script lang="ts">
  import { goto } from '$app/navigation';
  import { areas } from '$lib/data';
  import { language, setSession } from '$lib/stores/app';
  import { tr, localText } from '$lib/i18n';
  import { loginAccount, registerAccount, demoCredentials } from '$lib/auth';
  import { appPath } from '$lib/nav';

  let mode: 'login' | 'register' = 'login';
  let name = '';
  let identifier = '';
  let password = '';
  let role: 'farmer' | 'specialist' = 'farmer';
  let areaId = 'paba';
  let error = '';

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
  <section class="auth-card">
    <div class="auth-intro">
      <span class="eyebrow">AgriFusion BD</span>
      <h1>{$language === 'bn' ? 'আপনার জমি, আপনার তথ্য' : 'Your fields, your insights'}</h1>
      <p>{tr($language,'privacy')}</p>
    </div>

    <div class="tab-switch">
      <button class:active={mode === 'login'} on:click={() => mode='login'}>{tr($language,'login')}</button>
      <button class:active={mode === 'register'} on:click={() => mode='register'}>{tr($language,'createAccount')}</button>
    </div>

    <form on:submit|preventDefault={submit} class="form-stack">
      {#if mode === 'register'}
        <label>{tr($language,'name')}<input bind:value={name} autocomplete="name" /></label>
        <label>{tr($language,'role')}
          <select bind:value={role}>
            <option value="farmer">{tr($language,'farmer')}</option>
            <option value="specialist">{tr($language,'specialist')}</option>
          </select>
        </label>
        <label>{tr($language,'area')}
          <select bind:value={areaId}>{#each areas as area}<option value={area.id}>{localText(area.name,$language)}</option>{/each}</select>
        </label>
      {/if}
      <label>{tr($language,'identifier')}<input bind:value={identifier} autocomplete="username" /></label>
      <label>{tr($language,'password')}<input type="password" bind:value={password} autocomplete="current-password" /></label>
      {#if error}<p class="form-error">{error}</p>{/if}
      <button class="button primary full" type="submit">{mode === 'login' ? tr($language,'login') : tr($language,'createAccount')}</button>
    </form>

    <div class="demo-box">
      <strong>{tr($language,'demoAccess')}</strong>
      <div class="demo-actions">
        {#each demoCredentials as item}
          <button class="button secondary small" on:click={() => useDemo(item)}>{item.label}</button>
        {/each}
      </div>
      <small>{$language === 'bn' ? 'ডেমো পাসকোড: 1234' : 'Demo passcode: 1234'}</small>
    </div>
  </section>
</main>
