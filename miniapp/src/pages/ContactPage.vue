<template>
  <BasePage 
    title="Контакти"
    subtitle="Залиште свої дані для зв'язку"
  >
    <div class="contact-form">
      <div class="form-group">
        <label>Ім'я</label>
        <input 
          type="text" 
          v-model="form.name" 
          placeholder="Введіть ваше ім'я"
          required
          @input="formatNameAndClearErrors"
          @keypress="allowOnlyLetters"
          maxlength="50"
          :class="{ 'error': showErrors && errors.name }"
        >
        <!-- Підсказка про введення тільки літер -->
        <span v-if="showNameHint" class="hint-message">
          Введіть тільки літери
        </span>
        <span v-if="showErrors && errors.name" class="error-message">{{ errors.name }}</span>
      </div>
      
      <div class="form-group">
        <label>Номер телефону</label>
        <input 
          type="tel" 
          v-model="form.phone" 
          placeholder="+380"
          required
          @input="formatPhoneAndClearErrors"
          @keypress="allowOnlyNumbers"
          maxlength="13"
          :class="{ 'error': showErrors && errors.phone }"
        >
        <!-- Підсказка про введення тільки цифр -->
        <span v-if="showPhoneHint" class="hint-message">
          Введіть тільки цифри номера телефону
        </span>
        <span v-if="showErrors && errors.phone" class="error-message">{{ errors.phone }}</span>
      </div>
      
      <button @click="submitForm" class="submit-btn">
        Надіслати
      </button>
    </div>
  </BasePage>
</template>

<script setup lang="ts">
import BasePage from '../components/BasePage.vue'
import { ref } from 'vue'

const form = ref({
  name: '',
  phone: ''
})

const errors = ref({
  name: '',
  phone: ''
})

const showErrors = ref(false)
const showPhoneHint = ref(false)
const showNameHint = ref(false)

// Дозволити тільки літери, пробіли та дефіси в імені
const allowOnlyLetters = (event: KeyboardEvent) => {
  const key = event.key
  
  // Дозволити літери (українські та англійські)
  if (/[а-яА-Яa-zA-Z]/.test(key)) {
    // Якщо введено літеру, приховати підказку
    showNameHint.value = false
    return true
  }
  
  // Дозволити пробіл та дефіс
  if ([' ', '-'].includes(key)) {
    // Якщо введено пробіл або дефіс, приховати підказку
    showNameHint.value = false
    return true
  }
  
  // Дозволити Backspace, Delete, Tab, Escape, Enter
  if (['Backspace', 'Delete', 'Tab', 'Escape', 'Enter'].includes(key)) {
    return true
  }
  
  // Показати підказку при спробі ввести недопустимий символ
  showNameHint.value = true
  
  // Заборонити всі інші символи (включаючи цифри)
  event.preventDefault()
  return false
}

// Форматування імені та очищення помилок
const formatNameAndClearErrors = () => {
  // Очистити помилку імені при новому введенні
  if (errors.value.name) {
    errors.value.name = ''
  }
  
  // Форматування імені
  let name = form.value.name
  
  // Видалити всі символи крім літер, пробілів та дефісів
  name = name.replace(/[^а-яА-Яa-zA-Z\s\-]/g, '')
  
  // Обмежити довжину
  if (name.length > 50) {
    name = name.substring(0, 50)
  }
  
  // Прибрати зайві пробіли на початку та в кінці
  name = name.trim()
  
  form.value.name = name
  
  // Якщо в полі є літери, приховати підказку
  if (name.replace(/[^\а-яА-Яa-zA-Z]/g, '').length > 0) {
    showNameHint.value = false
  }
}

// Форматування номера телефону та очищення помилок
const formatPhoneAndClearErrors = () => {
  // Очистити помилку телефону при новому введенні
  if (errors.value.phone) {
    errors.value.phone = ''
  }
  
  // Форматування номера
  let phone = form.value.phone
  
  // Видалити всі символи крім цифр та +
  phone = phone.replace(/[^\d+]/g, '')
  
  // Обмежити довжину
  if (phone.length > 13) {
    phone = phone.substring(0, 13)
  }
  
  // Автоматично додати +380 якщо користувач вводить 10 цифр починаючи з 0
  if (phone.startsWith('0') && phone.length === 10 && !phone.startsWith('+38')) {
    phone = '+38' + phone
  }
  
  // Якщо номер починається з +38, перевірити чи потрібно додати 0 на початок
  if (phone.startsWith('+38') && phone.length === 12) {
    // Якщо після +38 немає 0, додати його
    if (!phone.substring(3).startsWith('0')) {
      phone = '+380' + phone.substring(3)
    }
  }
  
  form.value.phone = phone
  
  // Якщо в полі є цифри, приховати підказку
  if (phone.replace(/[^\d]/g, '').length > 0) {
    showPhoneHint.value = false
  }
}

