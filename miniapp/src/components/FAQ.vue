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
import { ref, onMounted } from 'vue'

interface FAQQuestion {
  q: string
  a: string
}

interface FAQCategory {
  category: string
  questions: FAQQuestion[]
}

interface FAQData {
  faq: FAQCategory[]
}

const faqData = ref<FAQCategory[]>([])
const openItems = ref<Set<string>>(new Set())
const openCategories = ref<Set<number>>(new Set())

// Завантажити дані з JSON
const loadFAQData = async () => {
  try {
    const response = await fetch('/src/data/faq.json')
    const data: FAQData = await response.json()
    faqData.value = data.faq
    // За замовчуванням відкрити всі категорії
    data.faq.forEach((_, index) => {
      openCategories.value.add(index)
    })
  } catch (error) {
    console.error('Помилка завантаження FAQ:', error)
    faqData.value = [
      {
        category: "Помилка завантаження",
        questions: [
          {
            q: "Не вдалося завантажити FAQ",
            a: "Перевірте підключення до інтернету та спробуйте ще раз."
          }
        ]
      }
    ]
    openCategories.value.add(0)
  }
}

// Перевірити чи категорія відкрита
const isCategoryOpen = (categoryIndex: number): boolean => {
  return openCategories.value.has(categoryIndex)
}

// Перевірити чи елемент відкритий
const isItemOpen = (categoryIndex: number, questionIndex: number): boolean => {
  return openItems.value.has(`${categoryIndex}-${questionIndex}`)
}

// Переключити стан категорії
const toggleCategory = (categoryIndex: number) => {
  if (openCategories.value.has(categoryIndex)) {
    openCategories.value.delete(categoryIndex)
    // Закрити всі питання в цій категорії
    faqData.value[categoryIndex].questions.forEach((_, questionIndex) => {
      openItems.value.delete(`${categoryIndex}-${questionIndex}`)
    })
  } else {
    openCategories.value.add(categoryIndex)
  }
}

// Переключити стан елемента
const toggleItem = (categoryIndex: number, questionIndex: number) => {
  const key = `${categoryIndex}-${questionIndex}`
  if (openItems.value.has(key)) {
    openItems.value.delete(key)
  } else {
    openItems.value.add(key)
  }
}

// Завантажити дані при монтуванні компонента
onMounted(() => {
  loadFAQData()
})
</script>

<style scoped>
.faq-container {
  padding: 20px 0;
  width: 100%;
  max-width: 100%;
  margin: 0 auto;
  box-sizing: border-box;
  display: flex;
  flex-direction: column;
  align-items: center;
}

.faq-title {
  text-align: center;
  margin-bottom: 30px;
  font-size: clamp(18px, 4vw, 24px);
  font-weight: bold;
  color: #ffffff;
  width: 100%;
  max-width: calc(100% - 100px);
  padding: 0 50px;
  box-sizing: border-box;
}

.faq-list {
  display: flex;
  flex-direction: column;
  gap: 24px;
  width: 100%;
  max-width: calc(100% - 100px);
  padding: 0 50px;
  box-sizing: border-box;
}

.faq-category {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.category-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  cursor: pointer;
  padding: 15px 20px;
  background-color: #374151;
  border-radius: 8px;
  transition: background-color 0.2s;
}

.category-header:hover {
  background-color: #4b5563;
}

.category-title {
  font-size: clamp(16px, 3.5vw, 18px);
  font-weight: 600;
  color: #ffffff;
  margin: 0;
}

.category-icon {
  font-size: clamp(18px, 4vw, 20px);
  font-weight: bold;
  color: #ffffff;
  flex-shrink: 0;
}

.category-questions {
  display: flex;
  flex-direction: column;
  gap: 16px;
  padding-left: 10px;
}

.faq-item {
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  overflow: hidden;
  cursor: pointer;
  width: 100%;
  box-sizing: border-box;
  min-width: 0;
  max-width: 100%;
}

.faq-question {
  padding: clamp(12px, 3vw, 16px);
  background-color: #f9fafb;
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-weight: 500;
  color: #1f2937;
  font-size: clamp(14px, 3.5vw, 16px);
  width: 100%;
  box-sizing: border-box;
}

.faq-icon {
  font-size: clamp(16px, 4vw, 20px);
  font-weight: bold;
  color: #6b7280;
  flex-shrink: 0;
}

.faq-answer {
  padding: clamp(12px, 3vw, 16px);
  background-color: #ffffff;
  border-top: 1px solid #e5e7eb;
  line-height: 1.6;
  color: #374151;
  font-size: clamp(13px, 3vw, 14px);
  width: 100%;
  box-sizing: border-box;
  overflow-wrap: break-word;
  word-wrap: break-word;
}

/* Адаптивні відступи */
@media (max-width: 1200px) {
  .faq-title,
  .faq-list {
    max-width: calc(100% - 80px);
    padding: 0 40px;
  }
}

@media (max-width: 768px) {
  .faq-title,
  .faq-list {
    max-width: calc(100% - 60px);
    padding: 0 30px;
  }
}

@media (max-width: 480px) {
  .faq-title,
  .faq-list {
    max-width: calc(100% - 40px);
    padding: 0 20px;
  }
  
  .faq-list {
    gap: 20px;
  }
  
  .category-questions {
    padding-left: 5px;
  }
}

@media (max-width: 320px) {
  .faq-title,
  .faq-list {
    max-width: calc(100% - 30px);
    padding: 0 15px;
  }
  
  .faq-list {
    gap: 16px;
  }
  
  .category-questions {
    padding-left: 0;
  }
}
</style>