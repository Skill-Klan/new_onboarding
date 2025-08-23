import { createRouter, createWebHistory } from 'vue-router'
import FAQPage from '../pages/FAQPage.vue'
import ContactPage from '../pages/ContactPage.vue'
import QaPage from '../pages/QaPage.vue'
import BaPage from '../pages/BaPage.vue'
import BePage from '../pages/BePage.vue'
import AboutPage from '../pages/AboutPage.vue'
import StudyPage from '../pages/StudyPage.vue'

const routes = [
  {
    path: '/',
    redirect: '/faq'
  },
  {
    path: '/faq',
    name: 'FAQ',
    component: FAQPage
  },
  {
    path: '/contact',
    name: 'Contact',
    component: ContactPage
  },
  {
    path: '/qa',
    name: 'QA',
    component: QaPage
  },
  {
    path: '/ba',
    name: 'BA',
    component: BaPage
  },
  {
    path: '/be',
    name: 'BE',
    component: BePage
  },
  {
    path: '/about',
    name: 'About',
    component: AboutPage
  },
  {
    path: '/study/:profession',
    name: 'Study',
    component: StudyPage
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
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