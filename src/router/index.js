import { createRouter, createWebHistory } from 'vue-router'
import { getStoredApiKey } from '../composables/useAuth.js'

const router = createRouter({
  history: createWebHistory(),
  scrollBehavior(to, _from, savedPosition) {
    if (savedPosition) return savedPosition
    if (to.hash) return { el: to.hash, behavior: 'smooth' }
    return { top: 0 }
  },
  routes: [
    {
      path: '/',
      name: 'landing',
      component: () => import('../views/LandingView.vue'),
    },
    {
      path: '/docs',
      name: 'docs',
      component: () => import('../views/DocsView.vue'),
    },
    {
      path: '/dashboard/login',
      name: 'dashboard-login',
      component: () => import('../views/DashboardLoginView.vue'),
    },
    {
      path: '/dashboard',
      component: () => import('../views/DashboardView.vue'),
      redirect: '/dashboard/overview',
      children: [
        {
          path: 'overview',
          name: 'dashboard-overview',
          component: () => import('../components/dashboard/OverviewPanel.vue'),
        },
        {
          path: 'billing',
          name: 'dashboard-billing',
          component: () => import('../components/dashboard/BillingPanel.vue'),
        },
        {
          path: 'keys',
          name: 'dashboard-keys',
          component: () => import('../components/dashboard/ApiKeysPanel.vue'),
        },
        {
          path: 'pricing',
          name: 'dashboard-pricing',
          component: () => import('../components/dashboard/PricingMatrix.vue'),
        },
        {
          path: 'docs',
          name: 'dashboard-docs',
          component: () => import('../components/dashboard/ApiDocsPanel.vue'),
        },
      ],
    },
  ],
})

router.beforeEach((to) => {
  const isDashboard = to.path.startsWith('/dashboard')
  const isLogin = to.path === '/dashboard/login'
  const hasKey = Boolean(getStoredApiKey())

  if (isDashboard && !isLogin && !hasKey) {
    return { name: 'dashboard-login' }
  }

  if (isLogin && hasKey) {
    return { name: 'dashboard-overview' }
  }
})

export default router
