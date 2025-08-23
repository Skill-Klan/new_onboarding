<template>
    <button class="btn btn-primary study-button" @click="navigateToStudy">
      <span class="btn-icon">🎓</span>
      <span class="btn-text">Як попасти на навчання</span>
    </button>
  </template>
  
  <script setup lang="ts">
  import { useRouter } from 'vue-router'
  
  const router = useRouter()
  
  const navigateToStudy = () => {
    // Переходимо на сторінку навчання з поточною професією
    const currentPath = router.currentRoute.value.path
    const profession = currentPath.slice(1) // 'qa', 'ba', 'be'
    router.push(`/study/${profession}`)
  }
  </script>
  
  <style scoped>
/* Стилі винесені в src/styles/buttons.css */
/* Використовуємо спільні класи з buttons.css та variables.css */

/* Специфічні стилі для StudyButton (якщо потрібно) */
</style>