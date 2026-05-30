<script setup>
defineProps({
  code: { type: String, required: true },
  language: { type: String, default: 'javascript' },
  title: { type: String, default: 'example.js' },
})
</script>

<template>
  <div
    class="ft-card-glow overflow-hidden"
    v-motion
    :initial="{ opacity: 0, y: 20 }"
    :enter="{ opacity: 1, y: 0, transition: { delay: 400, duration: 600 } }"
  >
    <div class="flex items-center gap-2 border-b border-border px-4 py-2.5">
      <span class="h-2.5 w-2.5 rounded-full bg-danger/80" />
      <span class="h-2.5 w-2.5 rounded-full bg-warning/80" />
      <span class="h-2.5 w-2.5 rounded-full bg-success/80" />
      <span class="ml-2 font-mono text-xs text-text-subtle">{{ title }}</span>
    </div>
    <pre class="overflow-x-auto p-4 font-mono text-xs leading-relaxed sm:text-sm"><code>{{ code }}</code></pre>
  </div>
</template>

<style scoped>
pre {
  color: var(--color-text-muted);
}
</style>
