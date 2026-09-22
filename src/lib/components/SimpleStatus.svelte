<script lang="ts">
  export let icon = '🌱';
  export let title = '';
  export let text = '';
  export let image = '';
  export let tone: 'good' | 'warn' | 'danger' | 'info' = 'good';
</script>

<article class="simple-status {tone}">
  {#if image}<img class="simple-status-photo" src={image} alt="" loading="lazy" />{/if}
  <div class="simple-status-icon">{icon}</div>
  <div class="simple-status-copy">
    <strong>{title}</strong>
    <span>{text}</span>
  </div>
  <slot />
</article>
