<script setup>
import { ref, computed, defineAsyncComponent } from 'vue'
import { useScrollReveal } from '../../composables/useScrollReveal'
import { usePricing, getMockRoute } from '../../composables/usePricing'
import { fetchQuote, isLiveApiEnabled } from '../../services/quoteApi.js'
import { highlightJson } from '../../data/docsContent.js'
import PlaygroundRoutePreview from './PlaygroundRoutePreview.vue'

const ThreeLoader = defineAsyncComponent(() => import('../shared/ThreeLoader.vue'))

const { calculateQuote } = usePricing()
const { el: sectionEl, isVisible } = useScrollReveal()

const vehicles = [
  { id: 'bicycle', label: 'Bike', abbr: 'Bi', desc: 'GH₵ 5 base' },
  { id: 'motorbike', label: 'Motor', abbr: 'Mo', desc: 'GH₵ 8 base' },
  { id: 'car', label: 'Car', abbr: 'Ca', desc: 'GH₵ 15 base' },
]

const activeVehicle = ref('motorbike')
const loading = ref(false)
const responseText = ref('')
const showResponse = ref(false)
const routeProgress = ref(0)
const responseMs = ref(0)
const copied = ref(false)
const errorMessage = ref('')

const route = getMockRoute()
const liveApi = isLiveApiEnabled()

const quote = computed(() =>
  calculateQuote(activeVehicle.value, route.distanceKm, route.durationMins)
)

const requestJson = computed(() =>
  JSON.stringify(
    {
      origin: { lat: route.origin.lat, lng: route.origin.lng },
      destination: { lat: route.destination.lat, lng: route.destination.lng },
      vehicle: activeVehicle.value,
    },
    null,
    2
  )
)

const highlightedResponse = computed(() => highlightJson(responseText.value))
const isTypingResponse = ref(false)

async function testEndpoint() {
  loading.value = true
  showResponse.value = false
  responseText.value = ''
  routeProgress.value = 0
  copied.value = false
  errorMessage.value = ''

  const start = performance.now()

  const progressInterval = setInterval(() => {
    routeProgress.value = Math.min(routeProgress.value + 0.04, 0.95)
  }, 50)

  try {
    const [payload] = await Promise.all([
      fetchQuote({
        origin: { lat: route.origin.lat, lng: route.origin.lng },
        destination: { lat: route.destination.lat, lng: route.destination.lng },
        vehicle: activeVehicle.value,
      }),
      new Promise((resolve) => setTimeout(resolve, liveApi ? 0 : 1200)),
    ])

    clearInterval(progressInterval)
    routeProgress.value = 1
    responseMs.value = Math.round(performance.now() - start)

    loading.value = false
    showResponse.value = true

    const text = JSON.stringify(payload, null, 2)
    isTypingResponse.value = true
    for (let i = 0; i <= text.length; i++) {
      responseText.value = text.slice(0, i)
      await new Promise((r) => setTimeout(r, i < 40 ? 6 : 1))
    }
    isTypingResponse.value = false
  } catch (err) {
    clearInterval(progressInterval)
    loading.value = false
    if (err instanceof Error && 'code' in err && err.code === 'INSUFFICIENT_BALANCE') {
      errorMessage.value = `${err.message} Top up in the dashboard under Billing.`
    } else {
      errorMessage.value =
        err instanceof Error ? err.message : 'Quote request failed'
    }
  }
}

function switchVehicle(id) {
  activeVehicle.value = id
  showResponse.value = false
  responseText.value = ''
  routeProgress.value = 0
  errorMessage.value = ''
}

async function copyResponse() {
  if (!responseText.value) return
  await navigator.clipboard.writeText(responseText.value)
  copied.value = true
  setTimeout(() => { copied.value = false }, 2000)
}
</script>

