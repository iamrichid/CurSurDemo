<script setup>
import { ref, computed } from 'vue'
import { usePricing } from '../../composables/usePricing'

const { walletBalance } = usePricing()

const providers = [
  { id: 'mtn', name: 'MTN MoMo', color: 'bg-mtn', textColor: 'text-black', prefix: '024' },
  { id: 'telecel', name: 'Telecel Cash', color: 'bg-telecel', textColor: 'text-white', prefix: '020' },
  { id: 'at', name: 'AT Money', color: 'bg-at', textColor: 'text-white', prefix: '027' },
]

const selectedProvider = ref(null)
const amount = ref(20)
const phone = ref('')
const topping = ref(false)
const topUpSuccess = ref(false)

const activeProvider = computed(() => providers.find((p) => p.id === selectedProvider.value))

function selectProvider(id) {
  selectedProvider.value = selectedProvider.value === id ? null : id
  topUpSuccess.value = false
  phone.value = ''
}

async function handleTopUp() {
  if (!selectedProvider.value || !phone.value) return
  topping.value = true
  topUpSuccess.value = false
  await new Promise((r) => setTimeout(r, 1800))
  topping.value = false
  topUpSuccess.value = true
  walletBalance.value += amount.value
}

const presetAmounts = [10, 20, 50, 100]
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

    <div class="grid gap-6 lg:grid-cols-5">
      <!-- Wallet Balance -->
      <div class="ft-card-glow p-6 lg:col-span-2">
        <p class="text-xs font-medium text-text-subtle">Current Balance</p>
        <p class="mt-2 text-4xl font-extrabold text-text">
          GH₵ {{ walletBalance.toFixed(2) }}
        </p>
        <p class="mt-2 text-xs text-text-muted">Pay-as-you-go: GH₵ 0.10 per API call</p>

        <Transition name="tab-content">
          <div
            v-if="topUpSuccess"
            class="mt-4 flex items-center gap-2 rounded-lg bg-success/10 px-3 py-2 text-xs font-medium text-success"
          >
            <svg class="h-4 w-4" fill="currentColor" viewBox="0 0 20 20">
              <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd"/>
            </svg>
            Top-up successful! GH₵ {{ amount.toFixed(2) }} added.
          </div>
        </Transition>
      </div>

      <!-- MoMo Top-up Widget -->
      <div class="ft-card-glow p-6 lg:col-span-3">
        <h2 class="mb-4 text-sm font-semibold text-text">Mobile Money Top-Up</h2>

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
