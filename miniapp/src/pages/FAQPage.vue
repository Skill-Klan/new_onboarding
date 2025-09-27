<template>
  <div class="faq-container">
    <h1 class="faq-title">Часті питання</h1>
    
    <div class="faq-list">
      <!-- Категорії -->
      <div 
        v-for="(category, categoryIndex) in faqData" 
        :key="categoryIndex"
        class="faq-category"
      >
        <div 
          class="category-header"
          @click="toggleCategory(categoryIndex)"
        >
          <h2 class="category-title">
            {{ category.category }}
            <span class="category-icon" :class="{ 'rotated': isCategoryOpen(categoryIndex) }">▼</span>
          </h2>
        </div>
        
        <!-- Питання в категорії (показуються завжди, але згортаються при закритті категорії) -->
        <div 
          v-show="isCategoryOpen(categoryIndex)"
          class="category-questions"
          :class="{ 'expanded': isCategoryOpen(categoryIndex) }"
        >
          <div 
            v-for="(item, questionIndex) in category.questions" 
            :key="`${categoryIndex}-${questionIndex}`"
            class="faq-item"
            :class="{ 'expanded': isItemOpen(categoryIndex, questionIndex) }"
            @click="toggleItem(categoryIndex, questionIndex)"
          >
            <div class="faq-question">
              <span>{{ item.q }}</span>
              <span class="question-icon" :class="{ 'rotated': isItemOpen(categoryIndex, questionIndex) }">▼</span>
            </div>
            <div 
              v-show="isItemOpen(categoryIndex, questionIndex)" 
              class="faq-answer"
              :class="{ 'expanded': isItemOpen(categoryIndex, questionIndex) }"
            >
              {{ item.a }}
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'

interface FAQQuestion {
  q: string
  a: string
}

interface FAQCategory {
  category: string
  questions: FAQQuestion[]
}

const faqData = ref<FAQCategory[]>([])
const openItems = ref<Set<string>>(new Set())
const openCategories = ref<Set<number>>(new Set())

// Функція для ініціалізації відкритих категорій
const initializeOpenCategories = () => {
  // Всі категорії залишаємо згорнутими за замовчуванням
  // openCategories.value залишається порожнім Set
}


// Завантажити дані з JSON
const loadFAQData = async () => {
  try {
    // Імпортуємо дані напряму замість fetch
    const data = await import('../data/faq.json')
    faqData.value = data.default.faq || data.faq
    // Ініціалізуємо відкриті категорії після завантаження даних
    initializeOpenCategories()
  } catch (error) {
    console.error('Помилка завантаження FAQ даних:', error)
  }
}

// Перевірити, чи категорія відкрита
const isCategoryOpen = (categoryIndex: number): boolean => {
  return openCategories.value.has(categoryIndex)
}

// Перевірити, чи питання відкрите
const isItemOpen = (categoryIndex: number, questionIndex: number): boolean => {
  return openItems.value.has(`${categoryIndex}-${questionIndex}`)
}

// Перевірити, чи є відкриті питання в категорії
const hasOpenQuestions = (categoryIndex: number): boolean => {
  const category = faqData.value[categoryIndex]
  if (!category) return false
  
  return category.questions.some((_, questionIndex) => 
    openItems.value.has(`${categoryIndex}-${questionIndex}`)
  )
}

// Переключити категорію
const toggleCategory = (categoryIndex: number) => {
  if (openCategories.value.has(categoryIndex)) {
    openCategories.value.delete(categoryIndex)
  } else {
    openCategories.value.add(categoryIndex)
  }
}

// Переключити питання
const toggleItem = (categoryIndex: number, questionIndex: number) => {
  const key = `${categoryIndex}-${questionIndex}`
  
  if (openItems.value.has(key)) {
    // Закриваємо питання
    openItems.value.delete(key)
    // НЕ закриваємо категорію автоматично - користувач має контролювати це самостійно
  } else {
    // Відкриваємо питання
    openItems.value.add(key)
    
    // Автоматично відкриваємо категорію, якщо вона закрита
    if (!openCategories.value.has(categoryIndex)) {
      openCategories.value.add(categoryIndex)
    }
  }
}

onMounted(() => {
  loadFAQData()
})
</script>

<style scoped>
.faq-container {
  min-height: 100vh;
  background: #000000;
  color: #ffffff;
  font-family: system-ui, -apple-system, sans-serif;
  padding: 0;
  width: 100%;
  max-width: 100%;
  margin: 0;
  box-sizing: border-box;
}

