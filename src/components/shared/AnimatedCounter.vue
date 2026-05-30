<script setup>
import { ref, watch, onMounted } from 'vue'

const props = defineProps({
  value: { type: Number, required: true },
  duration: { type: Number, default: 1200 },
  decimals: { type: Number, default: 0 },
  prefix: { type: String, default: '' },
  suffix: { type: String, default: '' },
})

const display = ref(0)
let raf = null

function animateTo(target) {
  const from = display.value
  const start = performance.now()
  cancelAnimationFrame(raf)

  const tick = (now) => {
    const progress = Math.min((now - start) / props.duration, 1)
    const eased = 1 - Math.pow(1 - progress, 3)
    display.value = from + (target - from) * eased
    if (progress < 1) raf = requestAnimationFrame(tick)
  }
  raf = requestAnimationFrame(tick)
}

onMounted(() => animateTo(props.value))
watch(() => props.value, (v) => animateTo(v))

const formatted = () => {
  const val = props.decimals > 0 ? display.value.toFixed(props.decimals) : Math.round(display.value).toLocaleString()
  return `${props.prefix}${val}${props.suffix}`
}
</script>

<template>
  <span>{{ formatted() }}</span>
</template>
