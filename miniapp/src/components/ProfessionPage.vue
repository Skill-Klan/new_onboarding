<template>
  <div class="profession-content">
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
      <div class="skills-section">
        <div class="skills-group">
          <h4>Навички:</h4>
          <ul>
            <li v-for="skill in professionData.skills" :key="skill">🔧 {{ skill }}</li>
          </ul>
        </div>
        <div class="tools-group">
          <h4>Інструменти:</h4>
          <ul>
            <li v-for="tool in professionData.tools" :key="tool">💻 {{ tool }}</li>
          </ul>
        </div>
      </div>
    </InfoSection>

    <!-- Приклад із життя -->
    <InfoSection title="Приклад із життя">
      <p>{{ professionData.example }}</p>
    </InfoSection>

    <!-- Чому ця професія важлива -->
    <InfoSection title="Чому ця професія важлива">
      <ul>
        <li v-for="reason in professionData.importance" :key="reason">• {{ reason }}</li>
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

    <!-- Кнопка навчання -->
    <div class="study-section">
      <StudyButton />
    </div>
  </div>
</template>

<script setup lang="ts">
import InfoSection from './InfoSection.vue'
import { ref, onMounted } from 'vue'
import StudyButton from './StudyButton.vue'

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
/* Стилі винесені в спільні файли */
/* Використовуємо класи з layout.css та variables.css */

/* Специфічні стилі для ProfessionPage */
.profession-content {
  width: 100%;
}

.skills-section {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: var(--spacing-xl);
  margin: var(--spacing-xl) 0;
}

.skills-group h4,
.tools-group h4 {
  color: var(--color-primary);
  font-size: var(--font-size-md);
  font-weight: var(--font-weight-semibold);
  margin-bottom: var(--spacing-md);
}

.study-section {
  margin-top: 40px;
  text-align: center;
  padding: var(--spacing-xl);
  background: var(--color-bg-card);
  border-radius: var(--radius-md);
  border: 1px solid var(--color-border-secondary);
}

/* Стилі для списків */
:deep(ul) {
  margin: var(--spacing-lg) 0;
  padding-left: var(--spacing-xl);
}

:deep(li) {
  margin-bottom: var(--spacing-sm);
  color: #d1d5db;
  line-height: 1.5;
}

:deep(ol) {
  margin: var(--spacing-lg) 0;
  padding-left: var(--spacing-xl);
}

:deep(ol li) {
  margin-bottom: var(--spacing-sm);
  color: #d1d5db;
  line-height: 1.5;
}

:deep(p) {
  color: var(--color-text-secondary);
  line-height: 1.6;
  margin: var(--spacing-lg) 0;
}

/* Адаптивні стилі для маленьких екранів */
@media (max-width: 768px) {
  .skills-section {
    grid-template-columns: 1fr;
    gap: var(--spacing-lg);
  }
}

@media (max-width: 480px) {
  :deep(ul),
  :deep(ol) {
    padding-left: var(--spacing-lg);
  }
  
  :deep(li) {
    margin-bottom: 6px;
  }
}

@media (max-width: 320px) {
  :deep(ul),
  :deep(ol) {
    padding-left: var(--spacing-md);
  }
  
  :deep(li) {
    margin-bottom: 4px;
  }
}
</style>