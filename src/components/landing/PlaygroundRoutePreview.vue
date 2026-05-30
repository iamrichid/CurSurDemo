<script setup>
import { computed } from 'vue'

const props = defineProps({
  loading: { type: Boolean, default: false },
  active: { type: Boolean, default: false },
  progress: { type: Number, default: 0 },
})

const dotStyle = computed(() => {
  if (!props.active && !props.loading) return { left: '72%', top: '28%' }
  const t = props.loading ? props.progress : 1
  // Approximate position along quadratic path East Legon → Circle
  const x = 72 + (28 - 72) * t
  const y = 28 + (68 - 28) * t + Math.sin(t * Math.PI) * 0
  return { left: `${x}%`, top: `${y}%` }
})
</script>

<template>
  <div class="relative aspect-square w-full max-w-[200px] overflow-hidden rounded-xl border border-border bg-surface-muted">
    <svg class="absolute inset-0 h-full w-full opacity-20" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <pattern id="pg-grid" width="16" height="16" patternUnits="userSpaceOnUse">
          <path d="M 16 0 L 0 0 0 16" fill="none" stroke="currentColor" stroke-width="0.4" class="text-border-strong" />
        </pattern>
      </defs>
      <rect width="100%" height="100%" fill="url(#pg-grid)" />
    </svg>

    <svg class="absolute inset-0 h-full w-full" viewBox="0 0 100 100" preserveAspectRatio="none">
      <path
        d="M 72 28 Q 50 38 28 68"
        fill="none"
        stroke="var(--color-accent)"
        stroke-width="2"
        stroke-linecap="round"
        pathLength="100"
        :stroke-dasharray="loading || active ? '100' : '100'"
        :stroke-dashoffset="loading ? 100 - progress * 100 : active ? 0 : 100"
        class="transition-all duration-300"
        style="transition: stroke-dashoffset 0.15s ease"
      />
    </svg>

    <div
      class="absolute -translate-x-1/2 -translate-y-1/2 transition-all duration-150"
      :style="dotStyle"
    >
      <div
        class="h-2.5 w-2.5 rounded-full border-2 border-surface-card bg-accent shadow-lg shadow-accent/40"
        :class="{ 'animate-pulse': loading }"
      />
    </div>

    <div class="absolute left-[72%] top-[28%] -translate-x-1/2 -translate-y-full">
      <span class="rounded bg-accent px-1 py-0.5 text-[8px] font-semibold text-accent-foreground">EL</span>
    </div>
    <div class="absolute left-[28%] top-[68%] -translate-x-1/2 -translate-y-full">
      <span class="rounded border border-border bg-surface-card px-1 py-0.5 text-[8px] font-medium text-text-muted">CR</span>
    </div>

    <div v-if="active && !loading" class="absolute inset-x-0 bottom-0 bg-accent/10 px-2 py-1 text-center">
      <span class="font-mono text-[9px] font-semibold text-accent">Route matched</span>
    </div>
  </div>
</template>
