<script setup>
import { RouterLink } from 'vue-router'
import LandingNav from '../components/landing/LandingNav.vue'
import HeroSection from '../components/landing/HeroSection.vue'
import SponsorsCarousel from '../components/landing/SponsorsCarousel.vue'
import HowItWorks from '../components/landing/HowItWorks.vue'
import ApiPlayground from '../components/landing/ApiPlayground.vue'
import PricingSection from '../components/landing/PricingSection.vue'
import { brand } from '../data/brand.js'
import { isLiveApiEnabled } from '../services/quoteApi.js'

const apiHealthUrl = isLiveApiEnabled()
  ? `${import.meta.env.VITE_ANY3MI_API_URL.replace(/\/$/, '')}/v1/health`
  : null
</script>

<template>
  <div class="min-h-screen bg-surface">
    <LandingNav />
    <main>
      <HeroSection />
      <SponsorsCarousel />
      <HowItWorks />
      <ApiPlayground />
      <PricingSection />
    </main>
    <footer class="border-t border-border py-8">
      <div class="mx-auto flex max-w-6xl flex-col items-center justify-between gap-4 px-4 sm:flex-row sm:px-6">
        <p class="text-xs text-text-subtle">
          &copy; {{ new Date().getFullYear() }} {{ brand.name }} · {{ brand.org }} {{ brand.dept }}.
          Built from
          <a
            :href="brand.nightMarket.url"
            target="_blank"
            rel="noopener noreferrer"
            class="transition-colors hover:text-accent"
          >{{ brand.nightMarket.name }}</a>.
        </p>
        <div class="flex flex-wrap justify-center gap-4 text-xs text-text-subtle sm:justify-end">
          <RouterLink to="/docs" class="transition-colors hover:text-accent">Docs</RouterLink>
          <RouterLink to="/dashboard/login?intent=key" class="transition-colors hover:text-accent">Get API Key</RouterLink>
          <a
            v-if="apiHealthUrl"
            :href="apiHealthUrl"
            target="_blank"
            rel="noopener noreferrer"
            class="transition-colors hover:text-accent"
          >
            API Status
          </a>
        </div>
      </div>
    </footer>
  </div>
</template>
