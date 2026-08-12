<script setup>
import { ref, onMounted, computed } from 'vue'
import { useRouter } from 'vue-router'
import DashboardSidebar from '../components/dashboard/DashboardSidebar.vue'
import ThemeToggle from '../components/shared/ThemeToggle.vue'
import { useAuth } from '../composables/useAuth.js'
import { fetchMe } from '../services/dashboardApi.js'

const router = useRouter()
const { logout, getKeyPrefix, getInitials, getAccount, setSession } = useAuth()

const orgName = ref(getAccount()?.org_name || 'Developer')
const keyPrefix = ref(getKeyPrefix())

onMounted(async () => {
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
  router.push('/dashboard/login')
}
</script>

<template>
  <div class="flex min-h-screen bg-surface mesh-bg">
    <DashboardSidebar />
    <main class="flex-1 overflow-y-auto">
      <div class="border-b border-border bg-surface/60 px-6 py-4 backdrop-blur-sm">
        <div class="flex items-center justify-between">
          <div class="flex items-center gap-2 font-mono text-xs text-text-subtle">
            <span class="rounded-md bg-accent-muted px-1.5 py-0.5 font-semibold text-accent">LIVE</span>
            {{ keyPrefix || 'No API key' }}
          </div>
          <div class="flex items-center gap-3">
            <ThemeToggle />
            <span class="text-xs text-text-subtle">{{ orgName }}</span>
            <button
              type="button"
              class="flex h-7 w-7 items-center justify-center rounded-full border border-border bg-surface-card text-xs font-bold text-accent transition-colors hover:border-accent/40"
              :title="`Sign out (${getInitials()})`"
              @click="handleLogout"
            >
              {{ getInitials() }}
            </button>
          </div>
        </div>
      </div>

      <div class="p-6">
        <RouterView v-slot="{ Component }">
          <Transition name="panel" mode="out-in">
            <component :is="Component" />
          </Transition>
        </RouterView>
      </div>
    </main>
  </div>
</template>
