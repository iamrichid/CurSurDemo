<script setup>
import { ref, computed, onMounted } from 'vue'
import {
  fetchWallet,
  topUpWallet,
  DashboardApiError,
} from '../../services/dashboardApi.js'
import { useAuth } from '../../composables/useAuth.js'

const { setSession, getAccount } = useAuth()

const providers = [
  { id: 'mtn', name: 'MTN MoMo', color: 'bg-mtn', textColor: 'text-black', prefix: '024' },
  { id: 'telecel', name: 'Telecel Cash', color: 'bg-telecel', textColor: 'text-white', prefix: '020' },
  { id: 'at', name: 'AT Money', color: 'bg-at', textColor: 'text-white', prefix: '027' },
]

const walletBalance = ref(getAccount()?.wallet_balance ?? 0)
const transactions = ref([])
const costPerCall = ref(0.1)
const loading = ref(true)
const loadError = ref('')

const selectedProvider = ref(null)
const amount = ref(20)
const phone = ref('')
const topping = ref(false)
const topUpSuccess = ref(false)
const topUpError = ref('')
const lastTopUpAmount = ref(0)

const activeProvider = computed(() => providers.find((p) => p.id === selectedProvider.value))
const presetAmounts = [10, 20, 50, 100]

async function loadWallet() {
  loading.value = true
  loadError.value = ''
  try {
    const data = await fetchWallet()
    walletBalance.value = data.balance
    transactions.value = data.transactions || []
    costPerCall.value = data.cost_per_call ?? 0.1
    const account = getAccount()
    if (account) {
      setSession({ account: { ...account, wallet_balance: data.balance } })
    }
  } catch (err) {
    loadError.value =
      err instanceof DashboardApiError ? err.message : 'Could not load wallet.'
  } finally {
    loading.value = false
  }
}

function selectProvider(id) {
  selectedProvider.value = selectedProvider.value === id ? null : id
  topUpSuccess.value = false
  topUpError.value = ''
  phone.value = ''
}

async function handleTopUp() {
  if (!selectedProvider.value || !phone.value) return
  topping.value = true
  topUpSuccess.value = false
  topUpError.value = ''

  try {
    const data = await topUpWallet({
      provider: selectedProvider.value,
      phone: phone.value,
      amount: amount.value,
    })
    walletBalance.value = data.balance
    lastTopUpAmount.value = data.amount
    topUpSuccess.value = true
    const account = getAccount()
    if (account) {
      setSession({ account: { ...account, wallet_balance: data.balance } })
    }
    await loadWallet()
  } catch (err) {
    topUpError.value =
      err instanceof DashboardApiError ? err.message : 'Top-up failed.'
  } finally {
    topping.value = false
  }
}

function formatTxAmount(tx) {
  const sign = tx.amount >= 0 ? '+' : ''
  return `${sign}GH₵ ${Math.abs(tx.amount).toFixed(2)}`
}

