<script setup>
import { ref, reactive, onMounted } from 'vue'
import { defaultRates, vehicleTypes } from '../../utils/pricing.js'
import { fetchRates, saveRates, DashboardApiError } from '../../services/dashboardApi.js'

const rates = reactive(structuredClone(defaultRates))
const loading = ref(true)
const saving = ref(false)
const error = ref('')
const saveMessage = ref('')
const pulsingFields = ref(new Set())

let saveTimer = null

async function loadRates() {
  loading.value = true
  error.value = ''
  try {
    const data = await fetchRates()
    Object.assign(rates, structuredClone(data.rates))
  } catch (err) {
    error.value =
      err instanceof DashboardApiError ? err.message : 'Could not load pricing matrix.'
    Object.assign(rates, structuredClone(defaultRates))
  } finally {
    loading.value = false
  }
}

function scheduleSave() {
  if (saveTimer) clearTimeout(saveTimer)
  saveTimer = setTimeout(async () => {
    saving.value = true
    saveMessage.value = ''
    try {
      await saveRates(rates)
      saveMessage.value = 'Saved'
      setTimeout(() => { saveMessage.value = '' }, 2000)
    } catch (err) {
      error.value =
        err instanceof DashboardApiError ? err.message : 'Could not save pricing matrix.'
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
  Object.assign(rates, structuredClone(defaultRates))
  scheduleSave()
}

onMounted(loadRates)

const fieldLabels = {
  baseFare: 'Base Fare (GH₵)',
  perKm: 'Per KM Rate (GH₵)',
  perMinute: 'Per Minute Rate (GH₵)',
}
</script>

<template>
  <div
    v-motion
    :initial="{ opacity: 0, y: 12 }"
    :enter="{ opacity: 1, y: 0, transition: { duration: 400 } }"
  >
    <div class="mb-6 flex items-start justify-between">
      <div>
        <h1 class="text-2xl font-bold text-text">Pricing Matrix</h1>
        <p class="mt-1 text-sm text-text-muted">
          Configure base fares and rates. Changes apply instantly to new quotes.
        </p>
      </div>
      <div class="flex items-center gap-3">
        <span v-if="saving" class="text-xs text-text-subtle">Saving…</span>
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

    <p v-if="loading" class="text-sm text-text-subtle">Loading rates…</p>

    <div v-else class="space-y-6">
      <div
        v-for="(vehicle, vi) in vehicleTypes"
        :key="vehicle"
        class="ft-card p-6"
        v-motion
        :initial="{ opacity: 0, y: 16 }"
        :enter="{ opacity: 1, y: 0, transition: { delay: vi * 100, duration: 400 } }"
      >
        <h2 class="mb-4 flex items-center gap-2 text-sm font-semibold text-text">
          <span class="flex h-7 w-7 items-center justify-center rounded-lg bg-accent-muted text-xs">
            {{ vehicle === 'bicycle' ? '🚲' : vehicle === 'motorbike' ? '🏍️' : '🚗' }}
          </span>
          {{ rates[vehicle].label }}
        </h2>

        <div class="grid gap-4 sm:grid-cols-3">
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
            GH₵ {{
              (
                rates[vehicle].baseFare +
                8.4 * rates[vehicle].perKm +
                24 * rates[vehicle].perMinute
              ).toFixed(2)
            }}
          </span>
        </div>
      </div>
    </div>
  </div>
</template>
