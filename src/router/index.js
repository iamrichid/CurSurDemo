import { createRouter, createWebHistory } from 'vue-router'

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

export default router
