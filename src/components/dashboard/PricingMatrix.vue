<script setup>
import { ref, reactive, onMounted, onActivated } from 'vue'
import { defaultRates, vehicleTypes, normalizeRates } from '../../utils/pricing.js'
import { DashboardApiError } from '../../services/dashboardApi.js'
import { useRates } from '../../composables/useRates.js'
import { useToast } from '../../composables/useToast.js'

const toast = useToast()
const ratesStore = useRates()
const { load, persist, syncing } = ratesStore

const rates = reactive(ratesStore.getInitialRates())
const error = ref('')
const saveMessage = ref('')
const saving = ref(false)
const ready = ref(true)
const pulsingFields = ref(new Set())

let saveTimer = null
let hydrating = true

function applyRates(next) {
  const normalized = normalizeRates(next)
  for (const key of Object.keys(rates)) {
    if (!(key in normalized)) delete rates[key]
  }
  Object.assign(rates, normalized)
}

async function refreshRates() {
  error.value = ''
  hydrating = true
  try {
    const fresh = await load({ background: true })
    applyRates(fresh)
  } catch (err) {
    error.value =
      err instanceof DashboardApiError ? err.message : 'Could not load pricing matrix.'
    applyRates(ratesStore.getInitialRates())
    toast.error(error.value)
  } finally {
    hydrating = false
    ready.value = true
  }
}

function scheduleSave() {
  if (hydrating) return
  if (saveTimer) clearTimeout(saveTimer)
  saveTimer = setTimeout(async () => {
    saving.value = true
    saveMessage.value = ''
    try {
      await persist(rates)
      saveMessage.value = 'Saved'
      toast.success('Pricing matrix saved')
      setTimeout(() => { saveMessage.value = '' }, 2000)
    } catch (err) {
      error.value =
        err instanceof DashboardApiError ? err.message : 'Could not save pricing matrix.'
      toast.error(error.value)
    } finally {
      saving.value = false
    }
  }, 600)
}

function onFieldChange(vehicle, field) {
  const key = `${vehicle}-${field}`
  pulsingFields.value = new Set([...pulsingFields.value, key])
  setTimeout(() => {
    const next = new Set(pulsingFields.value)
    next.delete(key)
    pulsingFields.value = next
  }, 600)
  scheduleSave()
}

function isPulsing(vehicle, field) {
  return pulsingFields.value.has(`${vehicle}-${field}`)
}

async function resetRates() {
  applyRates(defaultRates)
  scheduleSave()
  toast.info('Reset to default rates')
}

function samplePrice(vehicle) {
  const row = rates[vehicle]
  if (!row) return '0.00'
  const total =
    Number(row.baseFare || 0) +
    8.4 * Number(row.perKm || 0) +
    24 * Number(row.perMinute || 0)
  return Number.isFinite(total) ? total.toFixed(2) : '0.00'
}

onMounted(refreshRates)
onActivated(refreshRates)

const vehicleAbbr = { bicycle: 'Bi', motorbike: 'Mo', car: 'Ca' }

const fieldLabels = {
  baseFare: 'Base Fare (GH₵)',
  perKm: 'Per KM Rate (GH₵)',
  perMinute: 'Per Minute Rate (GH₵)',
}
</script>

<template>
  <div>
    <div class="mb-6 flex items-start justify-between gap-4">
      <div>
        <h1 class="text-2xl font-bold text-text">Pricing Matrix</h1>
        <p class="mt-1 text-sm text-text-muted">
          Configure base fares and rates. Changes apply instantly to new quotes.
        </p>
      </div>
      <div class="flex shrink-0 items-center gap-3">
        <span v-if="syncing" class="text-xs text-text-subtle">Syncing…</span>
        <span v-else-if="saving" class="text-xs text-text-subtle">Saving…</span>
        <span v-else-if="saveMessage" class="text-xs font-medium text-success">{{ saveMessage }}</span>
        <button
          type="button"
          class="rounded-lg border border-border px-3 py-1.5 text-xs font-medium text-text-muted transition-all duration-200 hover:border-accent/40 hover:text-accent"
          @click="resetRates"
        >
          Reset defaults
        </button>
      </div>
    </div>

    <p v-if="error" class="mb-4 rounded-lg border border-danger/30 bg-danger/10 px-3 py-2 text-xs text-danger">
      {{ error }}
    </p>

    <div v-if="ready" class="space-y-6">
      <div
        v-for="vehicle in vehicleTypes"
        :key="vehicle"
        class="ft-card p-6"
      >
        <h2 class="mb-4 flex items-center gap-2 text-sm font-semibold text-text">
          <span class="flex h-7 w-7 items-center justify-center rounded-lg bg-accent-muted text-[10px] font-bold uppercase text-accent">
            {{ vehicleAbbr[vehicle] }}
          </span>
          {{ rates[vehicle]?.label || vehicle }}
        </h2>

        <div v-if="rates[vehicle]" class="grid gap-4 sm:grid-cols-3">
          <div
            v-for="field in ['baseFare', 'perKm', 'perMinute']"
            :key="field"
          >
            <label class="mb-1.5 block text-xs font-medium text-text-muted">
              {{ fieldLabels[field] }}
            </label>
            <input
              v-model.number="rates[vehicle][field]"
              type="number"
              min="0"
              step="0.05"
              class="w-full rounded-lg border border-border bg-surface px-3 py-2.5 font-mono text-sm text-text outline-none transition-all duration-200 focus:border-accent focus:ring-2 focus:ring-accent/20"
              :class="{ 'pulse-field border-accent/50': isPulsing(vehicle, field) }"
              @input="onFieldChange(vehicle, field)"
            />
          </div>
        </div>

        <div class="mt-4 rounded-lg bg-surface-muted px-4 py-3 font-mono text-xs text-text-muted">
          Sample quote (8.4 km, 24 min):
          <span class="ml-1 font-semibold text-accent">
            GH₵ {{ samplePrice(vehicle) }}
          </span>
        </div>
      </div>
    </div>
  </div>
</template>
