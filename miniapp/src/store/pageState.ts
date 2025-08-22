import { ref } from 'vue'

// Зафіксувати тільки FAQ сторінку
export const currentPage = ref('faq')

// Функція не потрібна, але залишаємо для майбутнього
export const showPage = (page: string) => {
  currentPage.value = page
}
