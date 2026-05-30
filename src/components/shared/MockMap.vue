<script setup>
import { ref, onMounted } from 'vue'

const activePin = ref(null)

const pins = [
  { id: 'origin', label: 'East Legon', x: 72, y: 28, delay: 0 },
  { id: 'dest', label: 'Circle', x: 28, y: 68, delay: 200 },
]

onMounted(() => {
  setTimeout(() => { activePin.value = 'origin' }, 600)
  setTimeout(() => { activePin.value = 'dest' }, 1200)
})
</script>

<template>
  <div
    class="relative aspect-[4/3] w-full overflow-hidden rounded-2xl border border-border bg-surface-card ft-card-glow"
    v-motion
    :initial="{ opacity: 0, scale: 0.96 }"
    :enter="{ opacity: 1, scale: 1, transition: { delay: 300, duration: 700 } }"
  >
    <div class="absolute inset-0 opacity-30">
      <svg class="h-full w-full" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <pattern id="grid" width="24" height="24" patternUnits="userSpaceOnUse">
            <path d="M 24 0 L 0 0 0 24" fill="none" stroke="currentColor" stroke-width="0.5" class="text-border-strong" />
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#grid)" />
      </svg>
    </div>

    <div class="absolute inset-0 shimmer opacity-20" />

    <svg class="absolute inset-0 h-full w-full" viewBox="0 0 100 100" preserveAspectRatio="none">
      <path
        d="M 72 28 Q 55 35 45 50 T 28 68"
        fill="none"
        stroke="var(--color-accent)"
        stroke-width="1.5"
        stroke-dasharray="200"
        stroke-dashoffset="200"
        stroke-linecap="round"
        style="animation: draw-line 1.5s ease forwards 0.8s"
      />
    </svg>

    <div
      v-for="pin in pins"
      :key="pin.id"
      class="absolute -translate-x-1/2 -translate-y-full transition-all duration-500"
      :style="{ left: `${pin.x}%`, top: `${pin.y}%` }"
      v-motion
      :initial="{ opacity: 0, y: 10 }"
      :enter="{ opacity: 1, y: 0, transition: { delay: 800 + pin.delay, duration: 400 } }"
    >
      <div
        class="relative flex flex-col items-center"
        :class="activePin === pin.id ? 'scale-110' : 'scale-100'"
        style="transition: transform 0.3s ease"
      >
        <div
          class="mb-1 whitespace-nowrap rounded-md px-2 py-0.5 text-[10px] font-medium shadow-sm"
          :class="pin.id === 'origin' ? 'bg-accent text-accent-foreground' : 'bg-surface-card text-text border border-border'"
        >
          {{ pin.label }}
        </div>
        <div class="relative">
          <div
            v-if="activePin === pin.id"
            class="absolute -inset-2 rounded-full bg-accent/30"
            style="animation: pulse-ring 2s ease infinite"
          />
          <div class="relative h-3 w-3 rounded-full border-2 border-white bg-accent shadow-lg" />
        </div>
      </div>
    </div>

    <div class="absolute bottom-3 left-3 right-3 flex items-center justify-between rounded-lg border border-border bg-surface/90 px-3 py-2 backdrop-blur-sm">
      <span class="text-[10px] font-medium text-text-muted">Accra Metro</span>
      <span class="font-mono text-[10px] text-accent">Live Route Preview</span>
    </div>
  </div>
</template>
