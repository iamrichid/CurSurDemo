<script setup>
import { ref, watch, onMounted, onBeforeUnmount, nextTick } from 'vue'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'

const props = defineProps({
  origin: { type: Object, default: null },
  destination: { type: Object, default: null },
  geometry: { type: Object, default: null },
  loading: { type: Boolean, default: false },
})

const mapRoot = ref(null)
let map = null
let routeLayer = null
let markerLayer = null

const TILE_URL = 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png'
const TILE_ATTRIBUTION =
  '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'

function toLatLngRing(geometry) {
  if (!geometry?.coordinates?.length) return []
  return geometry.coordinates.map(([lng, lat]) => [lat, lng])
}

function fallbackLine(origin, destination) {
  if (!origin || !destination) return []
  return [
    [origin.lat, origin.lng],
    [destination.lat, destination.lng],
  ]
}

function boundsForPoints(points) {
  if (!points.length) return null
  return L.latLngBounds(points)
}

function makePin(color, label) {
  return L.divIcon({
    className: '',
    html: `<span style="
      display:flex;align-items:center;justify-content:center;
      width:28px;height:28px;border-radius:9999px;
      background:${color};color:#fff;font-size:10px;font-weight:700;
      border:2px solid rgba(255,255,255,0.95);
      box-shadow:0 4px 12px rgba(0,0,0,0.35);
    ">${label}</span>`,
    iconSize: [28, 28],
    iconAnchor: [14, 14],
  })
}

function renderRoute() {
  if (!map) return

  if (routeLayer) {
    routeLayer.remove()
    routeLayer = null
  }
  if (markerLayer) {
    markerLayer.remove()
    markerLayer = null
  }

  const origin = props.origin
  const destination = props.destination
  if (!origin || !destination) return

  const line = props.geometry?.coordinates?.length >= 2
    ? toLatLngRing(props.geometry)
    : fallbackLine(origin, destination)
  if (line.length >= 2) {
    routeLayer = L.polyline(line, {
      color: '#6366f1',
      weight: 5,
      opacity: 0.9,
      lineCap: 'round',
      lineJoin: 'round',
    }).addTo(map)
  }

  markerLayer = L.layerGroup([
    L.marker([origin.lat, origin.lng], { icon: makePin('#22c55e', 'A') }).bindTooltip(
      origin.label || 'Pickup',
      { direction: 'top', offset: [0, -12] }
    ),
    L.marker([destination.lat, destination.lng], { icon: makePin('#ef4444', 'B') }).bindTooltip(
      destination.label || 'Drop-off',
      { direction: 'top', offset: [0, -12] }
    ),
  ]).addTo(map)

  const bounds = boundsForPoints([
    [origin.lat, origin.lng],
    [destination.lat, destination.lng],
    ...line,
  ])
  if (bounds) {
    map.fitBounds(bounds, { padding: [28, 28], maxZoom: 14 })
  }
}

function initMap() {
  if (!mapRoot.value || map) return

  map = L.map(mapRoot.value, {
    zoomControl: true,
    attributionControl: true,
  }).setView([5.6037, -0.187], 12)

  L.tileLayer(TILE_URL, {
    attribution: TILE_ATTRIBUTION,
    maxZoom: 19,
  }).addTo(map)

  renderRoute()
}

function destroyMap() {
  if (map) {
    map.remove()
    map = null
    routeLayer = null
    markerLayer = null
  }
}

onMounted(async () => {
  await nextTick()
  initMap()
})

onBeforeUnmount(destroyMap)

watch(
  () => [props.origin, props.destination, props.geometry, props.loading],
  async () => {
    await nextTick()
    if (!map && mapRoot.value) initMap()
    else renderRoute()
  },
  { deep: true }
)
</script>

<template>
  <div class="relative overflow-hidden rounded-xl border border-border bg-surface-muted">
    <div
      ref="mapRoot"
      class="h-[220px] w-full min-h-[180px] sm:h-[260px]"
      :class="{ 'opacity-60': loading }"
      aria-label="Route map"
    />
    <div
      v-if="loading"
      class="pointer-events-none absolute inset-0 flex items-center justify-center bg-surface/40 backdrop-blur-[1px]"
    >
      <span class="rounded-full bg-surface-card px-3 py-1 text-[10px] font-medium text-text-muted">
        Routing…
      </span>
    </div>
  </div>
</template>

<style scoped>
:deep(.leaflet-control-attribution) {
  font-size: 9px;
  background: rgba(15, 23, 42, 0.75) !important;
  color: rgb(148, 163, 184) !important;
}

:deep(.leaflet-control-attribution a) {
  color: rgb(129, 140, 248) !important;
}

:deep(.leaflet-bar a) {
  background: var(--color-surface-card);
  color: var(--color-text);
  border-color: var(--color-border);
}
</style>
