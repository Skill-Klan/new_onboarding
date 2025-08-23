<template>
    <button class="study-button" @click="navigateToStudy">
      <span class="button-icon">🎓</span>
      <span class="button-text">Як попасти на навчання</span>
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
  .study-button {
    display: flex;
    align-items: center;
    gap: 12px;
    padding: 16px 24px;
    background: linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%);
    border: none;
    border-radius: 12px;
    color: white;
    font-size: 16px;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.3s ease;
    box-shadow: 0 4px 15px rgba(139, 92, 246, 0.3);
    width: 100%;
    max-width: 400px;
    margin: 20px auto;
    justify-content: center;
  }
  
  .study-button:hover {
    transform: translateY(-2px);
    box-shadow: 0 8px 25px rgba(139, 92, 246, 0.4);
    background: linear-gradient(135deg, #7c3aed 0%, #6d28d9 100%);
  }
  
  .study-button:active {
    transform: translateY(0);
  }
  
  .button-icon {
    font-size: 20px;
  }
  
  .button-text {
    font-size: 16px;
    font-weight: 600;
  }
  
  /* Адаптивність */
  @media (max-width: 768px) {
    .study-button {
      padding: 14px 20px;
      font-size: 15px;
    }
    
    .button-text {
      font-size: 15px;
    }
  }
  
  @media (max-width: 480px) {
    .study-button {
      padding: 12px 16px;
      font-size: 14px;
    }
    
    .button-text {
      font-size: 14px;
    }
    
    .button-icon {
      font-size: 18px;
    }
  }
  </style>