<script setup>
import { ref, onMounted, computed } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import DashboardSidebar from '../components/dashboard/DashboardSidebar.vue'
import ThemeToggle from '../components/shared/ThemeToggle.vue'
import { useAuth } from '../composables/useAuth.js'
import { useRates, invalidateRatesCache } from '../composables/useRates.js'
import { useToast } from '../composables/useToast.js'
import { fetchMe } from '../services/dashboardApi.js'

const router = useRouter()
const route = useRoute()
const { logout, getKeyPrefix, getInitials, getAccount, setSession } = useAuth()
const toast = useToast()
const { load: loadRates } = useRates()

const orgName = ref(getAccount()?.org_name || 'Developer')
const keyPrefix = ref(getKeyPrefix())
const sidebarOpen = ref(false)

const pageTitle = computed(() => {
  const titles = {
    '/dashboard/overview': 'Overview',
    '/dashboard/billing': 'Billing',
    '/dashboard/keys': 'API Keys',
    '/dashboard/pricing': 'Pricing Matrix',
    '/dashboard/docs': 'API Docs',
  }
  return titles[route.path] || 'Dashboard'
})

onMounted(async () => {
  loadRates({ background: true }).catch(() => {})
  try {
    const data = await fetchMe()
    if (data.account) {
      orgName.value = data.account.org_name
      setSession({ account: data.account })
    }
    keyPrefix.value = getKeyPrefix()
  } catch {
    // keep cached account info
  }
})

function handleLogout() {
  logout()
  invalidateRatesCache()
  toast.info('Signed out')
  router.push('/dashboard/login')
}
</script>

<template>
  <div class="flex min-h-screen bg-surface mesh-bg">
    <Transition name="fade">
      <button
        v-if="sidebarOpen"
        type="button"
        class="fixed inset-0 z-40 bg-black/50 lg:hidden"
        aria-label="Close navigation"
        @click="sidebarOpen = false"
      />
    </Transition>

    <DashboardSidebar :open="sidebarOpen" @close="sidebarOpen = false" />

    <main class="min-w-0 flex-1 overflow-y-auto">
      <div class="border-b border-border bg-surface/60 px-4 py-3 backdrop-blur-sm sm:px-6 sm:py-4">
        <div class="flex items-center justify-between gap-3">
          <div class="flex min-w-0 items-center gap-3">
            <button
              type="button"
              class="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-border text-text-muted transition-colors hover:border-accent/40 hover:text-text lg:hidden"
              aria-label="Open navigation"
              @click="sidebarOpen = true"
            >
              <svg class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                <path stroke-linecap="round" stroke-linejoin="round" d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
            <div>
              <p class="text-sm font-semibold text-text lg:hidden">{{ pageTitle }}</p>
              <div class="flex items-center gap-2 font-mono text-xs text-text-subtle">
                <span class="rounded-md bg-accent-muted px-1.5 py-0.5 font-semibold text-accent">LIVE</span>
                <span class="truncate">{{ keyPrefix || 'No API key' }}</span>
              </div>
            </div>
          </div>
          <div class="flex shrink-0 items-center gap-2 sm:gap-3">
            <ThemeToggle />
            <span class="hidden text-xs text-text-subtle sm:inline">{{ orgName }}</span>
            <button
              type="button"
              class="hidden items-center gap-1.5 rounded-lg border border-border px-2.5 py-1.5 text-xs font-medium text-text-muted transition-colors hover:border-danger/40 hover:text-danger sm:flex"
              @click="handleLogout"
            >
              <svg class="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                <path stroke-linecap="round" stroke-linejoin="round" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
              </svg>
              Sign out
            </button>
            <button
              type="button"
              class="flex h-8 w-8 items-center justify-center rounded-full border border-border bg-surface-card text-xs font-bold text-accent transition-colors hover:border-accent/40 sm:hidden"
              :title="`Sign out (${getInitials()})`"
              @click="handleLogout"
            >
              {{ getInitials() }}
            </button>
          </div>
        </div>
      </div>

      <div class="p-4 sm:p-6">
        <RouterView v-slot="{ Component }">
          <KeepAlive>
            <component :is="Component" />
          </KeepAlive>
        </RouterView>
      </div>
    </main>
  </div>
</template>
