<template>
    <BasePage 
      :title="professionData.title"
      :subtitle="professionData.subtitle"
    >
      <!-- Хто такий [назва професії] -->
      <InfoSection :title="`Хто такий ${professionData.professionName}`">
        <p>{{ professionData.whoIs }}</p>
      </InfoSection>
  
      <!-- Коротке визначення -->
      <InfoSection title="Коротке визначення">
        <p>{{ professionData.definition }}</p>
      </InfoSection>
  
      <!-- Чим займається -->
      <InfoSection title="Чим займається">
        <ul>
          <li v-for="task in professionData.tasks" :key="task">✅ {{ task }}</li>
        </ul>
      </InfoSection>
  
      <!-- Навички та інструменти -->
      <InfoSection title="Навички та інструменти">
        <ul>
          <li v-for="skill in professionData.skills" :key="skill">🔧 {{ skill }}</li>
          <li v-for="tool in professionData.tools" :key="tool">💻 {{ tool }}</li>
        </ul>
      </InfoSection>
  
      <!-- Приклад із життя -->
      <InfoSection title="Приклад із життя">
        <p>{{ professionData.example }}</p>
      </InfoSection>
  
      <!-- Чому ця професія важлива -->
      <InfoSection title="Чому ця професія важлива">
        <ul>
          <li v-for="reason in professionData.importance" :key="reason">{{ reason }}</li>
        </ul>
      </InfoSection>
  
      <!-- Хто підходить -->
      <InfoSection title="Хто підходить">
        <ul>
          <li v-for="trait in professionData.suitableFor" :key="trait">🎯 {{ trait }}</li>
        </ul>
      </InfoSection>
  
      <!-- Як стартувати -->
      <InfoSection title="Як стартувати">
        <ol>
          <li v-for="step in professionData.howToStart" :key="step">{{ step }}</li>
        </ol>
      </InfoSection>
  
      <!-- Висновок -->
      <InfoSection title="Висновок">
        <p>{{ professionData.conclusion }}</p>
      </InfoSection>
    </BasePage>
  </template>
  
  <script setup lang="ts">
  import BasePage from './BasePage.vue'
  import InfoSection from './InfoSection.vue'
  import { ref, onMounted } from 'vue'
  
  interface ProfessionData {
    name: string
    title: string
    subtitle: string
    professionName: string
    whoIs: string
    definition: string
    tasks: string[]
    skills: string[]
    tools: string[]
    example: string
    importance: string[]
    suitableFor: string[]
    howToStart: string[]
    conclusion: string
  }
  
  const props = defineProps<{
    profession: string // 'qa', 'ba', 'be'
  }>()
  
  const professionData = ref<ProfessionData>({
    name: '',
    title: '',
    subtitle: '',
    professionName: '',
    whoIs: '',
    definition: '',
    tasks: [],
    skills: [],
    tools: [],
    example: '',
    importance: [],
    suitableFor: [],
    howToStart: [],
    conclusion: ''
  })
  
  // Завантажити дані з JSON
  const loadProfessionData = async () => {
    try {
      const response = await fetch(`/src/data/professions/${props.profession}.json`)
      const data = await response.json()
      professionData.value = data
    } catch (error) {
      console.error('Помилка завантаження даних професії:', error)
    }
  }
  
  onMounted(() => {
    loadProfessionData()
  })
  </script>
  
  <style scoped>
  /* Стилі для списків */
  :deep(ul) {
    margin: 16px 0;
    padding-left: 20px;
  }
  
  :deep(li) {
    margin-bottom: 8px;
    color: #d1d5db;
    line-height: 1.5;
  }
  
  :deep(ol) {
    margin: 16px 0;
    padding-left: 20px;
  }
  
  :deep(ol li) {
    margin-bottom: 8px;
    color: #d1d5db;
    line-height: 1.5;
  }
  
  :deep(p) {
    color: #e5e7eb;
    line-height: 1.6;
    margin: 16px 0;
  }
  
  /* Адаптивні стилі для маленьких екранів */
  @media (max-width: 480px) {
    :deep(ul),
    :deep(ol) {
      padding-left: 16px;
    }
    
    :deep(li) {
      margin-bottom: 6px;
    }
  }
  
  @media (max-width: 320px) {
    :deep(ul),
    :deep(ol) {
      padding-left: 12px;
    }
    
    :deep(li) {
      margin-bottom: 4px;
    }
  }
  </style>