<template>
  <section id="playground" ref="sectionEl" class="border-t border-border py-20 sm:py-28">
    <div class="mx-auto max-w-6xl px-4 sm:px-6">
      <div
        class="mb-10 flex flex-col gap-4 transition-all duration-700 sm:flex-row sm:items-end sm:justify-between"
        :class="isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'"
      >
        <div>
          <div class="mb-3 inline-flex items-center gap-2 rounded-full border border-accent/30 bg-accent-muted px-3 py-1 text-xs font-semibold text-accent">
            <span class="relative flex h-1.5 w-1.5">
              <span class="absolute inline-flex h-full w-full animate-ping rounded-full bg-accent opacity-75" />
              <span class="relative inline-flex h-1.5 w-1.5 rounded-full bg-accent" />
            </span>
            Interactive Demo
          </div>
          <h2 class="text-3xl font-bold tracking-tight text-text sm:text-4xl">Live API Playground</h2>
          <p class="mt-3 max-w-xl text-text-muted">
            Fire a real quote request — East Legon to Circle, Accra. Swap vehicles and watch pricing update instantly.
          </p>
        </div>
        <div class="flex flex-wrap gap-2">
          <span class="rounded-lg border border-border bg-surface-card px-3 py-1.5 font-mono text-xs text-text-muted">
            api.any3mi.com
          </span>
          <span
            class="rounded-lg border px-3 py-1.5 text-xs font-medium"
            :class="liveApi ? 'border-accent/30 bg-accent/10 text-accent' : 'border-success/30 bg-success/10 text-success'"
          >
            {{ liveApi ? 'Live API' : 'Sandbox · No auth required' }}
          </span>
        </div>
      </div>

      <div
        class="ft-card-glow overflow-hidden transition-all duration-700"
        :class="isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'"
        :style="{ transitionDelay: '200ms' }"
      >
        <!-- Toolbar -->
        <div class="flex flex-wrap items-center justify-between gap-3 border-b border-border bg-surface-muted/50 px-4 py-3 sm:px-6">
          <div class="flex items-center gap-2">
            <span class="rounded-md bg-success/15 px-2 py-0.5 font-mono text-[10px] font-bold text-success sm:text-xs">POST</span>
            <span class="font-mono text-xs text-text sm:text-sm">/v1/quote</span>
          </div>
          <div class="flex items-center gap-3 text-[10px] text-text-subtle sm:text-xs">
            <span v-if="showResponse" class="font-mono text-success">{{ responseMs }}ms</span>
            <span class="hidden sm:inline">·</span>
            <span>{{ route.origin.name }} → {{ route.destination.name }}</span>
          </div>
        </div>

        <div class="grid lg:grid-cols-12">
          <!-- Request -->
          <div class="border-b border-border p-5 sm:p-6 lg:col-span-5 lg:border-b-0 lg:border-r">
            <div class="mb-1 flex items-center gap-2">
              <span class="h-2 w-2 rounded-full bg-danger/80" />
              <span class="h-2 w-2 rounded-full bg-warning/80" />
              <span class="h-2 w-2 rounded-full bg-success/80" />
              <span class="ml-1 font-mono text-[10px] text-text-subtle">request.json</span>
            </div>

            <p class="mb-3 mt-4 text-xs font-medium text-text-muted">Vehicle type</p>
            <div class="mb-5 grid grid-cols-3 gap-2">
              <button
                v-for="v in vehicles"
                :key="v.id"
                type="button"
                v-motion
                :hovered="{ y: -2, transition: { type: 'spring', stiffness: 500, damping: 20 } }"
                :tapped="{ scale: 0.96 }"
                class="relative flex flex-col items-center gap-1 rounded-xl border px-2 py-3 text-center transition-all duration-300"
                :class="
                  activeVehicle === v.id
                    ? 'border-accent bg-accent-muted shadow-md shadow-accent/15'
                    : 'border-border bg-surface-card hover:border-border-strong'
                "
                @click="switchVehicle(v.id)"
              >
                <span class="flex h-8 w-8 items-center justify-center rounded-lg bg-surface-muted text-[10px] font-bold uppercase text-accent">{{ v.abbr }}</span>
                <span class="text-xs font-semibold" :class="activeVehicle === v.id ? 'text-accent' : 'text-text'">{{ v.label }}</span>
                <span class="text-[9px] text-text-subtle">{{ v.desc }}</span>
                <span
                  v-if="activeVehicle === v.id"
                  class="absolute -bottom-px left-1/2 h-0.5 w-8 -translate-x-1/2 rounded-full bg-accent"
                />
              </button>
            </div>

            <div class="mb-4 flex flex-wrap items-center gap-2">
              <span class="rounded-md border border-border bg-surface-card px-2 py-1 text-[10px] font-medium text-text">{{ route.origin.name }}</span>
              <svg class="h-3 w-3 text-accent" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                <path stroke-linecap="round" stroke-linejoin="round" d="M17 8l4 4m0 0l-4 4m4-4H3" />
              </svg>
              <span class="rounded-md border border-border bg-surface-card px-2 py-1 text-[10px] font-medium text-text">{{ route.destination.name }}</span>
              <span class="ml-auto font-mono text-[10px] text-text-subtle">{{ route.distanceKm }} km · ~{{ route.durationMins }} min</span>
            </div>

            <pre class="mb-5 overflow-x-auto rounded-xl border border-border bg-[#0a0a0c] p-4 font-mono text-[11px] leading-relaxed text-text-muted sm:text-xs"><code>{{ requestJson }}</code></pre>

            <p v-if="errorMessage" class="mb-4 rounded-lg border border-danger/30 bg-danger/10 px-3 py-2 text-xs text-danger">
              {{ errorMessage }}
            </p>

            <button
              type="button"
              v-motion
              :hovered="{ scale: 1.02, transition: { type: 'spring', stiffness: 400, damping: 15 } }"
              :tapped="{ scale: 0.97 }"
              class="ft-btn-primary w-full gap-2 py-3.5 text-sm disabled:opacity-60"
              :disabled="loading"
              @click="testEndpoint"
            >
              <svg v-if="loading" class="h-4 w-4 animate-spin" fill="none" viewBox="0 0 24 24">
                <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" />
                <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
              </svg>
              <svg v-else class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                <path stroke-linecap="round" stroke-linejoin="round" d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                <path stroke-linecap="round" stroke-linejoin="round" d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              {{ loading ? 'Calculating route…' : 'Run Quote Request' }}
            </button>
          </div>

          <!-- Route preview (center column on lg) -->
          <div class="hidden flex-col items-center justify-center border-b border-border bg-surface-muted/30 p-6 lg:col-span-2 lg:flex lg:border-b-0 lg:border-r">
            <p class="mb-4 text-center text-[10px] font-semibold uppercase tracking-wider text-text-subtle">Route preview</p>
            <PlaygroundRoutePreview
              :loading="loading"
              :active="showResponse"
              :progress="routeProgress"
            />
            <Transition name="tab-content">
              <p v-if="showResponse && quote" class="mt-4 text-center font-mono text-lg font-bold text-accent">
                GH₵ {{ quote.price_ghs.toFixed(2) }}
              </p>
            </Transition>
          </div>

          <!-- Response -->
          <div class="relative flex min-h-[360px] flex-col bg-[#0a0a0c] lg:col-span-5">
            <div class="flex items-center justify-between border-b border-border/50 px-5 py-3">
              <div class="flex items-center gap-2">
                <span class="h-2 w-2 rounded-full bg-danger/80" />
                <span class="h-2 w-2 rounded-full bg-warning/80" />
                <span class="h-2 w-2 rounded-full bg-success/80" />
                <span class="ml-1 font-mono text-[10px] text-text-subtle">response.json</span>
              </div>
              <div class="flex items-center gap-2">
                <Transition name="tab-content">
                  <button
                    v-if="showResponse"
                    type="button"
                    class="rounded-md border border-border px-2 py-0.5 font-mono text-[10px] text-text-muted transition-colors hover:border-accent/40 hover:text-accent"
                    @click="copyResponse"
                  >
                    {{ copied ? 'Copied!' : 'Copy' }}
                  </button>
                </Transition>
                <Transition name="tab-content">
                  <span v-if="showResponse" class="rounded-full bg-success/20 px-2 py-0.5 text-[10px] font-semibold text-success">200 OK</span>
                </Transition>
              </div>
            </div>

            <div class="flex flex-1 flex-col p-5">
              <!-- Empty -->
              <div v-if="!loading && !showResponse && !errorMessage" class="flex flex-1 flex-col items-center justify-center gap-4 text-center">
                <div class="flex h-16 w-16 items-center justify-center rounded-2xl border border-border bg-surface-card">
                  <svg class="h-8 w-8 text-text-subtle" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5">
                    <path stroke-linecap="round" stroke-linejoin="round" d="M8 9l3 3-3 3m5 0h3M5 20h14a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                </div>
                <div>
                  <p class="text-sm font-medium text-text-muted">Awaiting request</p>
                  <p class="mt-1 text-xs text-text-subtle">Select a vehicle and hit Run Quote Request</p>
                </div>
                <div class="lg:hidden">
                  <PlaygroundRoutePreview :loading="false" :active="false" :progress="0" />
                </div>
              </div>

              <!-- Loading -->
              <div v-if="loading" class="flex flex-1 flex-col items-center justify-center gap-4">
                <ThreeLoader :active="loading" />
                <div class="w-full max-w-xs space-y-2">
                  <div class="flex justify-between font-mono text-[10px] text-text-subtle">
                    <span>Geocoding coordinates</span>
                    <span>{{ Math.round(routeProgress * 40) }}%</span>
                  </div>
                  <div class="h-1 overflow-hidden rounded-full bg-surface-muted">
                    <div
                      class="h-full rounded-full bg-accent transition-all duration-150"
                      :style="{ width: `${routeProgress * 100}%` }"
                    />
                  </div>
                  <p class="text-center text-[10px] text-text-subtle">Routing via OpenStreetMap…</p>
                </div>
                <PlaygroundRoutePreview class="lg:hidden" :loading="loading" :active="false" :progress="routeProgress" />
              </div>

              <!-- Success -->
              <Transition name="fade-slide-up">
                <div v-if="showResponse && !loading" class="flex flex-1 flex-col gap-4">
                  <div
                    v-if="quote"
                    v-motion
                    :initial="{ opacity: 0, scale: 0.95 }"
                    :enter="{ opacity: 1, scale: 1, transition: { duration: 400 } }"
                    class="rounded-xl border border-accent/30 bg-accent-muted/30 p-4"
                  >
                    <p class="text-[10px] font-semibold uppercase tracking-wider text-text-subtle">Quoted price</p>
                    <p class="mt-1 text-3xl font-extrabold text-accent">GH₵ {{ quote.price_ghs.toFixed(2) }}</p>
                    <div class="mt-2 flex flex-wrap gap-3 font-mono text-[10px] text-text-muted">
                      <span>{{ quote.distance_km }} km</span>
                      <span>·</span>
                      <span>{{ quote.duration_mins }} min</span>
                      <span>·</span>
                      <span>{{ quote.vehicle }}</span>
                    </div>
                  </div>
                  <pre
                    class="flex-1 overflow-x-auto overflow-y-auto rounded-xl border border-border/50 bg-surface/50 p-4 font-mono text-[11px] leading-relaxed sm:text-xs"
                    v-html="highlightedResponse + (isTypingResponse ? '<span class=&quot;animate-pulse text-accent&quot;>▊</span>' : '')"
                  />
                </div>
              </Transition>
            </div>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>

<style scoped>
pre :deep(.text-sky-400) { color: #38bdf8; }
pre :deep(.text-emerald-400) { color: #34d399; }
pre :deep(.text-amber-400) { color: #fbbf24; }
</style>
