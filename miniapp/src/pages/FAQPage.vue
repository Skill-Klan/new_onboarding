<template>
  <div class="faq-container">
    <div class="faq-inner">
      <h1 class="faq-title">Часті питання</h1>
      
      <!-- Пошукове поле -->
      <div class="search-container">
        <div class="search-wrapper">
          <div class="search-icon">🔍</div>
          <input 
            v-model="searchQuery" 
            type="text" 
            placeholder="Пошук за питаннями та відповідями..."
            class="search-input"
            @input="onSearchInput"
          />
          <button 
            v-if="searchQuery" 
            @click="clearSearch" 
            class="clear-button"
            aria-label="Очистити пошук"
          >
            ✕
          </button>
        </div>
        <div v-if="searchQuery && filteredFAQData.length === 0" class="no-results">
          <div class="no-results-icon">🔍</div>
          <p>Нічого не знайдено за запитом "{{ searchQuery }}"</p>
          <p class="no-results-hint">Спробуйте інші ключові слова</p>
        </div>
      </div>
      
      <div class="faq-list">
      <!-- Категорії -->
      <div 
        v-for="(category, categoryIndex) in displayFAQData" 
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
              <span v-html="highlightText(item.q, searchQuery)"></span>
              <span class="question-icon" :class="{ 'rotated': isItemOpen(categoryIndex, questionIndex) }">▼</span>
            </div>
            <div 
              v-show="isItemOpen(categoryIndex, questionIndex)" 
              class="faq-answer"
              :class="{ 'expanded': isItemOpen(categoryIndex, questionIndex) }"
              v-html="highlightText(item.a, searchQuery)"
            >
            </div>
          </div>
        </div>
      </div>
    </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed, watch } from 'vue'

interface FAQQuestion {
  q: string
  a: string
}

interface FAQCategory {
  category: string
  questions: FAQQuestion[]
}

const faqData = ref<FAQCategory[]>([])
const searchQuery = ref('')
const searchTimeout = ref<number | null>(null)
const openItems = ref<Set<string>>(new Set())
const openCategories = ref<Set<number>>(new Set())

// Computed властивість для відфільтрованих даних
const filteredFAQData = computed(() => {
  if (!searchQuery.value.trim()) {
    return faqData.value
  }
  
  const query = searchQuery.value.toLowerCase().trim()
  const filtered = faqData.value.map(category => {
    const filteredQuestions = category.questions.filter(question => 
      question.q.toLowerCase().includes(query) || 
      question.a.toLowerCase().includes(query)
    )
    
    return {
      ...category,
      questions: filteredQuestions
    }
  }).filter(category => category.questions.length > 0)
  
  return filtered
})

// Computed властивість для відображення даних
const displayFAQData = computed(() => {
  return filteredFAQData.value
})

// Функція для debounced пошуку
const onSearchInput = () => {
  if (searchTimeout.value) {
    clearTimeout(searchTimeout.value)
  }
  
  searchTimeout.value = setTimeout(() => {
    // Автоматично відкриваємо категорії з результатами пошуку
    if (searchQuery.value.trim()) {
      const newOpenCategories = new Set<number>()
      filteredFAQData.value.forEach((_, index) => {
        newOpenCategories.add(index)
      })
      openCategories.value = newOpenCategories
    } else {
      openCategories.value.clear()
    }
  }, 300)
}

// Функція для очищення пошуку
const clearSearch = () => {
  searchQuery.value = ''
  openCategories.value.clear()
  openItems.value.clear()
}

