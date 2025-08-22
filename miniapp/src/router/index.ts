import { createRouter, createWebHistory } from 'vue-router'
import FAQPage from '../pages/FAQPage.vue'
import ContactPage from '../pages/ContactPage.vue'
import QaPage from '../pages/QaPage.vue'
import BaPage from '../pages/BaPage.vue'
import BePage from '../pages/BePage.vue'

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
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

export default router
