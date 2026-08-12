import { ref } from 'vue'
import { defaultRates } from '../utils/pricing.js'
import { fetchRates, saveRates } from '../services/dashboardApi.js'

const CACHE_KEY = 'any3mi-rates-cache'
const CACHE_TS_KEY = 'any3mi-rates-cache-ts'
const TTL_MS = 10 * 60 * 1000

let inflight = null
const sharedRates = ref(null)
const loading = ref(false)
const syncing = ref(false)
const loadedOnce = ref(false)

function readCache() {
  try {
    const raw = sessionStorage.getItem(CACHE_KEY)
    const ts = Number(sessionStorage.getItem(CACHE_TS_KEY) || 0)
    if (!raw || Date.now() - ts > TTL_MS) return null
    return JSON.parse(raw)
  } catch {
    return null
  }
}

function writeCache(rates) {
  try {
    sessionStorage.setItem(CACHE_KEY, JSON.stringify(rates))
    sessionStorage.setItem(CACHE_TS_KEY, String(Date.now()))
  } catch {
    // storage full or unavailable
  }
}

export function invalidateRatesCache() {
  sharedRates.value = null
  loadedOnce.value = false
  sessionStorage.removeItem(CACHE_KEY)
  sessionStorage.removeItem(CACHE_TS_KEY)
}

export function useRates() {
  function getInitialRates() {
    const source = sharedRates.value || readCache() || defaultRates
    return structuredClone(source)
  }

  async function load({ background = false } = {}) {
    if (inflight) return inflight

    const cached = readCache()
    if (cached && !sharedRates.value) {
      sharedRates.value = cached
    }

    const showBlockingLoader = !background && !sharedRates.value && !cached
    if (showBlockingLoader) loading.value = true
    syncing.value = true

    inflight = (async () => {
      try {
        const data = await fetchRates()
        sharedRates.value = data.rates
        writeCache(data.rates)
        loadedOnce.value = true
        return data.rates
      } finally {
        loading.value = false
        syncing.value = false
        inflight = null
      }
    })()

    return inflight
  }

  async function persist(rates) {
    const data = await saveRates(rates)
    sharedRates.value = structuredClone(rates)
    writeCache(sharedRates.value)
    return data
  }

  function invalidateCache() {
    invalidateRatesCache()
  }

  return {
    sharedRates,
    loading,
    syncing,
    loadedOnce,
    getInitialRates,
    load,
    persist,
    invalidateCache,
  }
}
