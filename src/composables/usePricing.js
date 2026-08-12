import { ref, reactive, computed } from 'vue'
import {
  calculateQuote as calculateQuoteFromRates,
  defaultRates,
  getMockRoute,
  vehicleTypes,
} from '../utils/pricing.js'

const rates = reactive(structuredClone(defaultRates))
const apiCalls = ref(1247)
const totalSpend = ref(124.7)
const walletBalance = ref(45.2)

export function usePricing() {
  function calculateQuote(vehicle, distanceKm, durationMins) {
    return calculateQuoteFromRates(rates, vehicle, distanceKm, durationMins)
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

export { getMockRoute }
