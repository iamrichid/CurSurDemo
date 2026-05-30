import { ref, onMounted, onUnmounted } from 'vue'
import { useMouse, useWindowScroll } from '@vueuse/core'

export function useParallax(factor = 0.03) {
  const el = ref(null)
  const { x, y } = useMouse()
  const { y: scrollY } = useWindowScroll()
  let raf

  function update() {
    if (!el.value) return
    const cx = (x.value / window.innerWidth - 0.5) * factor * 100
    const cy = (y.value / window.innerHeight - 0.5) * factor * 100
    const sy = scrollY.value * factor * 0.3
    el.value.style.transform = `translate(${cx}px, ${cy - sy}px)`
    raf = requestAnimationFrame(update)
  }

  onMounted(() => {
    raf = requestAnimationFrame(update)
  })

  onUnmounted(() => {
    cancelAnimationFrame(raf)
  })

  return { el }
}