// Дозволити тільки цифри та +
const allowOnlyNumbers = (event: KeyboardEvent) => {
  const key = event.key
  
  // Дозволити цифри 0-9
  if (/[0-9]/.test(key)) {
    // Якщо введено цифру, приховати підказку
    showPhoneHint.value = false
    return true
  }
  
  // Дозволити + тільки на початку
  if (key === '+' && form.value.phone.length === 0) {
    return true
  }
  
  // Дозволити Backspace, Delete, Tab, Escape, Enter
  if (['Backspace', 'Delete', 'Tab', 'Escape', 'Enter'].includes(key)) {
    return true
  }
  
  // Показати підказку при спробі ввести недопустимий символ
  showPhoneHint.value = true
  
  // Заборонити всі інші символи
  event.preventDefault()
  return false
}

// Валідація українського номера телефону
const validatePhone = (): boolean => {
  let phone = form.value.phone.trim()
  
  if (!phone) {
    errors.value.phone = 'Номер телефону обов\'язковий'
    return false
  }
  
  // Видалити +38 якщо є
  if (phone.startsWith('+38')) {
    phone = phone.substring(3)
  }
  
  // Перевірити чи залишилося 9 цифр
  if (phone.length !== 9) {
    errors.value.phone = 'Номер має містити 9 цифр'
    return false
  }
  
  // Перевірити чи всі символи - цифри
  if (!/^\d{9}$/.test(phone)) {
    errors.value.phone = 'Номер має містити тільки цифри'
    return false
  }
  
  // Перевірити чи номер починається з 0
  if (!phone.startsWith('0')) {
    errors.value.phone = 'Номер має починатися з 0'
    return false
  }
  
  errors.value.phone = ''
  return true
}

// Валідація імені
const validateName = (): boolean => {
  const name = form.value.name.trim()
  
  if (!name) {
    errors.value.name = 'Ім\'я обов\'язкове'
    return false
  }
  
  if (name.length < 2) {
    errors.value.name = 'Ім\'я має бути не менше 2 символів'
    return false
  }
  
  if (name.length > 50) {
    errors.value.name = 'Ім\'я має бути не більше 50 символів'
    return false
  }
  
  // Перевірити чи ім'я містить тільки літери, пробіли та дефіси
  if (!/^[а-яА-Яa-zA-Z\s\-]+$/.test(name)) {
    errors.value.name = 'Ім\'я має містити тільки літери'
    return false
  }
  
  errors.value.name = ''
  return true
}

const submitForm = () => {
  // Показати помилки тільки при спробі відправки
  showErrors.value = true
  
  // Валідувати обидва поля
  const isNameValid = validateName()
  const isPhoneValid = validatePhone()
  
  if (isNameValid && isPhoneValid) {
    console.log('Форма відправлена:', form.value)
    // Тут буде логіка відправки
    alert('Дякуємо! Ваші дані збережено.')
    
    // Очистити форму та помилки
    form.value.name = ''
    form.value.phone = ''
    errors.value.name = ''
    errors.value.phone = ''
    showErrors.value = false
    showPhoneHint.value = false
    showNameHint.value = false
  }
}
</script>

<style scoped>
.contact-form {
  max-width: 500px;
  margin: 0 auto;
}

.form-group {
  margin-bottom: 20px;
}

.form-group label {
  display: block;
  margin-bottom: 8px;
  color: #ffffff;
  font-weight: 500;
}

.form-group input {
  width: 100%;
  padding: 12px 16px;
  background: rgba(55, 65, 81, 0.6);
  border: 2px solid transparent;
  border-radius: 8px;
  color: #ffffff;
  font-size: 16px;
  transition: all 0.2s ease;
  box-sizing: border-box;
}

.form-group input:focus {
  outline: none;
  border-color: #8b5cf6;
  background: rgba(75, 85, 99, 0.8);
}

.form-group input.error {
  border-color: #ef4444;
  background: rgba(239, 68, 68, 0.1);
}

.form-group input::placeholder {
  color: #9ca3af;
}

.hint-message {
  display: block;
  margin-top: 6px;
  color: #8b5cf6;
  font-size: 14px;
  font-weight: 500;
  font-style: italic;
}

.error-message {
  display: block;
  margin-top: 6px;
  color: #ef4444;
  font-size: 14px;
  font-weight: 500;
}

.submit-btn {
  width: 100%;
  padding: 12px 16px;
  background: linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%);
  color: white;
  border: none;
  border-radius: 8px;
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
  box-sizing: border-box;
  margin-top: 8px;
}

.submit-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(139, 92, 246, 0.4);
}

.submit-btn:active {
  transform: translateY(0);
}
</style>
