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
    
    <!-- Навігація -->
    <nav v-if="navigation.length" class="page-navigation">
      <button 
        v-for="navItem in navigation" 
        :key="navItem.path"
        @click="navigateTo(navItem.path)"
        class="nav-button"
      >
        {{ navItem.label }}
      </button>
    </nav>
  </div>
</template>

<script setup lang="ts">
interface NavigationItem {
  path: string
  label: string
}

interface Props {
  title: string
  subtitle?: string
  navigation?: NavigationItem[]
}

const props = withDefaults(defineProps<Props>(), {
  subtitle: '',
  navigation: () => []
})

const navigateTo = (path: string) => {
  console.log('Навігація до:', path)
}
</script>

<style scoped>
.base-page {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  background: linear-gradient(135deg, #1f2937 0%, #111827 100%);
  color: #ffffff;
  font-family: system-ui, -apple-system, sans-serif;
}

.page-header {
  padding: 24px 20px;
  text-align: center;
  background: rgba(31, 41, 55, 0.8);
  backdrop-filter: blur(10px);
  border-bottom: 1px solid #374151;
}

.page-title {
  font-size: clamp(24px, 6vw, 32px);
  font-weight: 700;
  margin: 0 0 12px 0;
  background: linear-gradient(135deg, #ffffff 0%, #e5e7eb 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.page-subtitle {
  font-size: clamp(16px, 4vw, 18px);
  color: #9ca3af;
  font-weight: 400;
  line-height: 1.4;
}

.page-content {
  flex: 1;
  padding: 20px;
  max-width: 600px;
  margin: 0 auto;
  width: 100%;
}

.page-navigation {
  padding: 20px;
  display: flex;
  gap: 12px;
  justify-content: center;
  background: rgba(31, 41, 55, 0.8);
  backdrop-filter: blur(10px);
  border-top: 1px solid #374151;
}

.nav-button {
  padding: 12px 24px;
  background: linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%);
  color: white;
  border: none;
  border-radius: 12px;
  cursor: pointer;
  font-size: 16px;
  font-weight: 600;
  transition: all 0.2s ease;
  box-shadow: 0 4px 12px rgba(139, 92, 246, 0.3);
}

.nav-button:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(139, 92, 246, 0.4);
}

.nav-button:active {
  transform: translateY(0);
}
</style>
