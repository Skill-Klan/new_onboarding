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
  .back-arrow {
    position: fixed;
    top: 20px;
    left: 20px;
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 12px 16px;
    background: rgba(75, 85, 99, 0.8);
    border: 1px solid rgba(139, 92, 246, 0.3);
    border-radius: 25px;
    cursor: pointer;
    transition: all 0.3s ease;
    z-index: 1000;
    backdrop-filter: blur(10px);
    overflow: hidden;
  }
  
  .back-arrow.collapsed {
    padding: 12px;
    width: 20px;
    height: 20px;
    border-radius: 50%;
    justify-content: center; /* Центруємо стрілку по горизонталі */
    align-items: center; /* Центруємо стрілку по вертикалі */
  }
  
  .back-arrow:hover {
    background: rgba(75, 85, 99, 0.9);
    border-color: #8b5cf6;
    transform: translateX(-2px);
  }
  
  .back-arrow:active {
    transform: translateX(0);
  }
  
  .arrow-icon {
    font-size: 18px;
    color: #8b5cf6;
    font-weight: bold;
    transition: all 0.3s ease;
    flex-shrink: 0;
  }
  
  .back-text {
    font-size: 14px;
    color: #e5e7eb;
    font-weight: 500;
    transition: all 0.3s ease;
    white-space: nowrap;
  }
  
  .back-arrow.collapsed .back-text {
    opacity: 0;
    transform: translateX(-20px);
    width: 0;
    margin: 0;
    position: absolute; /* Прибираємо з потоку документа */
  }
  
  /* Адаптивність для мобільних */
  @media (max-width: 768px) {
    .back-arrow {
      top: 15px;
      left: 15px;
      padding: 10px 14px;
    }
    
    .back-arrow.collapsed {
      padding: 10px;
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
      padding: 8px 12px;
    }
    
    .back-arrow.collapsed {
      padding: 8px;
      width: 20px;
      height: 20px;
    }
    
    .arrow-icon {
      font-size: 16px;
    }
    
    .back-text {
      font-size: 12px;
    }
  }
  </style>