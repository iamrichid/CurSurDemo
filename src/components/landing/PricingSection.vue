<script setup>
import { ref, computed } from 'vue'
import { RouterLink } from 'vue-router'
import { useScrollReveal } from '../../composables/useScrollReveal'
import AnimatedCounter from '../shared/AnimatedCounter.vue'

const { el: sectionEl, isVisible } = useScrollReveal()

const monthlyCalls = ref(5000)

const tiers = [
  {
    id: 'free',
    name: 'Free Tier',
    price: 0,
    priceLabel: 'GH₵ 0',
    period: 'forever',
    desc: 'Perfect for prototyping and early-stage apps.',
    features: [
      { text: '500 API calls / month', included: true },
      { text: 'All vehicle types', included: true },
      { text: 'Accra metro coverage', included: true },
      { text: 'Community support', included: true },
      { text: 'Custom pricing matrix', included: false },
      { text: 'Priority support', included: false },
    ],
    cta: 'Start Free',
    highlighted: false,
  },
  {
    id: 'payg',
    name: 'Pay-As-You-Go',
    price: 0.1,
    priceLabel: 'GH₵ 0.10',
    period: 'per API call',
    desc: 'Scale seamlessly as your delivery volume grows.',
    features: [
      { text: 'Unlimited API calls', included: true },
      { text: 'Nationwide coverage', included: true },
      { text: 'Custom pricing matrix', included: true },
      { text: 'Priority support', included: true },
      { text: '99.9% SLA', included: true },
      { text: 'MoMo wallet billing', included: true },
    ],
    cta: 'Get Started',
    highlighted: true,
  },
]

const estimatedPayg = computed(() => monthlyCalls.value * 0.1)
const freeCovers = computed(() => monthlyCalls.value <= 500)
const overageCalls = computed(() => Math.max(0, monthlyCalls.value - 500))
const overageCost = computed(() => overageCalls.value * 0.1)

const sliderPercent = computed(() => {
  const max = 50000
  return (monthlyCalls.value / max) * 100
})

function formatCalls(n) {
  if (n >= 1000) return `${(n / 1000).toFixed(n >= 10000 ? 0 : 1)}k`
  return n.toString()
}
</script>

