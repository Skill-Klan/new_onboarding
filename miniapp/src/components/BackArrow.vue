<template>
    <div class="back-arrow" @click="goBack">
      <div class="arrow-icon">←</div>
      <span class="back-text">Назад</span>
    </div>
  </template>
  
  <script setup lang="ts">
  import { useRouter } from 'vue-router'
  
  const router = useRouter()
  
  const goBack = () => {
    router.go(-1)
  }
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
    transition: all 0.2s ease;
    z-index: 1000;
    backdrop-filter: blur(10px);
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
  }
  
  .back-text {
    font-size: 14px;
    color: #e5e7eb;
    font-weight: 500;
  }
  
  @media (max-width: 768px) {
    .back-arrow {
      top: 15px;
      left: 15px;
      padding: 10px 14px;
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
    
    .arrow-icon {
      font-size: 16px;
    }
    
    .back-text {
      font-size: 12px;
    }
  }
  </style>