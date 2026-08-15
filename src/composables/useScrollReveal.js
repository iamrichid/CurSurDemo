import { ref, onMounted, onUnmounted } from 'vue'
import { isCrawlerMode } from './useCrawlerMode.js'

function prefersReducedMotion() {
  return (
    typeof window !== 'undefined' &&
    window.matchMedia?.('(prefers-reduced-motion: reduce)').matches
  )
}

function shouldRevealImmediately() {
  return (
    isCrawlerMode() ||
    prefersReducedMotion() ||
    typeof IntersectionObserver === 'undefined'
  )
}

export function useScrollReveal(options = {}) {
  const el = ref(null)
  const isVisible = ref(shouldRevealImmediately())
  const { threshold = 0.15, rootMargin = '0px 0px -40px 0px' } = options

  let observer = null
  let fallbackTimer = null

  onMounted(() => {
    if (isVisible.value || !el.value) return

    observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          isVisible.value = true
          observer?.disconnect()
          if (fallbackTimer) clearTimeout(fallbackTimer)
        }
      },
      { threshold, rootMargin }
    )
    observer.observe(el.value)

    // Crawlers and headless browsers often never scroll; reveal anyway.
    fallbackTimer = setTimeout(() => {
      isVisible.value = true
      observer?.disconnect()
    }, 1200)
  })

  onUnmounted(() => {
    observer?.disconnect()
    if (fallbackTimer) clearTimeout(fallbackTimer)
  })

  return { el, isVisible }
}

export function useAnimatedCounter(target, duration = 1200) {
  const current = ref(0)
  let raf = null

  function animate(from, to) {
    const start = performance.now()
    cancelAnimationFrame(raf)

    const tick = (now) => {
      const progress = Math.min((now - start) / duration, 1)
      const eased = 1 - Math.pow(1 - progress, 3)
      current.value = from + (to - from) * eased
      if (progress < 1) raf = requestAnimationFrame(tick)
    }
    raf = requestAnimationFrame(tick)
  }

  onUnmounted(() => cancelAnimationFrame(raf))

  return { current, animate }
}
