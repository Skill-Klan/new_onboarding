import { createRouter, createWebHistory } from 'vue-router'
import FAQPage from '../pages/FAQPage.vue'

const routes = [
  {
    path: '/',
    redirect: '/faq'
  },
  {
    path: '/faq',
    name: 'FAQ',
    component: FAQPage
  }
]

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes,
  scrollBehavior(to, from, savedPosition) {
    if (savedPosition) {
      return savedPosition
    } else {
      return { top: 0 }
    }
  }
})

// Глобальний guard для скролу вгору при навігації
router.beforeEach((to, from, next) => {
  // Якщо це не повернення назад (наприклад, через кнопку браузера)
  if (to.path !== from.path) {
    // Зберігаємо поточну позицію скролу для поточної сторінки
    if (from.path) {
      sessionStorage.setItem(`scroll_${from.path}`, window.scrollY.toString())
    }
  }
  next()
})

// Відновлюємо позицію скролу при поверненні
router.afterEach((to, from) => {
  // Якщо це повернення назад
  if (from.path && to.path) {
    const savedScroll = sessionStorage.getItem(`scroll_${to.path}`)
    if (savedScroll) {
      // Відновлюємо позицію скролу
      setTimeout(() => {
        window.scrollTo(0, parseInt(savedScroll))
      }, 100)
      // Видаляємо збережену позицію
      sessionStorage.removeItem(`scroll_${to.path}`)
    } else {
      // Якщо це нова навігація - скрол вгору
      window.scrollTo(0, 0)
    }
  } else {
    // Для першого завантаження - скрол вгору
    window.scrollTo(0, 0)
  }
})

export default router