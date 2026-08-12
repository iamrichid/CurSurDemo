<script setup>
import { ref, onMounted } from 'vue'
import { useAuth } from '../../composables/useAuth.js'
import { useToast } from '../../composables/useToast.js'
import { fetchMe, rotateApiKey, DashboardApiError } from '../../services/dashboardApi.js'

const { setSession, getKeyPrefix } = useAuth()
const toast = useToast()

const keyPrefix = ref(getKeyPrefix() || 'No key')
const loading = ref(false)
const error = ref('')
const newApiKey = ref('')
const copied = ref(false)

onMounted(async () => {
  try {
    const data = await fetchMe()
    if (data.key_prefix) keyPrefix.value = data.key_prefix
  } catch {
    // use cached prefix
  }
})

async function handleRotate() {
  if (!confirm('This will revoke your current API key. Continue?')) return
  loading.value = true
  error.value = ''
  newApiKey.value = ''
  try {
    const data = await rotateApiKey()
    setSession({ api_key: data.api_key })
    newApiKey.value = data.api_key
    keyPrefix.value = data.key_prefix
    toast.success('API key rotated — copy your new key now')
  } catch (err) {
    error.value =
      err instanceof DashboardApiError ? err.message : 'Could not rotate API key.'
    toast.error(error.value)
  } finally {
    loading.value = false
  }
}

async function copyKey() {
  if (!newApiKey.value) return
  try {
    await navigator.clipboard.writeText(newApiKey.value)
    copied.value = true
    toast.success('API key copied')
    setTimeout(() => { copied.value = false }, 2000)
  } catch {
    toast.error('Could not copy key')
  }
}
</script>

<template>
  <div
    v-motion
    :initial="{ opacity: 0, y: 12 }"
    :enter="{ opacity: 1, y: 0, transition: { duration: 400 } }"
  >
    <div class="mb-6">
      <h1 class="text-2xl font-bold text-text">API Keys</h1>
      <p class="mt-1 text-sm text-text-muted">
        Manage credentials for the ANY3MI REST API.
      </p>
    </div>

    <div class="grid gap-6 lg:grid-cols-2">
      <div class="ft-card-glow p-6">
        <p class="text-xs font-semibold uppercase tracking-wider text-text-subtle">Active key</p>
        <p class="mt-3 font-mono text-sm text-text">{{ keyPrefix }}</p>
        <p class="mt-3 text-xs leading-relaxed text-text-muted">
          Use this key in the <code class="rounded bg-surface-muted px-1 py-0.5 font-mono text-accent">Authorization: Bearer</code> header.
          The full secret is only shown once when created or rotated.
        </p>

        <button
          type="button"
          class="mt-5 rounded-lg border border-border px-4 py-2 text-xs font-medium text-text-muted transition-colors hover:border-accent/40 hover:text-accent disabled:opacity-60"
          :disabled="loading"
          @click="handleRotate"
        >
          {{ loading ? 'Rotating…' : 'Rotate API key' }}
        </button>

        <p v-if="error" class="mt-3 rounded-lg border border-danger/30 bg-danger/10 px-3 py-2 text-xs text-danger">
          {{ error }}
        </p>
      </div>

      <div v-if="newApiKey" class="ft-card-glow border-accent/30 p-6">
        <p class="text-xs font-semibold uppercase tracking-wider text-accent">New API key</p>
        <p class="mt-2 text-xs text-text-muted">Copy this now — you won't see it again.</p>
        <pre class="mt-4 overflow-x-auto rounded-xl border border-accent/30 bg-surface-muted p-4 font-mono text-[11px] text-text">{{ newApiKey }}</pre>
        <button type="button" class="ft-btn-primary mt-4 px-4 py-2 text-xs" @click="copyKey">
          {{ copied ? 'Copied' : 'Copy key' }}
        </button>
      </div>

      <div v-else class="ft-card p-6">
        <h2 class="text-sm font-semibold text-text">Security tips</h2>
        <ul class="mt-3 space-y-2 text-xs text-text-muted">
          <li>Never expose keys in client-side code or public repos.</li>
          <li>Rotate immediately if a key is leaked.</li>
          <li>Use separate keys for staging and production.</li>
        </ul>
      </div>
    </div>
  </div>
</template>
