import { createApp } from 'vue'
import App from './App.vue'
import { WebApp } from './core/telegram'
import './style.css'
import router from './router' // додати імпорт роутера

const app = createApp(App)
app.use(router) // підключити роутер
app.mount('#app')

// ініціалізація Telegram Mini App
if (WebApp?.ready) {
  WebApp.ready()
  WebApp.expand()
}