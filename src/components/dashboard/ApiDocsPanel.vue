<script setup>
const curlExample = `curl -X POST https://api.any3mi.com/v1/quote \\
  -H "Authorization: Bearer a3_live_sk_abc123" \\
  -H "Content-Type: application/json" \\
  -d '{
    "origin": { "lat": 5.638, "lng": -0.154 },
    "destination": { "lat": 5.571, "lng": -0.214 },
    "vehicle": "motorbike"
  }'`

const jsonResponse = `{
  "status": "success",
  "route": {
    "origin": "East Legon",
    "destination": "Circle, Accra"
  },
  "vehicle": "Motorbike (Okada)",
  "distance_km": 8.4,
  "duration_mins": 24,
  "price_ghs": 32.50,
  "currency": "GHS"
}`

const endpoints = [
  { method: 'POST', path: '/v1/quote', desc: 'Get a pricing quote for a route' },
  { method: 'GET', path: '/v1/health', desc: 'Check API status' },
  { method: 'GET', path: '/v1/rates', desc: 'Retrieve your pricing matrix' },
]

function highlightJson(json) {
  return json
    .replace(/"([^"]+)":/g, '<span class="text-sky-400">"$1"</span>:')
    .replace(/: "([^"]+)"/g, ': <span class="text-emerald-400">"$1"</span>')
    .replace(/: (\d+\.?\d*)/g, ': <span class="text-amber-400">$1</span>')
}
</script>

<template>
  <div
    v-motion
    :initial="{ opacity: 0, y: 12 }"
    :enter="{ opacity: 1, y: 0, transition: { duration: 400 } }"
  >
    <div class="mb-6">
      <h1 class="text-2xl font-bold text-text">API Documentation</h1>
      <p class="mt-1 text-sm text-text-muted">Integration reference for the ANY3MI API.</p>
    </div>

    <div class="mb-6 grid gap-3 sm:grid-cols-3">
      <div
        v-for="(ep, i) in endpoints"
        :key="ep.path"
        class="ft-card p-4"
        v-motion
        :initial="{ opacity: 0, y: 12 }"
        :enter="{ opacity: 1, y: 0, transition: { delay: i * 80, duration: 400 } }"
      >
        <div class="flex items-center gap-2">
          <span
            class="rounded px-1.5 py-0.5 font-mono text-[10px] font-bold"
            :class="ep.method === 'POST' ? 'bg-success/15 text-success' : 'bg-accent/15 text-accent'"
          >
            {{ ep.method }}
          </span>
          <span class="font-mono text-xs text-text">{{ ep.path }}</span>
        </div>
        <p class="mt-2 text-xs text-text-muted">{{ ep.desc }}</p>
      </div>
    </div>

    <div class="grid gap-6 lg:grid-cols-2">
      <div class="overflow-hidden rounded-xl border border-border">
        <div class="flex items-center gap-2 border-b border-border bg-surface-elevated px-4 py-2.5">
          <span class="h-2 w-2 rounded-full bg-danger/80" />
          <span class="h-2 w-2 rounded-full bg-warning/80" />
          <span class="h-2 w-2 rounded-full bg-success/80" />
          <span class="ml-2 font-mono text-xs text-text-subtle">request.sh</span>
        </div>
        <pre class="overflow-x-auto bg-surface-muted p-4 font-mono text-xs leading-relaxed text-text-muted sm:text-sm"><code>{{ curlExample }}</code></pre>
      </div>

      <div class="overflow-hidden rounded-xl border border-border">
        <div class="flex items-center justify-between border-b border-border bg-surface-elevated px-4 py-2.5">
          <div class="flex items-center gap-2">
            <span class="h-2 w-2 rounded-full bg-danger/80" />
            <span class="h-2 w-2 rounded-full bg-warning/80" />
            <span class="h-2 w-2 rounded-full bg-success/80" />
            <span class="ml-2 font-mono text-xs text-text-subtle">response.json</span>
          </div>
          <span class="rounded-full bg-success/15 px-2 py-0.5 text-[10px] font-semibold text-success">200 OK</span>
        </div>
        <pre
          class="overflow-x-auto bg-surface-muted p-4 font-mono text-xs leading-relaxed sm:text-sm"
          v-html="highlightJson(jsonResponse)"
        />
      </div>
    </div>

    <div class="mt-6 ft-card p-5">
      <h3 class="text-sm font-semibold text-text">Authentication</h3>
      <p class="mt-2 text-xs leading-relaxed text-text-muted">
        Include your API key in the <code class="rounded bg-surface-muted px-1 py-0.5 font-mono text-accent">Authorization</code> header as a Bearer token. Keys are available in your dashboard under Settings.
      </p>
    </div>
  </div>
</template>
