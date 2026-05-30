<script setup>
import { ref, onMounted, onUnmounted } from 'vue'
import { useMouse } from '@vueuse/core'

const glow = ref(null)
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
  tick()
})

onUnmounted(() => {
  cancelAnimationFrame(raf)
})
</script>

<template>
  <div
    ref="glow"
    class="cursor-glow pointer-events-none fixed z-[9998] h-64 w-64 -translate-x-1/2 -translate-y-1/2 rounded-full opacity-40 blur-3xl transition-opacity duration-300"
    aria-hidden="true"
  />
</template>

<style scoped>
.cursor-glow {
  background: radial-gradient(circle, var(--color-accent-glow) 0%, transparent 70%);
}
</style>
