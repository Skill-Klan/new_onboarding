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
  .study-content {
    width: 100%;
  }
  
  .format-details {
    display: flex;
    flex-direction: column;
    gap: 16px;
    margin: 20px 0;
  }
  
  .format-item {
    display: flex;
    align-items: center;
    gap: 12px;
    padding: 12px 16px;
    background: rgba(75, 85, 99, 0.3);
    border-radius: 8px;
    border: 1px solid rgba(139, 92, 246, 0.2);
  }
  
  .format-icon {
    font-size: 20px;
  }
  
  .format-label {
    font-weight: 600;
    color: #8b5cf6;
    min-width: 80px;
  }
  
  .format-value {
    color: #e5e7eb;
    font-weight: 500;
  }
  
  .contact-details {
    display: flex;
    flex-direction: column;
    gap: 12px;
    margin: 20px 0;
  }
  
  .contact-item {
    display: flex;
    align-items: center;
    gap: 12px;
    padding: 12px 16px;
    background: rgba(75, 85, 99, 0.3);
    border-radius: 8px;
  }
  
  .contact-icon {
    font-size: 20px;
  }
  
  .contact-text {
    color: #e5e7eb;
    font-weight: 500;
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
      gap: 8px;
    }
    
    .format-label {
      min-width: auto;
    }
  }
  </style>