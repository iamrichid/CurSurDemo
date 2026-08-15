import { createApp, nextTick } from 'vue'
import { MotionPlugin } from '@vueuse/motion'
import App from './App.vue'
import router from './router'
import { isCrawlerMode, markAppReady } from './composables/useCrawlerMode.js'
import { isCrawlerClient } from './utils/crawler.js'
import './style.css'

if (isCrawlerClient()) {
  document.documentElement.dataset.crawler = 'true'
}

const app = createApp(App)

if (!isCrawlerMode()) {
  app.use(MotionPlugin)
}

app.use(router)

router.isReady().then(async () => {
  app.mount('#app')
  await nextTick()
  if (isCrawlerMode()) {
    await new Promise((resolve) => setTimeout(resolve, 150))
  }
  markAppReady(document.getElementById('app'))
})
