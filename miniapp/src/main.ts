import { createApp } from 'vue'
import App from './App.vue'
import { WebApp } from './core/telegram'
import './style.css'
import { showPage } from './store/pageState'

const app = createApp(App)
app.mount('#app')

// ініціалізація Telegram Mini App
if (WebApp?.ready) {
  WebApp.ready()
  WebApp.expand()
  
  // Прибрати створення MainButton - він не потрібен
  // if (WebApp.MainButton) { ... }
}