function formatDate(ts) {
  return new Date(ts).toLocaleString('en-GH', {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

onMounted(loadWallet)
</script>

<template>
  <div
    v-motion
    :initial="{ opacity: 0, y: 12 }"
    :enter="{ opacity: 1, y: 0, transition: { duration: 400 } }"
  >
    <div class="mb-6">
      <h1 class="text-2xl font-bold text-text">Billing &amp; Wallet</h1>
      <p class="mt-1 text-sm text-text-muted">Top up your wallet via Mobile Money.</p>
    </div>

    <p v-if="loadError" class="mb-4 rounded-lg border border-danger/30 bg-danger/10 px-3 py-2 text-xs text-danger">
      {{ loadError }}
    </p>

    <div class="grid gap-6 lg:grid-cols-5">
      <div class="ft-card-glow p-6 lg:col-span-2">
        <p class="text-xs font-medium text-text-subtle">Current Balance</p>
        <p v-if="loading" class="mt-2 text-sm text-text-subtle">Loading…</p>
        <p v-else class="mt-2 text-4xl font-extrabold text-text">
          GH₵ {{ walletBalance.toFixed(2) }}
        </p>
        <p class="mt-2 text-xs text-text-muted">
          Pay-as-you-go: GH₵ {{ costPerCall.toFixed(2) }} per API call
        </p>

        <Transition name="tab-content">
          <div
            v-if="topUpSuccess"
            class="mt-4 flex items-center gap-2 rounded-lg bg-success/10 px-3 py-2 text-xs font-medium text-success"
          >
            <svg class="h-4 w-4 shrink-0" fill="currentColor" viewBox="0 0 20 20">
              <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd"/>
            </svg>
            Top-up successful — GH₵ {{ lastTopUpAmount.toFixed(2) }} added.
          </div>
        </Transition>

        <div v-if="transactions.length" class="mt-6">
          <p class="mb-3 text-xs font-semibold uppercase tracking-wider text-text-subtle">Recent activity</p>
          <ul class="space-y-2">
            <li
              v-for="tx in transactions.slice(0, 5)"
              :key="tx.id"
              class="flex items-center justify-between rounded-lg border border-border/60 bg-surface-muted/40 px-3 py-2 text-xs"
            >
              <span class="text-text-muted">{{ tx.description || tx.type }}</span>
              <span :class="tx.amount >= 0 ? 'text-success' : 'text-text'">
                {{ formatTxAmount(tx) }}
              </span>
            </li>
          </ul>
        </div>
      </div>

      <div class="ft-card-glow p-6 lg:col-span-3">
        <div class="mb-4 flex items-center justify-between">
          <h2 class="text-sm font-semibold text-text">Mobile Money Top-Up</h2>
          <span class="rounded-md border border-border bg-surface-muted px-2 py-0.5 text-[10px] text-text-subtle">
            Sandbox MoMo
          </span>
        </div>

        <div class="mb-5 grid grid-cols-3 gap-3">
          <button
            v-for="p in providers"
            :key="p.id"
            type="button"
            class="relative overflow-hidden rounded-xl border-2 p-4 text-center transition-all duration-300"
            :class="
              selectedProvider === p.id
                ? 'border-accent scale-[1.02] shadow-lg'
                : 'border-border hover:border-border-strong hover:scale-[1.01]'
            "
            @click="selectProvider(p.id)"
          >
            <div
              class="mx-auto mb-2 flex h-10 w-10 items-center justify-center rounded-full text-xs font-bold"
              :class="[p.color, p.textColor]"
            >
              {{ p.id.toUpperCase() }}
            </div>
            <span class="text-xs font-medium text-text">{{ p.name }}</span>
            <Transition name="tab-content">
              <div
                v-if="selectedProvider === p.id"
                class="absolute inset-x-0 bottom-0 h-0.5 bg-accent"
              />
            </Transition>
          </button>
        </div>

        <Transition name="provider-panel">
          <div v-if="activeProvider" class="space-y-4">
            <div>
              <label class="mb-1.5 block text-xs font-medium text-text-muted">
                {{ activeProvider.name }} Number
              </label>
              <div class="flex">
                <span class="flex items-center rounded-l-lg border border-r-0 border-border bg-surface-muted px-3 font-mono text-sm text-text-subtle">
                  +233
                </span>
                <input
                  v-model="phone"
                  type="tel"
                  :placeholder="`${activeProvider.prefix} XXX XXXX`"
                  class="w-full rounded-r-lg border border-border bg-surface px-3 py-2.5 font-mono text-sm text-text outline-none transition-all duration-200 focus:border-accent focus:ring-2 focus:ring-accent/20"
                />
              </div>
            </div>

            <div>
              <label class="mb-1.5 block text-xs font-medium text-text-muted">Amount (GHS)</label>
              <div class="mb-2 flex gap-2">
                <button
                  v-for="preset in presetAmounts"
                  :key="preset"
                  type="button"
                  class="rounded-lg border px-3 py-1.5 text-xs font-medium transition-all duration-200"
                  :class="
                    amount === preset
                      ? 'border-accent bg-accent-muted text-accent'
                      : 'border-border text-text-muted hover:border-accent/40'
                  "
                  @click="amount = preset"
                >
                  GH₵ {{ preset }}
                </button>
              </div>
              <input
                v-model.number="amount"
                type="number"
                min="1"
                step="0.5"
                class="w-full rounded-lg border border-border bg-surface px-3 py-2.5 font-mono text-sm text-text outline-none transition-all duration-200 focus:border-accent focus:ring-2 focus:ring-accent/20"
              />
            </div>

            <p v-if="topUpError" class="rounded-lg border border-danger/30 bg-danger/10 px-3 py-2 text-xs text-danger">
              {{ topUpError }}
            </p>

            <button
              type="button"
              class="flex w-full items-center justify-center gap-2 rounded-xl py-3 text-sm font-semibold text-white transition-all duration-300 disabled:opacity-60"
              :class="activeProvider.color + ' ' + activeProvider.textColor"
              :disabled="topping || !phone"
              @click="handleTopUp"
            >
              <svg
                v-if="topping"
                class="h-4 w-4 animate-spin"
                fill="none"
                viewBox="0 0 24 24"
              >
                <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" />
                <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
              </svg>
              {{ topping ? 'Processing…' : `Pay GH₵ ${amount.toFixed(2)} via ${activeProvider.name}` }}
            </button>
          </div>
        </Transition>

        <div v-if="!selectedProvider" class="flex h-32 items-center justify-center rounded-lg border border-dashed border-border">
          <p class="text-xs text-text-subtle">Select a Mobile Money provider to continue</p>
        </div>
      </div>
    </div>
  </div>
</template>
