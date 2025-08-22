import { createApp } from 'vue'
import App from './App.vue'
import { WebApp } from './core/telegram'
import './style.css'

const app = createApp(App)
app.mount('#app')

// ініціалізація Telegram Mini App
if (WebApp?.ready) {
  WebApp.ready()
}
