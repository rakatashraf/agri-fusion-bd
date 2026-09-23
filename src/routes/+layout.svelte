<script lang="ts">
  import '../styles.css';
  import '../field-management.css';
  import '../agrovia-theme.css';
  import '../verda-theme.css';
  import '../responsive-final.css';
  import '../photo-boundary.css';
  import '../photo-card-extra.css';
  import '../full-bleed-cards.css';
  import '../logo.css';
  import AppHeader from '$lib/components/AppHeader.svelte';
  import LoadingScreen from '$lib/components/LoadingScreen.svelte';
  const { children } = $props();
</script>

<LoadingScreen />
<AppHeader />
{@render children()}
