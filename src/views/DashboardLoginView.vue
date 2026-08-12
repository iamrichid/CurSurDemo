<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useAuth } from '../composables/useAuth.js'
import { useToast } from '../composables/useToast.js'
import {
  loginAccount,
  registerAccount,
  regenerateApiKey,
  DashboardApiError,
} from '../services/dashboardApi.js'
import { brand } from '../data/brand.js'

const router = useRouter()
const route = useRoute()
const { setSession } = useAuth()
const toast = useToast()

const mode = ref('register')
const orgName = ref('')
const email = ref('')
const password = ref('')
const loading = ref(false)
const error = ref('')
const newApiKey = ref('')
const needsKey = ref(false)
const signedInOrg = ref('')

const intent = computed(() => route.query.intent)
const redirectPath = computed(() => {
  const redirect = route.query.redirect
  return typeof redirect === 'string' && redirect.startsWith('/dashboard')
    ? redirect
    : '/dashboard/overview'
})

const headline = computed(() => {
  if (intent.value === 'key') return 'Get your API key'
  if (intent.value === 'dashboard') return 'Sign in to your dashboard'
  return `${brand.name} Developer Portal`
})

const subcopy = computed(() => {
  if (intent.value === 'key') {
    return 'Create a free account or sign in to receive your Bearer token for live API calls.'
  }
  if (needsKey.value) {
    return 'Your account is verified. Generate an API key to use on this device.'
  }
  return 'Create an account to get your API key, wallet credit, and dashboard access.'
})

onMounted(() => {
  if (intent.value === 'key' || intent.value === 'dashboard') {
    mode.value = intent.value === 'dashboard' ? 'login' : 'register'
  }
})

async function handleRegister() {
  loading.value = true
  error.value = ''
  newApiKey.value = ''
  needsKey.value = false
  try {
    const data = await registerAccount({
      org_name: orgName.value,
      email: email.value,
      password: password.value,
    })
    setSession({ api_key: data.api_key, account: data.account })
    newApiKey.value = data.api_key
    toast.success('Account created — welcome credit applied')
    if (data.email_sent) {
      toast.info('Welcome email sent — check your inbox')
    }
  } catch (err) {
    error.value =
      err instanceof DashboardApiError ? err.message : 'Registration failed.'
    toast.error(error.value)
  } finally {
    loading.value = false
  }
}

async function handleLogin() {
  loading.value = true
  error.value = ''
  needsKey.value = false
  try {
    const data = await loginAccount({
      email: email.value,
      password: password.value,
    })
    const existingKey = localStorage.getItem('any3mi-api-key')
    if (existingKey) {
      setSession({ account: data.account, key_prefix: data.key_prefix })
      toast.success('Welcome back')
      router.push(redirectPath.value)
      return
    }
    setSession({ account: data.account, key_prefix: data.key_prefix })
    signedInOrg.value = data.account?.org_name || email.value
    needsKey.value = true
    toast.info('Signed in — generate a key for this device')
  } catch (err) {
    error.value =
      err instanceof DashboardApiError ? err.message : 'Login failed.'
    toast.error(error.value)
  } finally {
    loading.value = false
  }
}

async function handleRegenerate() {
  loading.value = true
  error.value = ''
  newApiKey.value = ''
  try {
    const data = await regenerateApiKey({
      email: email.value,
      password: password.value,
    })
    setSession({ api_key: data.api_key, account: data.account })
    newApiKey.value = data.api_key
    needsKey.value = false
    toast.success('New API key generated')
    if (data.email_sent) {
      toast.info('Security notice sent to your email')
    }
  } catch (err) {
    error.value =
      err instanceof DashboardApiError ? err.message : 'Could not regenerate key.'
    toast.error(error.value)
  } finally {
    loading.value = false
  }
}

function continueToDashboard() {
  router.push(redirectPath.value)
}

async function copyKey() {
  if (!newApiKey.value) return
  try {
    await navigator.clipboard.writeText(newApiKey.value)
    toast.success('API key copied to clipboard')
  } catch {
    toast.error('Could not copy — select the key manually')
  }
}
</script>

