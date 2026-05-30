<script setup>
import { ref, watch, onMounted } from 'vue'

const props = defineProps({
  data: { type: Array, required: true },
  height: { type: Number, default: 160 },
})

const pathLength = ref(0)
const animated = ref(false)

const maxVal = Math.max(...props.data.map((d) => d.value))
const points = props.data.map((d, i) => ({
  x: (i / (props.data.length - 1)) * 100,
  y: 100 - (d.value / maxVal) * 80 - 10,
}))

const linePath = points.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`).join(' ')
const areaPath = `${linePath} L 100 100 L 0 100 Z`

onMounted(() => {
  setTimeout(() => { animated.value = true }, 300)
})

watch(() => props.data, () => {
  animated.value = false
  setTimeout(() => { animated.value = true }, 100)
})
</script>

<template>
  <div class="relative w-full" :style="{ height: `${height}px` }">
    <svg class="h-full w-full" viewBox="0 0 100 100" preserveAspectRatio="none">
      <defs>
        <linearGradient id="chartGrad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stop-color="var(--color-accent)" stop-opacity="0.3" />
          <stop offset="100%" stop-color="var(--color-accent)" stop-opacity="0" />
        </linearGradient>
      </defs>
      <path
        :d="areaPath"
        fill="url(#chartGrad)"
        :style="{
          opacity: animated ? 1 : 0,
          transition: 'opacity 0.6s ease',
        }"
      />
      <path
        :d="linePath"
        fill="none"
        stroke="var(--color-accent)"
        stroke-width="1.5"
        stroke-linecap="round"
        stroke-linejoin="round"
        pathLength="100"
        :style="{
          strokeDasharray: '100',
          strokeDashoffset: animated ? 0 : 100,
          transition: 'stroke-dashoffset 1.2s cubic-bezier(0.16, 1, 0.3, 1)',
        }"
      />
      <circle
        v-for="(p, i) in points"
        :key="i"
        :cx="p.x"
        :cy="p.y"
        r="1.5"
        fill="var(--color-accent)"
        :style="{
          opacity: animated ? 1 : 0,
          transition: `opacity 0.3s ease ${0.8 + i * 0.05}s`,
        }"
      />
    </svg>
    <div class="absolute bottom-0 left-0 right-0 flex justify-between px-1">
      <span
        v-for="(d, i) in data"
        :key="i"
        class="text-[10px] text-text-subtle"
      >
        {{ d.label }}
      </span>
    </div>
  </div>
</template>
