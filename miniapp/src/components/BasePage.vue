<template>
      <div class="layout-container">
      <!-- Стрілка назад -->
      <BackArrow v-if="showBackArrow" />
      
      <!-- Заголовок сторінки -->
      <header class="page-header">
        <h1 class="page-title">{{ title }}</h1>
        <div v-if="subtitle" class="page-subtitle">{{ subtitle }}</div>
      </header>
      
      <!-- Основний контент -->
      <div class="page-content">
        <slot></slot>
      </div>
    </div>
</template>

<script setup lang="ts">
import BackArrow from './BackArrow.vue'

interface Props {
  title?: string
  subtitle?: string
  showBackArrow?: boolean
}

withDefaults(defineProps<Props>(), {
  showBackArrow: false
})
</script>

<style scoped>
/* Стилі винесені в src/styles/layout.css */
/* Використовуємо спільні класи з layout.css та variables.css */

/* Специфічні стилі для BasePage (якщо потрібно) */
</style>