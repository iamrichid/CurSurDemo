<script setup>
import { RouterLink } from 'vue-router'
import LandingNav from '../components/landing/LandingNav.vue'
import HeroSection from '../components/landing/HeroSection.vue'
import SponsorsCarousel from '../components/landing/SponsorsCarousel.vue'
import HowItWorks from '../components/landing/HowItWorks.vue'
import ApiPlayground from '../components/landing/ApiPlayground.vue'
import PricingSection from '../components/landing/PricingSection.vue'
import { brand } from '../data/brand.js'
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
        <div class="flex gap-4 text-xs text-text-subtle">
          <RouterLink to="/docs" class="transition-colors hover:text-accent">Docs</RouterLink>
          <a href="#" class="transition-colors hover:text-text">Privacy</a>
          <a href="#" class="transition-colors hover:text-text">Terms</a>
          <a href="#" class="transition-colors hover:text-text">Status</a>
        </div>
      </div>
    </footer>
  </div>
</template>
