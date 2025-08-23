<template>
    <section class="info-section">
      <h2 class="section-title">{{ title }}</h2>
      <div class="section-content">
        <slot></slot>
      </div>
    </section>
  </template>
  
  <script setup lang="ts">
  interface Props {
    title: string
  }
  
  defineProps<Props>()
  </script>
  
  <style scoped>
/* Стилі винесені в спільні файли */
/* Використовуємо класи з layout.css та variables.css */

/* Специфічні стилі для InfoSection */
.info-section {
  margin-bottom: var(--spacing-3xl);
  width: 100%;
  padding: var(--spacing-2xl);
  background: rgba(55, 65, 81, 0.3);
  border-radius: var(--radius-md);
  border: 1px solid var(--color-border-primary);
  box-sizing: border-box;
}

.section-title {
  font-size: clamp(18px, 4.5vw, 22px);
  font-weight: var(--font-weight-semibold);
  color: var(--color-text-primary);
  margin: 0 0 var(--spacing-lg) 0;
  padding-bottom: var(--spacing-md);
  border-bottom: 2px solid var(--color-primary);
}

.section-content {
  color: var(--color-text-secondary);
  line-height: 1.6;
}

/* Адаптивні відступи для різних розмірів екрану */
@media (max-width: 1200px) {
  .info-section {
    padding: var(--spacing-xl);
  }
}

@media (max-width: 768px) {
  .info-section {
    padding: var(--spacing-xl);
  }
}

@media (max-width: 480px) {
  .info-section {
    padding: var(--spacing-lg);
    margin-bottom: var(--spacing-2xl);
  }
}

@media (max-width: 320px) {
  .info-section {
    padding: var(--spacing-md);
    margin-bottom: var(--spacing-xl);
  }
}
</style>