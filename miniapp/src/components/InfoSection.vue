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
  .info-section {
    margin-bottom: 32px;
    width: 100%;
    padding: 24px;
    background: rgba(55, 65, 81, 0.3);
    border-radius: 12px;
    border: 1px solid rgba(75, 85, 99, 0.5);
    box-sizing: border-box;
  }
  
  .section-title {
    font-size: clamp(18px, 4.5vw, 22px);
    font-weight: 600;
    color: #ffffff;
    margin: 0 0 16px 0;
    padding-bottom: 12px;
    border-bottom: 2px solid #8b5cf6;
  }
  
  .section-content {
    color: #e5e7eb;
    line-height: 1.6;
  }
  
  /* Адаптивні відступи для різних розмірів екрану */
  @media (max-width: 1200px) {
    .info-section {
      padding: 20px;
    }
  }
  
  @media (max-width: 768px) {
    .info-section {
      padding: 18px;
    }
  }
  
  @media (max-width: 480px) {
    .info-section {
      padding: 16px;
      margin-bottom: 24px;
    }
  }
  
  @media (max-width: 320px) {
    .info-section {
      padding: 14px;
      margin-bottom: 20px;
    }
  }
  </style>