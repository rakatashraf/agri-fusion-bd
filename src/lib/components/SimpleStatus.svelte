<script lang="ts">
  export let icon = '🌱';
  export let title = '';
  export let text = '';
  export let tone: 'good' | 'warn' | 'danger' | 'info' = 'good';
</script>

<article class="simple-status {tone}">
  <div class="simple-status-icon">{icon}</div>
  <div class="simple-status-copy">
    <strong>{title}</strong>
    <span>{text}</span>
  </div>
  <slot />
</article>
