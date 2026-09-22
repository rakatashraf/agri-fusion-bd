<script lang="ts">
  import '../styles.css';
  import '../field-management.css';
  import '../agrovia-theme.css';
  import '../verda-theme.css';
  import AppHeader from '$lib/components/AppHeader.svelte';
  const { children } = $props();
</script>

<AppHeader />
{@render children()}
