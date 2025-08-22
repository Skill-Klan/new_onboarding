<template>
  <BasePage 
    title="Business Analysis"
    subtitle="Виберіть напрям, який вам ближче"
  >
    <div class="options-list">
      <div class="option-item">
        <input type="radio" id="ba1" name="ba" value="1" v-model="selectedOption">
        <label for="ba1" class="option-label">
          <span class="radio-custom"></span>
          <span class="option-text">Аналізувати ринок та конкурентів</span>
        </label>
      </div>
      
      <div class="option-item">
        <input type="radio" id="ba2" name="ba" value="2" v-model="selectedOption">
        <label for="ba2" class="option-label">
          <span class="radio-custom"></span>
          <span class="option-text">Продумувати бізнес-процеси</span>
        </label>
      </div>
      
      <div class="option-item">
        <input type="radio" id="ba3" name="ba" value="3" v-model="selectedOption">
        <label for="ba3" class="option-label">
          <span class="radio-custom"></span>
          <span class="option-text">Створювати технічні завдання</span>
        </label>
      </div>
    </div>
    
    <button @click="continueAction" class="continue-btn">Продовжити</button>
  </BasePage>
</template>

<script setup lang="ts">
import BasePage from '../components/BasePage.vue'
import { ref } from 'vue'

const selectedOption = ref('')

const continueAction = () => {
  if (selectedOption.value) {
    console.log('Вибрано опцію:', selectedOption.value)
    // Тут буде логіка переходу далі
  }
}
</script>

<style scoped>
.options-list {
  display: flex;
  flex-direction: column;
  gap: 16px;
  margin-bottom: 32px;
}

.option-item {
  position: relative;
}

.option-item input[type="radio"] {
  display: none;
}

.option-label {
  display: flex;
  align-items: center;
  padding: 20px;
  background: rgba(55, 65, 81, 0.6);
  border: 2px solid transparent;
  border-radius: 12px;
  cursor: pointer;
  transition: all 0.2s ease;
}

.option-label:hover {
  background: rgba(75, 85, 99, 0.8);
  border-color: #8b5cf6;
}

.radio-custom {
  width: 20px;
  height: 20px;
  border: 2px solid #6b7280;
  border-radius: 50%;
  margin-right: 16px;
  position: relative;
  transition: all 0.2s ease;
}

.option-item input[type="radio"]:checked + .option-label .radio-custom {
  border-color: #8b5cf6;
  background: #8b5cf6;
}

.option-item input[type="radio"]:checked + .option-label .radio-custom::after {
  content: '';
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 8px;
  height: 8px;
  background: white;
  border-radius: 50%;
}

.option-text {
  color: #ffffff;
  font-size: 16px;
  font-weight: 500;
  line-height: 1.4;
}

.continue-btn {
  width: 100%;
  padding: 16px;
  background: linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%);
  color: white;
  border: none;
  border-radius: 12px;
  font-size: 18px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
}

.continue-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(139, 92, 246, 0.4);
}

.continue-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
  transform: none;
}
</style>
