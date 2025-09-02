import { createApp } from 'vue'
import App from './App.vue'
import './styles/index.css'
import router from './router'

const app = createApp(App)
app.use(router)

// Fallback для роутингу
router.isReady().then(() => {
  app.mount('#app')
}).catch((error) => {
  console.error('Router error:', error)
  app.mount('#app')
})