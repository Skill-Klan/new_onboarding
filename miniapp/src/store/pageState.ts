import { ref } from 'vue'

// FAQ сторінка завжди активна
export const currentPage = ref('faq')

// Функція для майбутнього розширення
export const showPage = (page: string) => {
  currentPage.value = page
}
