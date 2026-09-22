<script lang="ts">
  import '../styles.css';
  import '../field-management.css';
  import '../agrovia-theme.css';
  import '../verda-theme.css';
  import '../responsive-final.css';
  import '../photo-boundary.css';
  import '../photo-card-extra.css';
  import AppHeader from '$lib/components/AppHeader.svelte';
  const { children } = $props();
</script>

<AppHeader />
{@render children()}
