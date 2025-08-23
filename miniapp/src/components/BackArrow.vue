<template>
    <div class="back-arrow" :class="{ 'collapsed': !showText }" @click="goBack">
      <div class="arrow-icon">←</div>
      <span class="back-text">Назад</span>
    </div>
  </template>
  
  <script setup lang="ts">
  import { useRouter } from 'vue-router'
  import { ref, onMounted, onUnmounted } from 'vue'
  
  const router = useRouter()
  const showText = ref(true)
  
  const goBack = () => {
    router.go(-1)
  }
  
  const handleScroll = () => {
    const scrollTop = window.pageYOffset || document.documentElement.scrollTop
    
    if (scrollTop > 100) {
      showText.value = false
    } else {
      showText.value = true
    }
  }
  
  onMounted(() => {
    window.addEventListener('scroll', handleScroll)
  })
  
  onUnmounted(() => {
    window.removeEventListener('scroll', handleScroll)
  })
  </script>
  
  <style scoped>
/* Стилі винесені в спільні файли */
/* Використовуємо класи з layout.css та variables.css */

/* Специфічні стилі для BackArrow */
.back-arrow {
  position: fixed;
  top: 20px;
  left: 20px;
  display: flex;
  align-items: center;
  gap: var(--spacing-sm);
  padding: var(--spacing-md) var(--spacing-lg);
  background: var(--color-bg-tertiary);
  border: 1px solid var(--color-border-secondary);
  border-radius: var(--radius-xl);
  cursor: pointer;
  transition: var(--transition-normal);
  z-index: var(--z-fixed);
  backdrop-filter: blur(10px);
  overflow: hidden;
}

.back-arrow.collapsed {
  padding: var(--spacing-md);
  width: 20px;
  height: 20px;
  border-radius: var(--radius-full);
  justify-content: center;
  align-items: center;
}

.back-arrow:hover {
  background: rgba(75, 85, 99, 0.9);
  border-color: var(--color-primary);
  transform: translateX(-2px);
}

.back-arrow:active {
  transform: translateX(0);
}

.arrow-icon {
  font-size: var(--font-size-lg);
  color: var(--color-primary);
  font-weight: var(--font-weight-bold);
  transition: var(--transition-normal);
  flex-shrink: 0;
}

.back-text {
  font-size: var(--font-size-sm);
  color: var(--color-text-secondary);
  font-weight: var(--font-weight-medium);
  transition: var(--transition-normal);
  white-space: nowrap;
}

.back-arrow.collapsed .back-text {
  opacity: 0;
  transform: translateX(-20px);
  width: 0;
  margin: 0;
  position: absolute;
}

/* Адаптивність для мобільних */
@media (max-width: 768px) {
  .back-arrow {
    top: 15px;
    left: 15px;
    padding: var(--spacing-md) var(--spacing-md);
  }
  
  .back-arrow.collapsed {
    padding: var(--spacing-md);
    width: 20px;
    height: 20px;
  }
  
  .back-text {
    font-size: 13px;
  }
}

@media (max-width: 480px) {
  .back-arrow {
    top: 10px;
    left: 10px;
    padding: var(--spacing-sm) var(--spacing-md);
  }
  
  .back-arrow.collapsed {
    padding: var(--spacing-sm);
    width: 20px;
    height: 20px;
  }
  
  .arrow-icon {
    font-size: var(--font-size-md);
  }
  
  .back-text {
    font-size: 12px;
  }
}
</style>