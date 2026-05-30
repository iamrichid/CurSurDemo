<script setup>
import AnimatedCounter from '../shared/AnimatedCounter.vue'
import UsageChart from '../shared/UsageChart.vue'
import { usePricing } from '../../composables/usePricing'

const { apiCalls, totalSpend } = usePricing()

const chartData = [
  { label: 'Mon', value: 120 },
  { label: 'Tue', value: 185 },
  { label: 'Wed', value: 160 },
  { label: 'Thu', value: 210 },
  { label: 'Fri', value: 280 },
  { label: 'Sat', value: 195 },
  { label: 'Sun', value: 97 },
]

const stats = [
  { label: 'API Requests (7d)', value: apiCalls, prefix: '', suffix: '', decimals: 0 },
  { label: 'Total Spend', value: totalSpend, prefix: 'GH₵ ', suffix: '', decimals: 2 },
  { label: 'Avg Response', value: 142, prefix: '', suffix: 'ms', decimals: 0 },
  { label: 'Success Rate', value: 99.7, prefix: '', suffix: '%', decimals: 1 },
]
</script>

<template>
  <div
    v-motion
    :initial="{ opacity: 0, y: 12 }"
    :enter="{ opacity: 1, y: 0, transition: { duration: 400 } }"
  >
    <div class="mb-6">
      <h1 class="text-2xl font-bold text-text">Overview</h1>
      <p class="mt-1 text-sm text-text-muted">Your API usage and analytics at a glance.</p>
    </div>

    <div class="mb-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
      <div
        v-for="(stat, i) in stats"
        :key="stat.label"
        class="ft-card-glow p-5 transition-all duration-300 hover:border-accent/20"
        v-motion
        :initial="{ opacity: 0, y: 16 }"
        :enter="{ opacity: 1, y: 0, transition: { delay: i * 80, duration: 400 } }"
      >
        <p class="text-xs font-medium text-text-subtle">{{ stat.label }}</p>
        <p class="mt-2 text-2xl font-bold text-text">
          <AnimatedCounter
            :value="stat.value"
            :prefix="stat.prefix"
            :suffix="stat.suffix"
            :decimals="stat.decimals"
            :duration="1400"
          />
        </p>
      </div>
    </div>

    <div class="ft-card-glow p-6">
      <div class="mb-4 flex items-center justify-between">
        <h2 class="text-sm font-semibold text-text">API Requests Over Time</h2>
        <span class="rounded-md bg-accent-muted px-2 py-0.5 text-[10px] font-medium text-accent">Last 7 days</span>
      </div>
      <UsageChart :data="chartData" :height="180" />
    </div>

    <div class="mt-6 grid gap-4 md:grid-cols-3">
      <div
        v-for="(item, i) in [
          { vehicle: 'Motorbike', pct: 62, color: 'bg-accent' },
          { vehicle: 'Bicycle', pct: 24, color: 'bg-success' },
          { vehicle: 'Car', pct: 14, color: 'bg-warning' },
        ]"
        :key="item.vehicle"
        class="ft-card p-4"
        v-motion
        :initial="{ opacity: 0, x: -12 }"
        :enter="{ opacity: 1, x: 0, transition: { delay: 400 + i * 100, duration: 400 } }"
      >
        <div class="flex items-center justify-between text-sm">
          <span class="text-text-muted">{{ item.vehicle }}</span>
          <span class="font-semibold text-text">{{ item.pct }}%</span>
        </div>
        <div class="mt-2 h-1.5 overflow-hidden rounded-full bg-surface-muted">
          <div
            class="h-full rounded-full transition-all duration-1000 ease-out"
            :class="item.color"
            :style="{ width: `${item.pct}%`, transitionDelay: `${600 + i * 100}ms` }"
          />
        </div>
      </div>
    </div>
  </div>
</template>
