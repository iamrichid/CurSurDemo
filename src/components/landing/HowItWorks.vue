<script setup>
import { ref } from 'vue'
import { RouterLink } from 'vue-router'
import { useScrollReveal } from '../../composables/useScrollReveal'

const { el: sectionEl, isVisible } = useScrollReveal()
const activeStep = ref(0)

const steps = [
  {
    num: '01',
    title: 'Get API Key',
    desc: 'Sign up in seconds and receive your live API credentials. No credit card required to start.',
    icon: 'key',
    docLink: '/docs#authentication',
    docLabel: 'Auth docs',
    time: '~30 sec',
  },
  {
    num: '02',
    title: 'Plug in Coordinates',
    desc: 'Send origin and destination lat/lng pairs via a simple REST POST. We handle the routing.',
    icon: 'pin',
    docLink: '/docs#quote',
    docLabel: 'Quote API',
    time: '1 POST request',
  },
  {
    num: '03',
    title: 'Get Accurate Cedi Pricing',
    desc: 'Receive distance, duration, and a dynamic GH₵ quote tailored to the vehicle type.',
    icon: 'cedi',
    docLink: '/docs#response',
    docLabel: 'Response format',
    time: '<200ms',
  },
]
</script>

<template>
  <section id="how-it-works" ref="sectionEl" class="relative overflow-hidden border-t border-border py-20 sm:py-28">
    <div class="pointer-events-none absolute inset-0 mesh-bg opacity-30" />

    <div class="relative mx-auto max-w-6xl px-4 sm:px-6">
      <div
        class="mb-14 flex flex-col items-center text-center transition-all duration-700 sm:flex-row sm:items-end sm:justify-between sm:text-left"
        :class="isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'"
      >
        <div>
          <p class="mb-3 text-xs font-semibold uppercase tracking-widest text-accent">Integration flow</p>
          <h2 class="text-3xl font-bold tracking-tight text-text sm:text-4xl">How It Works</h2>
          <p class="mx-auto mt-3 max-w-xl text-text-muted sm:mx-0">
            Three steps from signup to live pricing on your platform.
          </p>
        </div>
        <RouterLink
          to="/docs"
          v-motion
          :hovered="{ scale: 1.03, transition: { type: 'spring', stiffness: 400 } }"
          class="mt-6 inline-flex items-center gap-2 rounded-xl border border-border bg-surface-card px-5 py-2.5 text-sm font-semibold text-text transition-colors hover:border-accent/40 hover:text-accent sm:mt-0"
        >
          Read full docs
          <svg class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
            <path stroke-linecap="round" stroke-linejoin="round" d="M13 7l5 5m0 0l-5 5m5-5H6" />
          </svg>
        </RouterLink>
      </div>

      <!-- Progress track (desktop) -->
      <div class="relative mb-8 hidden md:block">
        <div class="absolute left-[16.67%] right-[16.67%] top-1/2 h-0.5 -translate-y-1/2 bg-border" />
        <div
          class="absolute left-[16.67%] top-1/2 h-0.5 -translate-y-1/2 bg-accent transition-all duration-1000 ease-out"
          :class="isVisible ? 'opacity-100' : 'opacity-0'"
          :style="{ width: isVisible ? '66.66%' : '0%', transitionDelay: '400ms' }"
        />
        <div class="relative grid grid-cols-3">
          <div v-for="(step, i) in steps" :key="step.num" class="flex justify-center">
            <button
              type="button"
              class="flex h-8 w-8 items-center justify-center rounded-full border-2 text-xs font-bold transition-all duration-300"
              :class="
                activeStep >= i
                  ? 'border-accent bg-accent text-accent-foreground shadow-md shadow-accent/30'
                  : 'border-border bg-surface-card text-text-muted'
              "
              @mouseenter="activeStep = i"
            >
              {{ i + 1 }}
            </button>
          </div>
        </div>
      </div>

      <div class="grid gap-6 md:grid-cols-3">
        <RouterLink
          v-for="(step, i) in steps"
          :key="step.num"
          :to="step.docLink"
          v-motion
          :initial="{ opacity: 0, y: 24 }"
          :visibleOnce="{ opacity: 1, y: 0, transition: { delay: i * 120, duration: 600 } }"
          :hovered="{ y: -8, transition: { type: 'spring', stiffness: 400, damping: 20 } }"
          class="group relative flex flex-col ft-card-glow p-6 transition-shadow duration-300 hover:shadow-lg hover:shadow-accent/10"
          @mouseenter="activeStep = i"
        >
          <div class="mb-4 flex items-center justify-between">
            <span class="font-mono text-xs font-semibold text-accent">{{ step.num }}</span>
            <div class="flex h-10 w-10 items-center justify-center rounded-xl bg-accent-muted text-accent transition-transform duration-300 group-hover:scale-110 group-hover:bg-accent group-hover:text-accent-foreground">
              <svg v-if="step.icon === 'key'" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5">
                <path stroke-linecap="round" stroke-linejoin="round" d="M15.75 5.25a3 3 0 013 3m3 0a6 6 0 01-7.029 5.912c-.563-.097-1.159.026-1.563.43L10.5 17.25H8.25v2.25H6v2.25H2.25v-2.818c0-.597.237-1.17.659-1.591l6.499-6.499a1.875 1.875 0 011.563-.43z" />
              </svg>
              <svg v-else-if="step.icon === 'pin'" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5">
                <path stroke-linecap="round" stroke-linejoin="round" d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z" />
                <path stroke-linecap="round" stroke-linejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z" />
              </svg>
              <span v-else class="text-sm font-bold">GH₵</span>
            </div>
          </div>

          <h3 class="text-lg font-semibold text-text group-hover:text-accent transition-colors">{{ step.title }}</h3>
          <p class="mt-2 flex-1 text-sm leading-relaxed text-text-muted">{{ step.desc }}</p>

          <div class="mt-5 flex items-center justify-between border-t border-border pt-4">
            <span class="rounded-md bg-surface-muted px-2 py-0.5 font-mono text-[10px] text-text-subtle">{{ step.time }}</span>
            <span class="flex items-center gap-1 text-xs font-medium text-accent opacity-0 transition-opacity duration-300 group-hover:opacity-100">
              {{ step.docLabel }}
              <svg class="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                <path stroke-linecap="round" stroke-linejoin="round" d="M9 5l7 7-7 7" />
              </svg>
            </span>
          </div>
        </RouterLink>
      </div>
    </div>
  </section>
</template>
