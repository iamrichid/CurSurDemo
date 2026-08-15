import { createApp } from 'vue'
import { MotionPlugin } from '@vueuse/motion'
import App from './App.vue'
import router from './router'
import { isCrawlerClient } from './utils/crawler.js'
import './style.css'

if (isCrawlerClient()) {
  document.documentElement.dataset.crawler = 'true'
}

const app = createApp(App)
app.use(router)
app.use(MotionPlugin)

router.isReady().then(() => {
  app.mount('#app')
  const root = document.getElementById('app')
  if (root) {
    root.setAttribute('data-content-loaded', '')
    root.setAttribute('data-app-ready', '')
  }
  document.documentElement.dataset.appReady = 'true'
})
