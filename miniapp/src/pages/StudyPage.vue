<template>
    <BasePage 
      :title="studyData.title"
      :subtitle="studyData.subtitle"
      :showBackArrow="true"
    >
      <div class="study-content">
        <!-- Загальна інформація -->
        <InfoSection title="Загальна інформація">
          <p>{{ studyData.generalInfo }}</p>
        </InfoSection>
  
        <!-- Вимоги для вступу -->
        <InfoSection title="Вимоги для вступу">
          <ul>
            <li v-for="requirement in studyData.requirements" :key="requirement">
              ✅ {{ requirement }}
            </li>
          </ul>
        </InfoSection>
  
        <!-- Процес навчання -->
        <InfoSection title="Процес навчання">
          <ol>
            <li v-for="step in studyData.learningProcess" :key="step">
              {{ step }}
            </li>
          </ol>
        </InfoSection>
  
        <!-- Тривалість та формат -->
        <InfoSection title="Тривалість та формат">
          <div class="format-details">
            <div class="format-item">
              <span class="format-icon">⏱️</span>
              <span class="format-label">Тривалість:</span>
              <span class="format-value">{{ studyData.duration }}</span>
            </div>
            <div class="format-item">
              <span class="format-icon">��</span>
              <span class="format-label">Формат:</span>
              <span class="format-value">{{ studyData.format }}</span>
            </div>
            <div class="format-item">
              <span class="format-icon">��</span>
              <span class="format-label">Група:</span>
              <span class="format-value">{{ studyData.groupSize }}</span>
            </div>
          </div>
        </InfoSection>
  
        <!-- Що ви отримаєте -->
        <InfoSection title="Що ви отримаєте">
          <ul>
            <li v-for="benefit in studyData.benefits" :key="benefit">
              🎯 {{ benefit }}
            </li>
          </ul>
        </InfoSection>
  
        <!-- Як подати заявку -->
        <InfoSection title="Як подати заявку">
          <ol>
            <li v-for="step in studyData.applicationSteps" :key="step">
              {{ step }}
            </li>
          </ol>
        </InfoSection>

        <!-- Кнопка тестового завдання (тільки для QA та BA) -->
      <div v-if="showTestTaskButton" class="test-task-section">
        <TestTaskButton />
      </div>
  
        <!-- Контакти для запитів -->
        <InfoSection title="Контакти для запитів">
          <div class="contact-details">
            <div class="contact-item">
              <span class="contact-icon">��</span>
              <span class="contact-text">{{ studyData.contactEmail }}</span>
            </div>
            <div class="contact-item">
              <span class="contact-icon">��</span>
              <span class="contact-text">{{ studyData.contactPhone }}</span>
            </div>
          </div>
        </InfoSection>
      </div>
    </BasePage>
  </template>
  
  <script setup lang="ts">
  import BasePage from '../components/BasePage.vue'
  import InfoSection from '../components/InfoSection.vue'
  import TestTaskButton from '../components/TestTaskButton.vue'
  import { ref,computed, onMounted } from 'vue'
  import { useRoute } from 'vue-router'
  
  const route = useRoute()
  const profession = route.params.profession as string

  // Показуємо кнопку "Отримати тестове завдання" тільки для QA та BA
const showTestTaskButton = computed(() => {
  return ['qa', 'ba'].includes(profession)
})
  
  interface StudyData {
    title: string
    subtitle: string
    generalInfo: string
    requirements: string[]
    learningProcess: string[]
    duration: string
    format: string
    groupSize: string
    benefits: string[]
    applicationSteps: string[]
    contactEmail: string
    contactPhone: string
  }
  
  const studyData = ref<StudyData>({
    title: '',
    subtitle: '',
    generalInfo: '',
    requirements: [],
    learningProcess: [],
    duration: '',
    format: '',
    groupSize: '',
    benefits: [],
    applicationSteps: [],
    contactEmail: '',
    contactPhone: ''
  })
  
  const loadStudyData = async () => {
    try {
      const response = await fetch(`/src/data/study/${profession}.json`)
      const data = await response.json()
      studyData.value = data
    } catch (error) {
      console.error('Помилка завантаження даних про навчання:', error)
    }
  }
  
  onMounted(() => {
    loadStudyData()
  })
  </script>
  
  <style scoped>
/* Стилі винесені в спільні файли */
/* Використовуємо класи з layout.css та variables.css */

/* Специфічні стилі для сторінки навчання */
.study-content {
  width: 100%;
}

.format-details {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-lg);
  margin: var(--spacing-xl) 0;
}

.format-item {
  display: flex;
  align-items: center;
  gap: var(--spacing-md);
  padding: var(--spacing-md) var(--spacing-lg);
  background: var(--color-bg-card);
  border-radius: var(--radius-sm);
  border: 1px solid var(--color-border-secondary);
}

.format-icon {
  font-size: var(--font-size-xl);
}

.format-label {
  font-weight: var(--font-weight-semibold);
  color: var(--color-primary);
  min-width: 80px;
}

.format-value {
  color: var(--color-text-secondary);
  font-weight: var(--font-weight-medium);
}

.contact-details {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-md);
  margin: var(--spacing-xl) 0;
}

.contact-item {
  display: flex;
  align-items: center;
  gap: var(--spacing-md);
  padding: var(--spacing-md) var(--spacing-lg);
  background: var(--color-bg-card);
  border-radius: var(--radius-sm);
}

.contact-icon {
  font-size: var(--font-size-xl);
}

.contact-text {
  color: var(--color-text-secondary);
  font-weight: var(--font-weight-medium);
}

.test-task-section {
  margin: 30px 0;
  text-align: center;
}

/* Адаптивність */
@media (max-width: 768px) {
  .format-item {
    flex-direction: column;
    align-items: flex-start;
    gap: var(--spacing-sm);
  }
  
  .format-label {
    min-width: auto;
  }
}
</style>