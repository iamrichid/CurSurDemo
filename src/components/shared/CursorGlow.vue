<script setup>
import { ref, onMounted, onUnmounted } from 'vue'
import { useMouse } from '@vueuse/core'

const glow = ref(null)
const enabled = ref(true)
const { x, y } = useMouse()

function onMove() {
  if (!glow.value) return
  glow.value.style.left = `${x.value}px`
  glow.value.style.top = `${y.value}px`
}

let raf
function tick() {
  onMove()
  raf = requestAnimationFrame(tick)
}

onMounted(() => {
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
  enabled.value = !reducedMotion
  if (enabled.value) tick()
})

onUnmounted(() => {
  cancelAnimationFrame(raf)
})
</script>

<template>
  <div
    v-if="enabled"
    ref="glow"
    class="pointer-events-none fixed z-0 h-96 w-96 -translate-x-1/2 -translate-y-1/2 rounded-full opacity-30 blur-3xl transition-opacity duration-300"
    style="background: radial-gradient(circle, var(--color-accent-glow) 0%, transparent 70%)"
  />
</template>
