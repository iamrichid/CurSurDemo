<script setup>
import { defineAsyncComponent } from 'vue'
import { ref } from 'vue'
import AnimatedCounter from '../shared/AnimatedCounter.vue'
import { useScrollReveal } from '../../composables/useScrollReveal'
import { brand } from '../../data/brand.js'

const ThreeMetricsScene = defineAsyncComponent(() => import('../shared/ThreeMetricsScene.vue'))

const { el: sectionEl, isVisible } = useScrollReveal()
const paused = ref(false)

const metrics = [
  { label: 'API Calls / Month', value: 2.4, suffix: 'M+', isDecimal: true },
  { label: 'Logistics Partners', value: 48, suffix: '+' },
  { label: 'Routes Quoted Daily', value: 18500, suffix: '+' },
  { label: 'Avg. Quote Time', value: 142, suffix: 'ms' },
]

const sponsors = [
  { name: brand.nightMarket.name, abbr: 'NM', color: '#141414', metric: 'Origin platform', role: `${brand.org} · ${brand.dept}`, url: brand.nightMarket.url },
  { name: 'Bolt Food', abbr: 'BF', color: '#34d399', metric: '12k quotes/day' },
  { name: 'Jumia Ghana', abbr: 'JG', color: '#f97316', metric: '8.4M km routed' },
  { name: 'Glovo', abbr: 'GL', color: '#facc15', metric: '99.2% uptime' },
  { name: 'SwiftDispatch', abbr: 'SD', color: '#60a5fa', metric: '340 fleets' },
  { name: 'Accra Couriers', abbr: 'AC', color: '#a78bfa', metric: 'GH₵ 2.1M saved' },
  { name: 'Zoobe', abbr: 'ZB', color: '#fb7185', metric: '15 cities' },
  { name: 'Kwik Delivery', abbr: 'KD', color: '#2dd4bf', metric: '50ms p95' },
  { name: 'SendGh', abbr: 'SG', color: '#818cf8', metric: '1.2M calls/mo' },
]

const track = [...sponsors, ...sponsors]
</script>

<template>
  <section ref="sectionEl" class="relative overflow-hidden border-y border-border bg-surface-elevated/50 py-14 sm:py-16">
    <div class="absolute inset-x-0 top-0 h-48 overflow-hidden sm:h-56">
      <ThreeMetricsScene />
    </div>

    <div class="relative mx-auto max-w-6xl px-4 sm:px-6">
      <div
        class="mb-10 text-center transition-all duration-700"
        :class="isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'"
      >
        <p class="text-xs font-semibold uppercase tracking-widest text-accent">Platform metrics</p>
        <h2 class="mt-2 text-2xl font-bold text-text sm:text-3xl">Trusted by Ghana's logistics leaders</h2>
      </div>

      <div
        class="relative mb-12 grid grid-cols-2 gap-4 transition-all duration-700 sm:grid-cols-4 sm:gap-6"
        :class="isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'"
        :style="{ transitionDelay: '100ms' }"
      >
        <div
          v-for="(m, i) in metrics"
          :key="m.label"
          v-motion
          :initial="{ opacity: 0, y: 16 }"
          :visibleOnce="{ opacity: 1, y: 0, transition: { delay: i * 80, duration: 500 } }"
          :hovered="{ y: -6, scale: 1.03, transition: { type: 'spring', stiffness: 400, damping: 18 } }"
          class="ft-card-glow relative z-10 bg-surface-card/80 px-4 py-5 text-center backdrop-blur-sm"
        >
          <p class="text-2xl font-bold text-text sm:text-3xl">
            <AnimatedCounter
              :value="m.value"
              :suffix="m.suffix"
              :decimals="m.isDecimal ? 1 : 0"
              :duration="1400"
            />
          </p>
          <p class="mt-1 text-xs text-text-muted">{{ m.label }}</p>
        </div>
      </div>

      <div
        class="relative transition-all duration-700"
        :class="isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'"
        :style="{ transitionDelay: '250ms' }"
      >
        <p class="mb-5 text-center text-xs font-medium uppercase tracking-wider text-text-subtle">
          Powering delivery for
        </p>

        <div
          class="sponsor-carousel relative overflow-hidden"
          @mouseenter="paused = true"
          @mouseleave="paused = false"
        >
          <div class="pointer-events-none absolute inset-y-0 left-0 z-10 w-16 bg-gradient-to-r from-surface-elevated/90 to-transparent sm:w-24" />
          <div class="pointer-events-none absolute inset-y-0 right-0 z-10 w-16 bg-gradient-to-l from-surface-elevated/90 to-transparent sm:w-24" />

          <div class="sponsor-track flex gap-4" :class="{ 'sponsor-track-paused': paused }">
            <div
              v-for="(s, i) in track"
              :key="`${s.name}-${i}`"
              class="sponsor-card ft-card group flex w-56 shrink-0 flex-col gap-3 bg-surface-card/90 p-4 backdrop-blur-sm transition-all duration-300 hover:border-accent/30 hover:shadow-lg hover:shadow-accent/10 sm:w-64"
            >
              <div class="flex items-center gap-3">
                <div
                  class="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg text-xs font-bold text-white shadow-md transition-transform duration-300 group-hover:scale-110 group-hover:rotate-3"
                  :style="{ backgroundColor: s.color }"
                >
                  {{ s.abbr }}
                </div>
                <div class="min-w-0">
                  <p class="truncate text-sm font-semibold text-text">
                    <a
                      v-if="s.url"
                      :href="s.url"
                      target="_blank"
                      rel="noopener noreferrer"
                      class="transition-colors hover:text-accent"
                    >{{ s.name }}</a>
                    <template v-else>{{ s.name }}</template>
                  </p>
                  <p class="text-[10px] text-text-subtle">{{ s.role || 'ANY3MI Partner' }}</p>
                </div>
              </div>
              <div class="flex items-center justify-between border-t border-border pt-3">
                <span class="font-mono text-[10px] text-accent">{{ s.metric }}</span>
                <span class="rounded-full bg-success/15 px-1.5 py-0.5 text-[9px] font-semibold text-success">Live</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>

<style scoped>
.sponsor-track {
  width: max-content;
  animation: sponsor-scroll 40s linear infinite;
}

.sponsor-track-paused {
  animation-play-state: paused;
}

@keyframes sponsor-scroll {
  0% {
    transform: translateX(0);
  }
  100% {
    transform: translateX(-50%);
  }
}
</style>
