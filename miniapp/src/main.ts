import { createApp } from 'vue'
import App from './App.vue'
import { WebApp } from './core/telegram'
import './styles/index.css'
import router from './router' // додати імпорт роутера

const app = createApp(App)
app.use(router) // підключити роутер

// Fallback для роутингу
router.isReady().then(() => {
  app.mount('#app')
}).catch((error) => {
  console.error('Router error:', error)
  app.mount('#app')
})

// ініціалізація Telegram Mini App
if (WebApp?.ready) {
  WebApp.ready()
  WebApp.expand()
}