<template>
  <div class="flex min-h-screen items-center justify-center bg-surface px-4 py-12 mesh-bg">
    <div class="w-full max-w-md">
      <div class="mb-8 text-center">
        <div class="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-accent text-sm font-bold text-accent-foreground shadow-sm shadow-accent/20">
          A3
        </div>
        <h1 class="text-2xl font-bold text-text">{{ headline }}</h1>
        <p class="mt-2 text-sm text-text-muted">{{ subcopy }}</p>
      </div>

      <div v-if="newApiKey" class="ft-card-glow p-6">
        <p class="text-xs font-semibold uppercase tracking-wider text-accent">Your API key</p>
        <p class="mt-2 text-sm text-text-muted">
          Copy this now — you won't see the full key again unless you regenerate it.
        </p>
        <pre class="mt-4 overflow-x-auto rounded-xl border border-accent/30 bg-surface-muted p-4 font-mono text-[11px] text-text">{{ newApiKey }}</pre>
        <div class="mt-4 flex gap-3">
          <button type="button" class="ft-btn-primary flex-1 py-2.5 text-sm" @click="copyKey">
            Copy key
          </button>
          <button type="button" class="flex-1 rounded-lg border border-border py-2.5 text-sm font-medium text-text-muted transition-colors hover:border-accent/40 hover:text-accent" @click="continueToDashboard">
            Open dashboard
          </button>
        </div>
      </div>

      <div v-else-if="needsKey" class="ft-card-glow p-6">
        <p class="text-xs font-semibold uppercase tracking-wider text-accent">Key required on this device</p>
        <p class="mt-2 text-sm text-text-muted">
          Signed in as <span class="font-medium text-text">{{ signedInOrg }}</span>.
          Your API key isn't stored here yet — generate one to continue.
        </p>
        <p class="mt-3 rounded-lg border border-warning/30 bg-warning/10 px-3 py-2 text-xs text-warning">
          Generating a new key revokes the previous one. Update any apps still using the old key.
        </p>
        <p v-if="error" class="mt-3 rounded-lg border border-danger/30 bg-danger/10 px-3 py-2 text-xs text-danger">
          {{ error }}
        </p>
        <button
          type="button"
          class="ft-btn-primary mt-4 w-full py-3 text-sm disabled:opacity-60"
          :disabled="loading"
          @click="handleRegenerate"
        >
          {{ loading ? 'Generating…' : 'Generate API key for this device' }}
        </button>
      </div>

      <div v-else class="ft-card-glow p-6">
        <div class="mb-6 flex rounded-lg border border-border bg-surface-muted p-1">
          <button
            type="button"
            class="flex-1 rounded-md py-2 text-xs font-semibold transition-colors"
            :class="mode === 'register' ? 'bg-accent-muted text-accent' : 'text-text-muted'"
            @click="mode = 'register'"
          >
            Register
          </button>
          <button
            type="button"
            class="flex-1 rounded-md py-2 text-xs font-semibold transition-colors"
            :class="mode === 'login' ? 'bg-accent-muted text-accent' : 'text-text-muted'"
            @click="mode = 'login'"
          >
            Sign in
          </button>
        </div>

        <form class="space-y-4" @submit.prevent="mode === 'register' ? handleRegister() : handleLogin()">
          <div v-if="mode === 'register'">
            <label class="mb-1.5 block text-xs font-medium text-text-muted">Organization</label>
            <input
              v-model="orgName"
              type="text"
              required
              placeholder="Accra Delivery Co."
              class="w-full rounded-lg border border-border bg-surface px-3 py-2.5 text-sm text-text outline-none focus:border-accent focus:ring-2 focus:ring-accent/20"
            />
          </div>

          <div>
            <label class="mb-1.5 block text-xs font-medium text-text-muted">Email</label>
            <input
              v-model="email"
              type="email"
              required
              class="w-full rounded-lg border border-border bg-surface px-3 py-2.5 text-sm text-text outline-none focus:border-accent focus:ring-2 focus:ring-accent/20"
            />
          </div>

          <div>
            <label class="mb-1.5 block text-xs font-medium text-text-muted">Password</label>
            <input
              v-model="password"
              type="password"
              required
              minlength="8"
              class="w-full rounded-lg border border-border bg-surface px-3 py-2.5 text-sm text-text outline-none focus:border-accent focus:ring-2 focus:ring-accent/20"
            />
          </div>

          <p v-if="error" class="rounded-lg border border-danger/30 bg-danger/10 px-3 py-2 text-xs text-danger">
            {{ error }}
          </p>

          <button
            type="submit"
            class="ft-btn-primary w-full py-3 text-sm disabled:opacity-60"
            :disabled="loading"
          >
            {{ loading ? 'Please wait…' : mode === 'register' ? 'Create account & get API key' : 'Sign in' }}
          </button>
        </form>

        <button
          v-if="mode === 'login'"
          type="button"
          class="mt-4 w-full text-xs text-text-subtle transition-colors hover:text-accent"
          @click="handleRegenerate"
        >
          Already signed in elsewhere? Regenerate key with email &amp; password
        </button>
      </div>
    </div>
  </div>
</template>
