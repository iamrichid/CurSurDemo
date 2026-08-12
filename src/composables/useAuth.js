const STORAGE_KEY = 'any3mi-api-key'
const ACCOUNT_KEY = 'any3mi-account'

function readAccount() {
  try {
    const raw = localStorage.getItem(ACCOUNT_KEY)
    return raw ? JSON.parse(raw) : null
  } catch {
    return null
  }
}

const apiKey = { value: localStorage.getItem(STORAGE_KEY) || '' }
const account = { value: readAccount() }

export function useAuth() {
  function setSession({ api_key, account: nextAccount, key_prefix }) {
    if (api_key) {
      apiKey.value = api_key
      localStorage.setItem(STORAGE_KEY, api_key)
    }
    if (nextAccount) {
      account.value = nextAccount
      localStorage.setItem(ACCOUNT_KEY, JSON.stringify(nextAccount))
    }
    if (key_prefix && !api_key) {
      account.value = { ...account.value, key_prefix }
    }
  }

  function logout() {
    apiKey.value = ''
    account.value = null
    localStorage.removeItem(STORAGE_KEY)
    localStorage.removeItem(ACCOUNT_KEY)
  }

  function getApiKey() {
    return apiKey.value || import.meta.env.VITE_ANY3MI_API_KEY || ''
  }

  function isAuthenticated() {
    return Boolean(getApiKey())
  }

  function getAccount() {
    return account.value
  }

  function getKeyPrefix() {
    const key = getApiKey()
    if (key) return `${key.slice(0, 12)}••••••••${key.slice(-4)}`
    return account.value?.key_prefix || null
  }

  function getInitials() {
    const name = account.value?.org_name || 'A3'
    return name
      .split(/\s+/)
      .filter(Boolean)
      .slice(0, 2)
      .map((part) => part[0]?.toUpperCase() || '')
      .join('') || 'A3'
  }

  return {
    setSession,
    logout,
    getApiKey,
    isAuthenticated,
    getAccount,
    getKeyPrefix,
    getInitials,
  }
}

export function getStoredApiKey() {
  return localStorage.getItem(STORAGE_KEY) || import.meta.env.VITE_ANY3MI_API_KEY || ''
}
