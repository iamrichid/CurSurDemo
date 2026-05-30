<script setup>
import { ref } from 'vue'
import { usePricing } from '../../composables/usePricing'

const { rates, vehicleTypes, resetRates } = usePricing()

const pulsingFields = ref(new Set())

function onFieldChange(vehicle, field) {
  const key = `${vehicle}-${field}`
  pulsingFields.value = new Set([...pulsingFields.value, key])
  setTimeout(() => {
    const next = new Set(pulsingFields.value)
    next.delete(key)
    pulsingFields.value = next
  }, 600)
}

function isPulsing(vehicle, field) {
  return pulsingFields.value.has(`${vehicle}-${field}`)
}

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
      <button
        type="button"
        class="rounded-lg border border-border px-3 py-1.5 text-xs font-medium text-text-muted transition-all duration-200 hover:border-accent/40 hover:text-accent"
        @click="resetRates"
      >
        Reset defaults
      </button>
    </div>

    <div class="space-y-6">
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