// Функція для підсвічування тексту
const highlightText = (text: string, query: string) => {
  if (!query.trim()) {
    return text
  }
  
  const regex = new RegExp(`(${query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'gi')
  return text.replace(regex, '<mark class="highlight">$1</mark>')
}

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
  background: linear-gradient(135deg, #0f0f23 0%, #1a1a2e 100%);
  color: #ffffff;
  font-family: system-ui, -apple-system, sans-serif;
  padding: 20px;
  width: 100%;
  max-width: 100%;
  margin: 0;
  box-sizing: border-box;
}

.faq-inner {
  max-width: 800px;
  margin: 0 auto;
  background: rgba(255, 255, 255, 0.02);
  border-radius: 16px;
  overflow: hidden;
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.3), 0 0 0 1px rgba(255, 255, 255, 0.05);
  backdrop-filter: blur(10px);
}

/* Заголовок */
.faq-title {
  font-size: 1.75rem;
  font-weight: 600;
  margin: 0;
  padding: 32px 32px 24px 32px;
  text-align: left;
  color: #ffffff;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border-bottom: none;
  position: relative;
}

.faq-title::after {
  content: '';
  position: absolute;
  bottom: 0;
  left: 32px;
  right: 32px;
  height: 2px;
  background: linear-gradient(90deg, transparent 0%, rgba(255, 255, 255, 0.2) 50%, transparent 100%);
}

/* Пошукове поле */
.search-container {
  padding: 24px 32px;
  background: rgba(255, 255, 255, 0.01);
  border-bottom: 1px solid rgba(255, 255, 255, 0.05);
}

.search-wrapper {
  position: relative;
  display: flex;
  align-items: center;
  background: rgba(255, 255, 255, 0.05);
  border-radius: 12px;
  border: 1px solid rgba(255, 255, 255, 0.1);
  transition: all 0.3s ease;
  backdrop-filter: blur(10px);
}

.search-wrapper:focus-within {
  border-color: rgba(102, 126, 234, 0.5);
  box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
  background: rgba(255, 255, 255, 0.08);
}

.search-icon {
  padding: 0 16px;
  font-size: 1.1rem;
  color: rgba(255, 255, 255, 0.6);
  user-select: none;
}

.search-input {
  flex: 1;
  background: transparent;
  border: none;
  outline: none;
  padding: 16px 0;
  font-size: 1rem;
  color: #ffffff;
  font-family: inherit;
}

.search-input::placeholder {
  color: rgba(255, 255, 255, 0.4);
}

.clear-button {
  background: none;
  border: none;
  color: rgba(255, 255, 255, 0.6);
  font-size: 1.2rem;
  padding: 8px 16px;
  cursor: pointer;
  border-radius: 50%;
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
}

.clear-button:hover {
  background: rgba(255, 255, 255, 0.1);
  color: rgba(255, 255, 255, 0.8);
  transform: scale(1.1);
}

/* Повідомлення про відсутність результатів */
.no-results {
  text-align: center;
  padding: 40px 20px;
  color: rgba(255, 255, 255, 0.6);
}

.no-results-icon {
  font-size: 3rem;
  margin-bottom: 16px;
  opacity: 0.5;
}

.no-results p {
  margin: 8px 0;
  font-size: 1rem;
}

.no-results-hint {
  font-size: 0.9rem !important;
  opacity: 0.7;
}

/* Підсвічування результатів пошуку */
.highlight {
  background: rgba(102, 126, 234, 0.3);
  color: #ffffff;
  padding: 2px 4px;
  border-radius: 4px;
  font-weight: 500;
}

/* Список FAQ */
.faq-list {
  background: transparent;
  border: none;
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
  padding: 24px 32px;
  margin: 0;
  background: rgba(255, 255, 255, 0.02);
  border-bottom: 1px solid rgba(255, 255, 255, 0.08);
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  min-height: 56px;
  display: flex;
  align-items: center;
  position: relative;
  backdrop-filter: blur(5px);
}

.category-header::before {
  content: '';
  position: absolute;
  left: 0;
  top: 0;
  bottom: 0;
  width: 4px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  opacity: 0;
  transition: opacity 0.3s ease;
}

.category-header:hover {
  background: rgba(255, 255, 255, 0.05);
  transform: translateX(2px);
}

.category-header:hover::before {
  opacity: 1;
}

.faq-item {
  padding: 20px 32px;
  margin: 0;
  background: rgba(255, 255, 255, 0.01);
  border-bottom: 1px solid rgba(255, 255, 255, 0.05);
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  min-height: 48px;
  display: flex;
  flex-direction: column;
  justify-content: center;
  position: relative;
}

.faq-item:hover {
  background: rgba(255, 255, 255, 0.03);
  transform: translateX(4px);
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
  background: rgba(255, 255, 255, 0.03);
}

/* Питання в розгорнутій категорії мають сірий фон */
.category-questions.expanded .faq-item {
  background: rgba(255, 255, 255, 0.03);
}

.category-questions.expanded .faq-item:hover {
  background: rgba(255, 255, 255, 0.06);
}

.faq-item.expanded {
  background: rgba(102, 126, 234, 0.1) !important;
  border-left: 3px solid #667eea;
}

.faq-item.expanded:hover {
  background: rgba(102, 126, 234, 0.15) !important;
}

.faq-answer.expanded {
  background: rgba(102, 126, 234, 0.08);
  padding: 16px 32px;
  margin: 0 -32px 0 -32px;
  border-top: 1px solid rgba(102, 126, 234, 0.2);
  border-left: 3px solid #667eea;
}

/* Додаткові стилі для кращого UX */
.category-header:active,
.faq-item:active {
  transform: translateX(1px) scale(0.98);
  background: rgba(255, 255, 255, 0.08) !important;
}

/* Адаптивність */
@media (max-width: 768px) {
  .faq-container {
    padding: 10px;
  }
  
  .faq-title {
    font-size: 1.5rem;
    padding: 24px 20px 20px 20px;
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
    padding: 12px 20px;
    margin: 0 -20px 0 -20px;
  }
  
  .category-questions {
    padding-left: 20px;
  }
  
  .search-container {
    padding: 20px;
  }
  
  .search-input {
    font-size: 0.9rem;
  }
}

@media (max-width: 480px) {
  .faq-container {
    padding: 5px;
  }
  
  .faq-title {
    font-size: 1.25rem;
    padding: 20px 16px 16px 16px;
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
    padding: 10px 16px;
    margin: 0 -16px 0 -16px;
  }
  
  .category-questions {
    padding-left: 16px;
  }
  
  .search-container {
    padding: 16px;
  }
  
  .search-input {
    font-size: 0.85rem;
  }
  
  .search-icon {
    padding: 0 12px;
    font-size: 1rem;
  }
}
</style>