<script setup>
import { ref, onMounted, onUnmounted } from 'vue'
import { RouterLink } from 'vue-router'
import LandingNav from '../components/landing/LandingNav.vue'
import {
  docsNav,
  curlExample,
  jsonResponse,
  requestParams,
  vehicles,
  errors,
  highlightJson,
} from '../data/docsContent.js'
import { brand, docsIntro } from '../data/brand.js'

const activeSection = ref('introduction')

function onScroll() {
  const offsets = docsNav.map(({ id }) => {
    const el = document.getElementById(id)
    return { id, top: el ? el.getBoundingClientRect().top : Infinity }
  })
  const visible = offsets.filter((o) => o.top <= 120).pop()
  if (visible) activeSection.value = visible.id
}

onMounted(() => {
  window.addEventListener('scroll', onScroll, { passive: true })
  if (window.location.hash) {
    const id = window.location.hash.slice(1)
    setTimeout(() => document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' }), 100)
  }
})

onUnmounted(() => window.removeEventListener('scroll', onScroll))
</script>

<template>
  <div class="min-h-screen bg-surface">
    <LandingNav />

    <div class="mx-auto max-w-6xl px-4 pb-20 pt-24 sm:px-6">
      <!-- Header -->
      <div class="mb-10 border-b border-border pb-8">
        <div class="flex flex-wrap items-start justify-between gap-4">
          <div>
            <p class="text-xs font-semibold uppercase tracking-widest text-accent">Developer Docs</p>
            <h1 class="mt-2 text-3xl font-bold text-text sm:text-4xl">ANY3MI API Reference</h1>
            <p class="mt-2 max-w-xl text-sm text-text-muted">
              Integration reference for routing and GH₵ pricing — from Usammi TECH DEPT &amp; Night Market.
            </p>
          </div>
          <div class="flex flex-wrap gap-2">
            <RouterLink to="/#playground" class="rounded-lg border border-border px-3 py-1.5 text-xs font-medium text-text-muted transition-colors hover:border-accent/40 hover:text-accent">
              Try playground →
            </RouterLink>
            <RouterLink to="/dashboard" class="ft-btn-primary px-4 py-1.5 text-xs">
              Get API Key
            </RouterLink>
          </div>
        </div>
      </div>

      <div class="grid gap-10 lg:grid-cols-12">
        <!-- Sidebar -->
        <aside class="lg:col-span-3">
          <nav class="sticky top-24 space-y-0.5">
            <a
              v-for="item in docsNav"
              :key="item.id"
              :href="`#${item.id}`"
              class="block rounded-lg px-3 py-2 text-sm font-medium transition-all duration-200"
              :class="
                activeSection === item.id
                  ? 'bg-accent-muted text-accent'
                  : 'text-text-muted hover:bg-surface-muted hover:text-text'
              "
            >
              {{ item.label }}
            </a>
          </nav>
        </aside>

        <!-- Content -->
        <main class="lg:col-span-9 space-y-16">
          <section id="introduction" class="scroll-mt-24">
            <h2 class="text-xl font-bold text-text">Introduction</h2>
            <p class="mt-3 text-sm leading-relaxed text-text-muted">
              {{ docsIntro }}
            </p>
            <p class="mt-3 text-sm leading-relaxed text-text-muted">
              Night Market
              (<a
                :href="brand.nightMarket.url"
                target="_blank"
                rel="noopener noreferrer"
                class="text-accent transition-colors hover:underline"
              >nightmarketgh.com</a>)
              is the origin consumer app — ANY3MI exposes the same routing engine to third-party logistics platforms.
            </p>
            <div class="mt-4 grid gap-3 sm:grid-cols-3">
              <div class="ft-card p-4">
                <p class="font-mono text-xs text-accent">Base URL</p>
                <p class="mt-1 text-sm font-medium text-text">api.any3mi.com</p>
              </div>
              <div class="ft-card p-4">
                <p class="font-mono text-xs text-accent">Format</p>
                <p class="mt-1 text-sm font-medium text-text">JSON</p>
              </div>
              <div class="ft-card p-4">
                <p class="font-mono text-xs text-accent">Currency</p>
                <p class="mt-1 text-sm font-medium text-text">GHS (GH₵)</p>
              </div>
            </div>
          </section>

          <section id="authentication" class="scroll-mt-24">
            <h2 class="text-xl font-bold text-text">Authentication</h2>
            <p class="mt-3 text-sm leading-relaxed text-text-muted">
              All requests require a Bearer token. Generate keys from your
              <RouterLink to="/dashboard" class="text-accent hover:underline">developer dashboard</RouterLink>.
              Use <code class="rounded bg-surface-muted px-1 py-0.5 font-mono text-xs text-accent">a3_test_</code> keys in sandbox and <code class="rounded bg-surface-muted px-1 py-0.5 font-mono text-xs text-accent">a3_live_</code> in production.
            </p>
            <pre class="mt-4 overflow-x-auto rounded-xl border border-border bg-[#0a0a0c] p-4 font-mono text-xs text-text-muted">Authorization: Bearer a3_live_sk_abc123</pre>
          </section>

          <section id="quickstart" class="scroll-mt-24">
            <h2 class="text-xl font-bold text-text">Quick Start</h2>
            <p class="mt-3 text-sm text-text-muted">Three steps — same flow as our integration guide:</p>
            <ol class="mt-4 space-y-3">
              <li class="flex gap-3 ft-card p-4">
                <span class="font-mono text-xs font-bold text-accent">01</span>
                <div>
                  <p class="text-sm font-semibold text-text">Get your API key</p>
                  <p class="text-xs text-text-muted">Sign up free — no credit card required.</p>
                </div>
              </li>
              <li class="flex gap-3 ft-card p-4">
                <span class="font-mono text-xs font-bold text-accent">02</span>
                <div>
                  <p class="text-sm font-semibold text-text">POST coordinates to /v1/quote</p>
                  <p class="text-xs text-text-muted">Origin + destination lat/lng and vehicle type.</p>
                </div>
              </li>
              <li class="flex gap-3 ft-card p-4">
                <span class="font-mono text-xs font-bold text-accent">03</span>
                <div>
                  <p class="text-sm font-semibold text-text">Use the GH₵ quote in your app</p>
                  <p class="text-xs text-text-muted">Display price_ghs, distance_km, and duration_mins.</p>
                </div>
              </li>
            </ol>
          </section>

          <section id="quote" class="scroll-mt-24">
            <h2 class="text-xl font-bold text-text">Quote API</h2>
            <div class="mt-3 flex items-center gap-2">
              <span class="rounded-md bg-success/15 px-2 py-0.5 font-mono text-xs font-bold text-success">POST</span>
              <span class="font-mono text-sm text-text">/v1/quote</span>
            </div>
            <p class="mt-3 text-sm text-text-muted">Returns road distance, duration, and a dynamic price quote.</p>

            <h3 class="mt-6 text-sm font-semibold text-text">Request body</h3>
            <div class="mt-3 overflow-hidden rounded-xl border border-border">
              <table class="w-full text-left text-xs">
                <thead class="border-b border-border bg-surface-muted">
                  <tr>
                    <th class="px-4 py-2.5 font-semibold text-text-muted">Field</th>
                    <th class="px-4 py-2.5 font-semibold text-text-muted">Type</th>
                    <th class="px-4 py-2.5 font-semibold text-text-muted">Description</th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-for="p in requestParams" :key="p.name" class="border-b border-border/50 last:border-0">
                    <td class="px-4 py-2.5 font-mono text-accent">{{ p.name }}</td>
                    <td class="px-4 py-2.5 text-text-subtle">{{ p.type }}</td>
                    <td class="px-4 py-2.5 text-text-muted">{{ p.desc }}</td>
                  </tr>
                </tbody>
              </table>
            </div>

            <div class="mt-6 grid gap-4 lg:grid-cols-2">
              <div class="overflow-hidden rounded-xl border border-border">
                <div class="border-b border-border bg-surface-elevated px-4 py-2 font-mono text-[10px] text-text-subtle">request.sh</div>
                <pre class="overflow-x-auto bg-[#0a0a0c] p-4 font-mono text-[11px] leading-relaxed text-text-muted">{{ curlExample }}</pre>
              </div>
              <div class="overflow-hidden rounded-xl border border-border">
                <div class="flex items-center justify-between border-b border-border bg-surface-elevated px-4 py-2">
                  <span class="font-mono text-[10px] text-text-subtle">response.json</span>
                  <span class="rounded-full bg-success/15 px-2 py-0.5 text-[10px] font-semibold text-success">200 OK</span>
                </div>
                <pre class="overflow-x-auto bg-[#0a0a0c] p-4 font-mono text-[11px] leading-relaxed" v-html="highlightJson(jsonResponse)" />
              </div>
            </div>
          </section>

          <section id="response" class="scroll-mt-24">
            <h2 class="text-xl font-bold text-text">Response Format</h2>
            <p class="mt-3 text-sm text-text-muted">All successful quotes return <code class="font-mono text-accent">currency: "GHS"</code> with pricing in <code class="font-mono text-accent">price_ghs</code>.</p>
            <div class="mt-4 grid gap-3 sm:grid-cols-2">
              <div v-for="field in [
                { key: 'distance_km', desc: 'Road distance in kilometres (OSM routing).' },
                { key: 'duration_mins', desc: 'Estimated travel time in minutes.' },
                { key: 'price_ghs', desc: 'Final quote in Ghana Cedis.' },
                { key: 'vehicle', desc: 'Human-readable vehicle label.' },
              ]" :key="field.key" class="ft-card p-4">
                <p class="font-mono text-xs text-accent">{{ field.key }}</p>
                <p class="mt-1 text-xs text-text-muted">{{ field.desc }}</p>
              </div>
            </div>
          </section>

          <section id="vehicles" class="scroll-mt-24">
            <h2 class="text-xl font-bold text-text">Vehicle Types</h2>
            <div class="mt-4 grid gap-3 sm:grid-cols-3">
              <div v-for="v in vehicles" :key="v.id" class="ft-card p-4">
                <p class="font-mono text-xs font-semibold text-accent">{{ v.id }}</p>
                <p class="mt-1 text-sm font-medium text-text">{{ v.label }}</p>
                <p class="mt-1 text-xs text-text-muted">{{ v.desc }}</p>
              </div>
            </div>
          </section>

          <section id="errors" class="scroll-mt-24">
            <h2 class="text-xl font-bold text-text">Error Codes</h2>
            <div class="mt-4 overflow-hidden rounded-xl border border-border">
              <table class="w-full text-left text-xs">
                <thead class="border-b border-border bg-surface-muted">
                  <tr>
                    <th class="px-4 py-2.5 text-text-muted">HTTP</th>
                    <th class="px-4 py-2.5 text-text-muted">Code</th>
                    <th class="px-4 py-2.5 text-text-muted">Description</th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-for="e in errors" :key="e.code" class="border-b border-border/50 last:border-0">
                    <td class="px-4 py-2.5 font-mono text-text">{{ e.code }}</td>
                    <td class="px-4 py-2.5 font-mono text-accent">{{ e.name }}</td>
                    <td class="px-4 py-2.5 text-text-muted">{{ e.desc }}</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </section>

          <section id="rate-limits" class="scroll-mt-24">
            <h2 class="text-xl font-bold text-text">Rate Limits</h2>
            <div class="mt-4 grid gap-3 sm:grid-cols-2">
              <div class="ft-card p-5">
                <p class="text-sm font-semibold text-text">Free Tier</p>
                <p class="mt-2 text-2xl font-bold text-text">500 <span class="text-sm font-normal text-text-muted">/ month</span></p>
              </div>
              <div class="ft-card-glow border-accent/30 p-5">
                <p class="text-sm font-semibold text-accent">Pay-As-You-Go</p>
                <p class="mt-2 text-2xl font-bold text-accent">Unlimited <span class="text-sm font-normal text-text-muted">@ GH₵ 0.10/call</span></p>
              </div>
            </div>
          </section>
        </main>
      </div>
    </div>

    <footer class="border-t border-border py-8">
      <div class="mx-auto flex max-w-6xl flex-col items-center justify-between gap-4 px-4 sm:flex-row sm:px-6">
        <p class="text-xs text-text-subtle">
          &copy; {{ new Date().getFullYear() }} {{ brand.name }} · {{ brand.org }} {{ brand.dept }}
        </p>
        <RouterLink to="/" class="text-xs text-text-subtle transition-colors hover:text-accent">← Back to home</RouterLink>
      </div>
    </footer>
  </div>
</template>

<style scoped>
pre :deep(.text-sky-400) { color: #38bdf8; }
pre :deep(.text-emerald-400) { color: #34d399; }
pre :deep(.text-amber-400) { color: #fbbf24; }
</style>
