<template>
  <div class="faq-container">
    <!-- Кнопка назад (умовно) -->
    <div v-if="canGoBack" class="back-section">
      <BackArrow />
    </div>
    
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
          <h2 class="category-title">{{ category.category }}</h2>
          <span class="category-icon">
            {{ isCategoryOpen(categoryIndex) ? '−' : '+' }}
          </span>
        </div>
        
        <!-- Питання в категорії (показуються тільки якщо категорія відкрита) -->
        <div 
          v-show="isCategoryOpen(categoryIndex)"
          class="category-questions"
        >
          <div 
            v-for="(item, questionIndex) in category.questions" 
            :key="`${categoryIndex}-${questionIndex}`"
            class="faq-item"
            @click="toggleItem(categoryIndex, questionIndex)"
          >
            <div class="faq-question">
              <span>{{ item.q }}</span>
              <span class="faq-icon">
                {{ isItemOpen(categoryIndex, questionIndex) ? '−' : '+' }}
              </span>
            </div>
            <div 
              v-show="isItemOpen(categoryIndex, questionIndex)" 
              class="faq-answer"
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
import BackArrow from '../components/BackArrow.vue'
import { ref, onMounted, computed } from 'vue'

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

// Перевіряємо, чи можна показати кнопку назад
const canGoBack = computed(() => {
  // Перевіряємо, чи є попередня сторінка в історії
  const hasHistory = window.history.length > 1
  
  // Перевіряємо, чи прийшли з нашої системи
  const referrer = document.referrer
  const currentHost = window.location.host
  const isInternalNavigation = referrer && referrer.includes(currentHost)
  
  // Показуємо кнопку тільки якщо є історія І прийшли з нашої системи
  return hasHistory && isInternalNavigation
})

// Завантажити дані з JSON
const loadFAQData = async () => {
  try {
    const response = await fetch('/src/data/faq.json')
    const data = await response.json()
    faqData.value = data.faq
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
    openItems.value.delete(key)
  } else {
    openItems.value.add(key)
  }
}

onMounted(() => {
  loadFAQData()
})
</script>

<style scoped>
.faq-container {
  min-height: 100vh;
  background: linear-gradient(135deg, #1f2937 0%, #111827 100%);
  color: #ffffff;
  font-family: system-ui, -apple-system, sans-serif;
  padding: 20px;
  width: 100%;
  max-width: 100%;
  margin: 0;
  box-sizing: border-box;
}

.back-section {
  margin-bottom: 20px;
}

.faq-title {
  font-size: clamp(28px, 7vw, 36px);
  font-weight: 700;
  text-align: center;
  margin: 20px 0 40px 0;
  background: linear-gradient(135deg, #ffffff 0%, #e5e7eb 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.faq-list {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.faq-category {
  background: rgba(75, 85, 99, 0.3);
  border-radius: 12px;
  border: 1px solid rgba(139, 92, 246, 0.2);
  overflow: hidden;
}

.category-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px;
  cursor: pointer;
  transition: background-color 0.2s ease;
  background: rgba(75, 85, 99, 0.5);
}

.category-header:hover {
  background: rgba(75, 85, 99, 0.7);
}

.category-title {
  font-size: clamp(18px, 4.5vw, 22px);
  font-weight: 600;
  color: #ffffff;
  margin: 0;
}

.category-icon {
  font-size: 24px;
  font-weight: bold;
  color: #8b5cf6;
}

.category-questions {
  padding: 0 20px 20px 20px;
}

.category-questions .faq-item:first-child {
  margin-top: 20px;
}

.faq-item {
  margin-bottom: 16px;
  background: rgba(75, 85, 99, 0.2);
  border-radius: 8px;
  overflow: hidden;
  cursor: pointer;
  transition: all 0.2s ease;
}

.faq-item:hover {
  background: rgba(75, 85, 99, 0.4);
}

.faq-question {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px;
  font-weight: 500;
  color: #e5e7eb;
  font-size: clamp(14px, 3.5vw, 16px);
}

.faq-icon {
  font-size: 18px;
  font-weight: bold;
  color: #8b5cf6;
  flex-shrink: 0;
}

.faq-answer {
  padding: 0 16px 16px 16px;
  color: #d1d5db;
  line-height: 1.6;
  font-size: clamp(14px, 3.5vw, 16px);
  border-top: 1px solid rgba(139, 92, 246, 0.2);
  margin-top: 8px;
  padding-top: 16px;
}

/* Адаптивність */
@media (max-width: 768px) {
  .faq-container {
    padding: 15px;
  }
}

@media (max-width: 480px) {
  .faq-container {
    padding: 10px;
  }
  
  .category-header {
    padding: 16px;
  }
  
  .category-questions {
    padding: 0 16px 16px 16px;
  }

  .category-questions .faq-item:first-child {
  margin-top: 16px;
}
  
  .faq-question {
    padding: 14px;
  }
  
  .faq-answer {
    padding: 0 14px 14px 14px;
  }
}
</style>