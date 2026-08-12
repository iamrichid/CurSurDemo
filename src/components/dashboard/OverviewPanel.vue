<script setup>
import { ref, onMounted } from 'vue'
import AnimatedCounter from '../shared/AnimatedCounter.vue'
import UsageChart from '../shared/UsageChart.vue'
import { fetchUsage, DashboardApiError } from '../../services/dashboardApi.js'

const loading = ref(true)
const error = ref('')
const stats = ref([
  { label: 'API Requests (7d)', value: 0, prefix: '', suffix: '', decimals: 0 },
  { label: 'Total Spend', value: 0, prefix: 'GH₵ ', suffix: '', decimals: 2 },
  { label: 'Avg Response', value: 0, prefix: '', suffix: 'ms', decimals: 0 },
  { label: 'Success Rate', value: 100, prefix: '', suffix: '%', decimals: 1 },
])
const chartData = ref([
  { label: 'Mon', value: 0 },
  { label: 'Tue', value: 0 },
  { label: 'Wed', value: 0 },
  { label: 'Thu', value: 0 },
  { label: 'Fri', value: 0 },
  { label: 'Sat', value: 0 },
  { label: 'Sun', value: 0 },
])
const vehicleBreakdown = ref([])
const plan = ref(null)

const vehicleLabels = {
  bicycle: 'Bicycle',
  motorbike: 'Motorbike',
  car: 'Car',
}

const vehicleColors = {
  bicycle: 'bg-success',
  motorbike: 'bg-accent',
  car: 'bg-warning',
}

onMounted(async () => {
  try {
    const data = await fetchUsage()
    stats.value = [
      { label: 'API Requests (7d)', value: data.total_calls, prefix: '', suffix: '', decimals: 0 },
      { label: 'Total Spend', value: data.total_spend, prefix: 'GH₵ ', suffix: '', decimals: 2 },
      { label: 'Avg Response', value: data.avg_latency_ms, prefix: '', suffix: 'ms', decimals: 0 },
      { label: 'Success Rate', value: data.success_rate, prefix: '', suffix: '%', decimals: 1 },
    ]
    chartData.value = data.chart?.length
      ? data.chart.map((row) => ({ label: row.label, value: row.value }))
      : chartData.value
    vehicleBreakdown.value = (data.vehicle_breakdown || []).map((row) => ({
      vehicle: vehicleLabels[row.vehicle] || row.vehicle,
      pct: row.pct,
      color: vehicleColors[row.vehicle] || 'bg-accent',
    }))
    plan.value = data.plan || null
  } catch (err) {
    error.value =
      err instanceof DashboardApiError ? err.message : 'Could not load usage data.'
  } finally {
    loading.value = false
  }
})
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

    <p v-if="error" class="mb-4 rounded-lg border border-danger/30 bg-danger/10 px-3 py-2 text-xs text-danger">
      {{ error }}
    </p>

    <div v-if="plan" class="mb-6 ft-card-glow p-5">
      <div class="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p class="text-xs font-semibold uppercase tracking-wider text-text-subtle">Free tier this month</p>
          <p class="mt-1 text-sm text-text-muted">
            {{ plan.free_tier_used }} / {{ plan.free_tier_limit }} calls
            <span v-if="plan.on_payg" class="text-accent">· now on pay-as-you-go</span>
          </p>
        </div>
        <span class="rounded-md bg-accent-muted px-2 py-1 font-mono text-xs text-accent">
          {{ plan.free_tier_remaining }} free left
        </span>
      </div>
      <div class="mt-3 h-2 overflow-hidden rounded-full bg-surface-muted">
        <div
          class="h-full rounded-full bg-accent transition-all duration-700"
          :style="{ width: `${Math.min(100, (plan.free_tier_used / plan.free_tier_limit) * 100)}%` }"
        />
      </div>
      <p class="mt-2 text-[10px] text-text-subtle">
        Rate limit: {{ plan.rate_limit_per_minute }} requests/min · PAYG: GH₵ {{ plan.payg_cost_per_call.toFixed(2) }}/call after free tier
      </p>
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
      <p v-if="loading" class="py-8 text-center text-xs text-text-subtle">Loading usage…</p>
      <UsageChart v-else :data="chartData" :height="180" />
    </div>

    <div v-if="vehicleBreakdown.length" class="mt-6 grid gap-4 md:grid-cols-3">
      <div
        v-for="(item, i) in vehicleBreakdown"
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

    <p v-else-if="!loading" class="mt-6 text-xs text-text-subtle">
      No quote requests yet — run a quote from the playground or API to populate analytics.
    </p>
  </div>
</template>
