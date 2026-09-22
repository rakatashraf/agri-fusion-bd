<script lang="ts">
  import '../styles.css';
  import '../field-management.css';
  import AppHeader from '$lib/components/AppHeader.svelte';
  const { children } = $props();
</script>

<AppHeader />
{@render children()}