<template>
  <section id="pricing" ref="sectionEl" class="relative overflow-hidden border-t border-border py-20 sm:py-28">
    <div class="pointer-events-none absolute inset-0 mesh-bg opacity-40" />
    <div class="pointer-events-none absolute left-1/2 top-0 h-64 w-96 -translate-x-1/2 rounded-full bg-accent/5 blur-3xl" />

    <div class="relative mx-auto max-w-6xl px-4 sm:px-6">
      <!-- Header -->
      <div
        class="mb-12 text-center transition-all duration-700"
        :class="isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'"
      >
        <div class="mb-4 inline-flex items-center gap-2 rounded-full border border-border bg-surface-card px-3 py-1 text-xs font-medium text-text-muted">
          <span class="text-accent">GH₵</span> native · no USD conversion fees
        </div>
        <h2 class="text-3xl font-bold tracking-tight text-text sm:text-4xl">Simple, Transparent Pricing</h2>
        <p class="mx-auto mt-3 max-w-xl text-text-muted">
          Start free, then pay only for what you use. No hidden fees, no monthly minimums.
        </p>
      </div>

      <!-- Cost calculator -->
      <div
        v-motion
        :initial="{ opacity: 0, y: 20 }"
        :visibleOnce="{ opacity: 1, y: 0, transition: { duration: 600 } }"
        class="ft-card-glow mx-auto mb-10 max-w-2xl p-6 sm:p-8"
      >
        <div class="mb-1 flex items-center justify-between">
          <p class="text-sm font-semibold text-text">Estimate your monthly cost</p>
          <span class="font-mono text-xs text-accent">{{ formatCalls(monthlyCalls) }} calls/mo</span>
        </div>
        <p class="mb-5 text-xs text-text-subtle">Drag to simulate your API volume</p>

        <div class="relative mb-6">
          <input
            v-model.number="monthlyCalls"
            type="range"
            min="0"
            max="50000"
            step="500"
            class="pricing-slider w-full cursor-pointer"
            :style="{ '--pct': `${sliderPercent}%` }"
          />
          <div class="mt-2 flex justify-between font-mono text-[10px] text-text-subtle">
            <span>0</span>
            <span>500 free</span>
            <span>50k</span>
          </div>
        </div>

        <div class="grid gap-3 sm:grid-cols-2">
          <div
            class="rounded-xl border p-4 transition-all duration-300"
            :class="freeCovers ? 'border-success/40 bg-success/5' : 'border-border bg-surface-muted/50'"
          >
            <p class="text-[10px] font-semibold uppercase tracking-wider text-text-subtle">Free tier</p>
            <p class="mt-1 text-2xl font-bold" :class="freeCovers ? 'text-success' : 'text-text-muted'">
              GH₵ 0
            </p>
            <p class="mt-1 text-[11px] text-text-subtle">
              {{ freeCovers ? 'Covers your volume' : `${formatCalls(overageCalls)} calls over limit` }}
            </p>
          </div>
          <div class="rounded-xl border border-accent/30 bg-accent-muted/20 p-4">
            <p class="text-[10px] font-semibold uppercase tracking-wider text-accent">Pay-as-you-go</p>
            <p class="mt-1 text-2xl font-bold text-accent">
              GH₵ <AnimatedCounter :value="estimatedPayg" :decimals="2" :duration="800" />
            </p>
            <p class="mt-1 text-[11px] text-text-subtle">
              {{ monthlyCalls.toLocaleString() }} × GH₵ 0.10
            </p>
          </div>
        </div>

        <Transition name="tab-content">
          <p v-if="!freeCovers" class="mt-4 rounded-lg border border-warning/30 bg-warning/5 px-3 py-2 text-center text-xs text-warning">
            Above 500 calls? Switch to Pay-As-You-Go — only GH₵ {{ overageCost.toFixed(2) }} for the overage vs building your own routing stack.
          </p>
        </Transition>
      </div>

      <!-- Tier cards -->
      <div class="mx-auto grid max-w-4xl gap-6 md:grid-cols-2">
        <div
          v-for="(tier, i) in tiers"
          :key="tier.id"
          v-motion
          :initial="{ opacity: 0, y: 24 }"
          :visibleOnce="{ opacity: 1, y: 0, transition: { delay: i * 120, duration: 600 } }"
          :hovered="{ y: -6, transition: { type: 'spring', stiffness: 400, damping: 22 } }"
          class="relative flex flex-col p-8 transition-shadow duration-300"
          :class="[
            tier.highlighted
              ? 'ft-card-glow z-10 border-accent/40 bg-accent-muted/10 shadow-xl shadow-accent/10 md:scale-[1.02]'
              : 'ft-card',
          ]"
        >
          <div
            v-if="tier.highlighted"
            class="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-accent px-4 py-1 text-[10px] font-bold uppercase tracking-widest text-accent-foreground shadow-md shadow-accent/30"
          >
            Most Popular
          </div>

          <div class="mb-4 flex items-start justify-between">
            <div>
              <span
                class="inline-flex h-9 w-9 items-center justify-center rounded-lg text-xs font-bold uppercase"
                :class="tier.highlighted ? 'bg-accent text-accent-foreground' : 'bg-surface-muted text-accent'"
              >
                {{ tier.id === 'free' ? 'Free' : 'PAYG' }}
              </span>
              <h3 class="mt-2 text-lg font-semibold text-text">{{ tier.name }}</h3>
            </div>
            <span
              v-if="tier.highlighted"
              class="rounded-md bg-accent/20 px-2 py-0.5 text-[10px] font-semibold text-accent"
            >
              Best value
            </span>
          </div>

          <div class="flex items-baseline gap-1">
            <span class="text-4xl font-extrabold tracking-tight" :class="tier.highlighted ? 'text-accent' : 'text-text'">
              {{ tier.priceLabel }}
            </span>
            <span class="text-sm text-text-muted">/ {{ tier.period }}</span>
          </div>
          <p class="mt-2 text-sm leading-relaxed text-text-muted">{{ tier.desc }}</p>

          <ul class="mt-6 flex-1 space-y-2.5">
            <li
              v-for="(feature, fi) in tier.features"
              :key="feature.text"
              v-motion
              :initial="{ opacity: 0, x: -8 }"
              :visibleOnce="{ opacity: 1, x: 0, transition: { delay: 300 + fi * 50 + i * 80 } }"
              class="flex items-center gap-2.5 text-sm"
              :class="feature.included ? 'text-text-muted' : 'text-text-subtle line-through opacity-40'"
            >
              <span
                class="flex h-5 w-5 shrink-0 items-center justify-center rounded-full"
                :class="feature.included ? 'bg-success/15 text-success' : 'bg-surface-muted text-text-subtle'"
              >
                <svg v-if="feature.included" class="h-3 w-3" fill="currentColor" viewBox="0 0 20 20">
                  <path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd"/>
                </svg>
                <svg v-else class="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                  <path stroke-linecap="round" d="M6 12h12" />
                </svg>
              </span>
              {{ feature.text }}
            </li>
          </ul>

          <RouterLink
            to="/dashboard/login?intent=key"
            v-motion
            :hovered="{ scale: 1.02 }"
            :tapped="{ scale: 0.98 }"
            class="mt-8 block w-full rounded-xl py-3.5 text-center text-sm font-semibold transition-all duration-300"
            :class="
              tier.highlighted
                ? 'ft-btn-primary'
                : 'border border-border bg-surface-card text-text hover:border-accent/40 hover:bg-accent-muted'
            "
          >
            {{ tier.cta }}
          </RouterLink>
        </div>
      </div>

      <!-- Trust strip -->
      <div
        v-motion
        :initial="{ opacity: 0 }"
        :visibleOnce="{ opacity: 1, transition: { delay: 400, duration: 600 } }"
        class="mx-auto mt-12 flex max-w-3xl flex-wrap items-center justify-center gap-x-8 gap-y-3 text-xs text-text-subtle"
      >
        <span class="flex items-center gap-1.5">
          <svg class="h-4 w-4 text-success" fill="currentColor" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd"/></svg>
          No credit card required
        </span>
        <span class="flex items-center gap-1.5">
          <svg class="h-4 w-4 text-success" fill="currentColor" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd"/></svg>
          MoMo wallet top-ups
        </span>
        <span class="flex items-center gap-1.5">
          <svg class="h-4 w-4 text-success" fill="currentColor" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd"/></svg>
          Cancel anytime
        </span>
      </div>
    </div>
  </section>
</template>

<style scoped>
.pricing-slider {
  -webkit-appearance: none;
  appearance: none;
  height: 6px;
  border-radius: 999px;
  background: linear-gradient(
    to right,
    var(--color-accent) 0%,
    var(--color-accent) var(--pct),
    var(--color-surface-muted) var(--pct),
    var(--color-surface-muted) 100%
  );
  outline: none;
}

.pricing-slider::-webkit-slider-thumb {
  -webkit-appearance: none;
  appearance: none;
  width: 20px;
  height: 20px;
  border-radius: 50%;
  background: var(--color-accent);
  cursor: pointer;
  box-shadow: 0 0 12px var(--color-accent-glow);
  border: 2px solid var(--color-surface-card);
  transition: transform 0.15s ease;
}

.pricing-slider::-webkit-slider-thumb:hover {
  transform: scale(1.15);
}

.pricing-slider::-moz-range-thumb {
  width: 20px;
  height: 20px;
  border-radius: 50%;
  background: var(--color-accent);
  cursor: pointer;
  box-shadow: 0 0 12px var(--color-accent-glow);
  border: 2px solid var(--color-surface-card);
}
</style>
