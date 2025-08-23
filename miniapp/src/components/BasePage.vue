<template>
  <div class="base-page">
    <!-- Заголовок сторінки -->
    <header class="page-header">
      <h1 class="page-title">{{ title }}</h1>
      <div v-if="subtitle" class="page-subtitle">{{ subtitle }}</div>
    </header>
    
    <!-- Основний контент -->
    <main class="page-content">
      <slot></slot>
    </main>
    
    <!-- Кнопки дій -->
    <div v-if="actions.length" class="page-actions">
      <button 
        v-for="action in actions" 
        :key="action.id"
        @click="action.onClick"
        :class="['action-btn', action.variant]"
      >
        {{ action.label }}
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
interface ActionButton {
  id: string
  label: string
  variant: 'primary' | 'secondary' | 'outline'
  onClick: () => void
}

interface Props {
  title: string
  subtitle?: string
  actions?: ActionButton[]
}

const props = withDefaults(defineProps<Props>(), {
  subtitle: '',
  actions: () => []
})
</script>

<style scoped>
.base-page {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  background: linear-gradient(135deg, #1f2937 0%, #111827 100%);
  color: #ffffff;
  font-family: system-ui, -apple-system, sans-serif;
  width: 100%;
  max-width: 100%;
}

.page-header {
  padding: 24px 0;
  text-align: center;
  background: rgba(31, 41, 55, 0.8);
  backdrop-filter: blur(10px);
  border-bottom: 1px solid #374151;
  width: 100%;
  max-width: 100%;
}

.page-title {
  font-size: clamp(24px, 6vw, 32px);
  font-weight: 700;
  margin: 0 0 12px 0;
  background: linear-gradient(135deg, #ffffff 0%, #e5e7eb 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  width: 100%;
  max-width: calc(100% - 100px);
  padding: 0 50px;
  margin: 0 auto 12px auto;
  box-sizing: border-box;
}

.page-subtitle {
  font-size: clamp(16px, 4vw, 18px);
  color: #9ca3af;
  font-weight: 400;
  line-height: 1.4;
  width: 100%;
  max-width: calc(100% - 100px);
  padding: 0 50px;
  margin: 0 auto;
  box-sizing: border-box;
}

.page-content {
  flex: 1;
  padding: 20px 0;
  width: 100%;
  max-width: calc(100% - 100px);
  margin: 0 auto;
  box-sizing: border-box;
}

.page-actions {
  padding: 20px 0;
  display: flex;
  gap: 12px;
  justify-content: center;
  background: rgba(31, 41, 55, 0.8);
  backdrop-filter: blur(10px);
  border-top: 1px solid #374151;
  width: 100%;
  max-width: 100%;
}

.action-btn {
  padding: 12px 24px;
  border: none;
  border-radius: 8px;
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
  box-sizing: border-box;
}

.action-btn.primary {
  background: linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%);
  color: white;
}

.action-btn.secondary {
  background: rgba(75, 85, 99, 0.8);
  color: white;
}

.action-btn.outline {
  background: transparent;
  color: #8b5cf6;
  border: 2px solid #8b5cf6;
}

.action-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(139, 92, 246, 0.4);
}

.action-btn:active {
  transform: translateY(0);
}

/* Адаптивні відступи для різних розмірів екрану */
@media (max-width: 1200px) {
  .page-title,
  .page-subtitle,
  .page-content {
    max-width: calc(100% - 80px);
    padding: 0 40px;
  }
}

@media (max-width: 768px) {
  .page-title,
  .page-subtitle,
  .page-content {
    max-width: calc(100% - 60px);
    padding: 0 30px;
  }
}

@media (max-width: 480px) {
  .page-title,
  .page-subtitle,
  .page-content {
    max-width: calc(100% - 40px);
    padding: 0 20px;
  }
  
  .page-content {
    padding: 15px 0;
  }
}

@media (max-width: 320px) {
  .page-title,
  .page-subtitle,
  .page-content {
    max-width: calc(100% - 30px);
    padding: 0 15px;
  }
  
  .page-content {
    padding: 10px 0;
  }
}
</style>