import { ref, reactive, computed } from 'vue'

const defaultRates = {
  bicycle: { baseFare: 5, perKm: 1.2, perMinute: 0.15, label: 'Bicycle' },
  motorbike: { baseFare: 8, perKm: 1.8, perMinute: 0.25, label: 'Motorbike (Okada)' },
  car: { baseFare: 15, perKm: 3.5, perMinute: 0.45, label: 'Car' },
}

const rates = reactive(structuredClone(defaultRates))
const apiCalls = ref(1247)
const totalSpend = ref(124.7)
const walletBalance = ref(45.2)

export function usePricing() {
  const vehicleTypes = ['bicycle', 'motorbike', 'car']

  function calculateQuote(vehicle, distanceKm, durationMins) {
    const rate = rates[vehicle]
    if (!rate) return null
    const price =
      rate.baseFare + distanceKm * rate.perKm + durationMins * rate.perMinute
    return {
      vehicle: rate.label,
      distance_km: Math.round(distanceKm * 10) / 10,
      duration_mins: Math.round(durationMins),
      price_ghs: Math.round(price * 100) / 100,
      currency: 'GHS',
    }
  }

  function resetRates() {
    Object.assign(rates, structuredClone(defaultRates))
  }

  const formattedRates = computed(() => rates)

  return {
    rates,
    vehicleTypes,
    apiCalls,
    totalSpend,
    walletBalance,
    calculateQuote,
    resetRates,
    formattedRates,
  }
}

export function getMockRoute() {
  return {
    origin: { name: 'East Legon', lat: 5.638, lng: -0.154 },
    destination: { name: 'Circle, Accra', lat: 5.571, lng: -0.214 },
    distanceKm: 8.4,
    durationMins: 24,
  }
}