/* Заголовок */
.faq-title {
  font-size: 1.5rem;
  font-weight: 600;
  margin: 0;
  padding: 20px 24px;
  text-align: left;
  color: #ffffff;
  background: #000000;
  border-bottom: 1px solid #333333;
}

/* Список FAQ */
.faq-list {
  background: #000000;
  border: 1px solid #333333;
  border-top: none;
}

.category-title {
  font-size: 1rem;
  font-weight: 500;
  color: #ffffff;
  margin: 0;
  padding: 0;
  cursor: pointer;
  transition: color 0.2s ease;
  display: flex;
  align-items: center;
  justify-content: space-between;
  width: 100%;
}

.category-icon {
  font-size: 0.8rem;
  color: #ffffff;
  transition: transform 0.2s ease;
  margin-left: auto;
}

.category-icon.rotated {
  transform: rotate(180deg);
}

.category-title:hover {
  color: #ffffff;
}

.faq-question {
  font-size: 0.9rem;
  font-weight: 400;
  color: #ffffff;
  padding: 0;
  cursor: pointer;
  transition: color 0.2s ease;
  display: flex;
  align-items: center;
  justify-content: space-between;
  width: 100%;
}

.question-icon {
  font-size: 0.8rem;
  color: #ffffff;
  transition: transform 0.2s ease;
  margin-left: auto;
}

.question-icon.rotated {
  transform: rotate(180deg);
}

.faq-question:hover {
  color: #ffffff;
}

.faq-answer {
  font-size: 0.85rem;
  font-weight: 400;
  color: #ffffff;
  line-height: 1.5;
  padding: 12px 0;
  margin: 0;
  border-top: 1px solid #333333;
  margin-top: 12px;
}

/* Контейнери категорій та питань */
.category-header {
  padding: 20px 24px;
  margin: 0;
  background: #000000;
  border-bottom: 1px solid #333333;
  transition: background-color 0.2s ease;
  min-height: 56px;
  display: flex;
  align-items: center;
}

.category-header:hover {
  background: #111111;
}

.faq-item {
  padding: 20px 24px;
  margin: 0;
  background: #000000;
  border-bottom: 1px solid #333333;
  transition: background-color 0.2s ease;
  min-height: 48px;
  display: flex;
  flex-direction: column;
  justify-content: center;
}

.faq-item:hover {
  background: #111111;
}

.faq-item:last-child {
  border-bottom: none;
}

.category-questions {
  margin: 0;
  padding: 0;
  border: none;
  padding-left: 24px;
}

/* Виділення розгорнутих елементів */
.category-questions.expanded {
  background: #1a1a1a;
}

/* Питання в розгорнутій категорії мають сірий фон */
.category-questions.expanded .faq-item {
  background: #1a1a1a;
}

.category-questions.expanded .faq-item:hover {
  background: #222222;
}

.faq-item.expanded {
  background: #2a2a2a !important;
}

.faq-item.expanded:hover {
  background: #333333 !important;
}

.faq-answer.expanded {
  background: #2a2a2a;
  padding: 12px 24px;
  margin: 0 -24px 0 -24px;
  border-top: 1px solid #444444;
}

/* Додаткові стилі для кращого UX */
.category-header:active,
.faq-item:active {
  background: #222222 !important;
}

/* Адаптивність */
@media (max-width: 768px) {
  .faq-title {
    font-size: 1.25rem;
    padding: 16px 20px;
  }
  
  .category-header,
  .faq-item {
    padding: 16px 20px;
  }
  
  .category-title {
    font-size: 0.9rem;
  }
  
  .faq-question {
    font-size: 0.85rem;
  }
  
  .faq-answer {
    font-size: 0.8rem;
    padding: 10px 0;
    margin-top: 10px;
  }
  
  .faq-answer.expanded {
    padding: 10px 20px;
    margin: 0 -20px 0 -20px;
  }
  
  .category-questions {
    padding-left: 20px;
  }
}

@media (max-width: 480px) {
  .faq-title {
    font-size: 1.1rem;
    padding: 14px 16px;
  }
  
  .category-header,
  .faq-item {
    padding: 14px 16px;
  }
  
  .category-title {
    font-size: 0.85rem;
  }
  
  .faq-question {
    font-size: 0.8rem;
  }
  
  .faq-answer {
    font-size: 0.75rem;
  }
  
  .faq-answer.expanded {
    padding: 8px 16px;
    margin: 0 -16px 0 -16px;
  }
  
  .category-questions {
    padding-left: 16px;
  }
}
</style>