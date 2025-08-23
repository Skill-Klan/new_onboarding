<template>
    <button class="test-task-button" @click="downloadTestTask">
      <span class="button-icon">📋</span>
      <span class="button-text">Отримати тестове завдання</span>
    </button>
  </template>
  
  <script setup lang="ts">
  import { useRoute } from 'vue-router'
  
  const route = useRoute()
  const profession = route.params.profession as string
  
  const downloadTestTask = async () => {
    try {
      // Шлях до PDF файлу в залежності від професії
      const pdfPath = `/src/data/test-tasks/${profession}-test-task.pdf`
      
      // Створюємо посилання для завантаження
      const link = document.createElement('a')
      link.href = pdfPath
      link.download = `${profession.toUpperCase()}-test-task.pdf`
      
      // Додаємо посилання до DOM та клікаємо
      document.body.appendChild(link)
      link.click()
      
      // Видаляємо посилання
      document.body.removeChild(link)
    } catch (error) {
      console.error('Помилка завантаження тестового завдання:', error)
      alert('Помилка завантаження. Спробуйте ще раз.')
    }
  }
  </script>
  
  <style scoped>
  .test-task-button {
    display: flex;
    align-items: center;
    gap: 12px;
    padding: 16px 24px;
    background: linear-gradient(135deg, #10b981 0%, #059669 100%);
    border: none;
    border-radius: 12px;
    color: white;
    font-size: 16px;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.3s ease;
    box-shadow: 0 4px 15px rgba(16, 185, 129, 0.3);
    width: 100%;
    max-width: 400px;
    margin: 20px auto;
    justify-content: center;
  }
  
  .test-task-button:hover {
    transform: translateY(-2px);
    box-shadow: 0 8px 25px rgba(16, 185, 129, 0.4);
    background: linear-gradient(135deg, #059669 0%, #047857 100%);
  }
  
  .test-task-button:active {
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
    .test-task-button {
      padding: 14px 20px;
      font-size: 15px;
    }
    
    .button-text {
      font-size: 15px;
    }
  }
  
  @media (max-width: 480px) {
    .test-task-button {
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