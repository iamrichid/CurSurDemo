<script setup>
import { defineAsyncComponent } from 'vue'
import { RouterLink } from 'vue-router'
import CodeSnippet from '../shared/CodeSnippet.vue'
import { useParallax } from '../../composables/useParallax'
import { heroSubcopy } from '../../data/brand.js'

const ThreeHeroBackground = defineAsyncComponent(() => import('../shared/ThreeHeroBackground.vue'))
const RouteScene3D = defineAsyncComponent(() => import('../shared/RouteScene3D.vue'))

const { el: parallaxEl } = useParallax(0.04)

const apiCode = `const quote = await fetch(
  'https://api.any3mi.com/v1/quote',
  {
    method: 'POST',
    headers: {
      'Authorization': 'Bearer a3_live_•••',
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      origin: { lat: 5.638, lng: -0.154 },
      destination: { lat: 5.571, lng: -0.214 },
      vehicle: 'motorbike'
    })
  }
);

const { price_ghs, distance_km } = await quote.json();
// → GH₵ 32.50`
</script>

<template>
  <section class="relative overflow-hidden pt-28 pb-20 sm:pt-32 sm:pb-28">
    <ThreeHeroBackground />

    <div class="pointer-events-none absolute inset-0 mesh-bg opacity-60" />

    <div class="relative mx-auto max-w-6xl px-4 sm:px-6">
      <div ref="parallaxEl" class="mx-auto max-w-3xl text-center will-change-transform">
        <h1 class="text-4xl font-extrabold leading-[1.08] tracking-tight sm:text-5xl lg:text-6xl">
          <span
            v-motion
            :initial="{ opacity: 0, y: 24 }"
            :enter="{ opacity: 1, y: 0, transition: { delay: 100, duration: 600 } }"
            class="block text-text"
          >
            The Routing &amp; Pricing API
          </span>
          <span
            v-motion
            :initial="{ opacity: 0, y: 24 }"
            :enter="{ opacity: 1, y: 0, transition: { delay: 220, duration: 600 } }"
            class="mt-1 block text-gradient sm:mt-2"
          >
            for Ghanaian Logistics
          </span>
        </h1>

        <p
          v-motion
          :initial="{ opacity: 0, y: 20 }"
          :enter="{ opacity: 1, y: 0, transition: { delay: 380, duration: 600 } }"
          class="mx-auto mt-6 max-w-2xl text-base leading-relaxed text-text-muted sm:mt-8 sm:text-lg sm:leading-relaxed"
        >
          {{ heroSubcopy }}
        </p>

        <div
          v-motion
          :initial="{ opacity: 0, y: 20 }"
          :enter="{ opacity: 1, y: 0, transition: { delay: 520, duration: 600 } }"
          class="mt-8 flex flex-wrap items-center justify-center gap-4 sm:mt-10"
        >
          <RouterLink
            to="/dashboard"
            v-motion
            :hovered="{ scale: 1.05, y: -2, transition: { type: 'spring', stiffness: 400, damping: 15 } }"
            :tapped="{ scale: 0.97 }"
            class="ft-btn-primary group relative gap-2 overflow-hidden px-6 py-3.5 text-sm"
          >
            Get API Key
            <svg class="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
              <path stroke-linecap="round" stroke-linejoin="round" d="M13 7l5 5m0 0l-5 5m5-5H6" />
            </svg>
          </RouterLink>
          <a
            href="#playground"
            v-motion
            :hovered="{ scale: 1.03, borderColor: 'var(--color-accent)', transition: { duration: 200 } }"
            class="inline-flex items-center gap-2 rounded-xl border border-border bg-surface-card/80 px-6 py-3.5 text-sm font-semibold text-text backdrop-blur-sm transition-colors duration-300 hover:bg-accent-muted"
          >
            Try Live Demo
          </a>
        </div>

        <div
          v-motion
          :initial="{ opacity: 0 }"
          :enter="{ opacity: 1, transition: { delay: 720, duration: 600 } }"
          class="mt-10 flex flex-wrap items-center justify-center gap-x-8 gap-y-3 text-sm text-text-subtle sm:mt-12"
        >
          <span
            v-for="(badge, i) in ['99.9% uptime', 'GHS-native pricing', '<200ms response']"
            :key="badge"
            v-motion
            :initial="{ opacity: 0, y: 8 }"
            :enter="{ opacity: 1, y: 0, transition: { delay: 820 + i * 80, duration: 400 } }"
            :hovered="{ scale: 1.05, color: 'var(--color-accent)', transition: { duration: 150 } }"
            class="flex cursor-default items-center gap-1.5"
          >
            <svg class="h-4 w-4 text-success" fill="currentColor" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd"/></svg>
            {{ badge }}
          </span>
        </div>
      </div>

      <div
        v-motion
        :initial="{ opacity: 0, y: 40 }"
        :visibleOnce="{ opacity: 1, y: 0, transition: { duration: 700, ease: 'easeOut' } }"
        class="mt-14 grid gap-4 md:grid-cols-2 md:gap-6"
      >
        <RouteScene3D />
        <div
          v-motion
          :hovered="{ y: -4, scale: 1.01, transition: { type: 'spring', stiffness: 300, damping: 20 } }"
        >
          <CodeSnippet :code="apiCode" title="quick-start.js" />
        </div>
      </div>
    </div>
  </section>
</template>
