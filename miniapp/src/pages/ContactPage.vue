<template>
  <BasePage 
    title="Контакти"
    subtitle="Залиште свої дані для зв'язку"
  >
    <div class="form-container">
      <div class="form-group">
        <label class="form-label">Ім'я</label>
        <input 
          type="text" 
          class="form-input"
          v-model="form.name" 
          placeholder="Введіть ваше ім'я"
          required
          @input="formatNameAndClearErrors"
          @keypress="allowOnlyLetters"
          maxlength="50"
          :class="{ 'error': showErrors && errors.name }"
        >
        <span v-if="showNameHint" class="form-message hint">
          Введіть тільки літери
        </span>
        <span v-if="showErrors && errors.name" class="form-message error">{{ errors.name }}</span>
      </div>
      
      <div class="form-group">
        <label class="form-label">Номер телефону</label>
        <input 
          type="tel" 
          class="form-input"
          v-model="form.phone" 
          placeholder="+380"
          required
          @input="formatPhoneAndClearErrors"
          @keypress="allowOnlyNumbers"
          maxlength="13"
          :class="{ 'error': showErrors && errors.phone }"
        >
        <span v-if="showPhoneHint" class="form-message hint">
          Введіть тільки цифри номера телефону
        </span>
        <span v-if="showErrors && errors.phone" class="form-message error">{{ errors.phone }}</span>
      </div>
      
      <button @click="submitForm" class="btn btn-primary form-submit" :disabled="isSubmitting">
        {{ isSubmitting ? 'Відправляємо...' : 'Надіслати' }}
      </button>
    </div>
  </BasePage>
</template>

<script setup lang="ts">
import BasePage from '../components/BasePage.vue'
import { ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'

const route = useRoute()
const router = useRouter()

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
const isSubmitting = ref(false)

// Отримати параметри з URL
const profession = route.query.profession as string
const returnTo = route.query.returnTo as string
const telegramId = route.query.telegramId as string

const submitForm = async () => {
  // Показати помилки тільки при спробі відправки
  showErrors.value = true
  
  // Валідувати обидва поля
  const isNameValid = validateName()
  const isPhoneValid = validatePhone()
  
  if (isNameValid && isPhoneValid) {
    isSubmitting.value = true
    
    try {
      const response = await fetch('/api/test-task-request', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: form.value.name,
          phone: form.value.phone,
          email: '',
          profession: profession || 'qa',
          telegram_id: telegramId ? parseInt(telegramId) : null
        })
      })
      
      const result = await response.json()
      
      if (result.success) {
        alert('Контактні дані збережено успішно!')
        
        // Якщо є куди повертатися - повертаємося
        if (returnTo) {
          router.push(returnTo)
        } else {
          router.push('/')
        }
      } else {
        alert(`Помилка: ${result.error}`)
      }
      
    } catch (error) {
      console.error('Помилка збереження:', error)
      alert('Помилка збереження. Спробуйте ще раз.')
    } finally {
      isSubmitting.value = false
    }
  }
}

// Дозволити тільки літери, пробіли та дефіси в імені
const allowOnlyLetters = (event: KeyboardEvent) => {
  const key = event.key
  
  // Дозволити літери (українські та англійські)
  if (/[а-яА-Яa-zA-Z]/.test(key)) {
    showNameHint.value = false
    return true
  }
  
  // Дозволити пробіл та дефіс
  if ([' ', '-'].includes(key)) {
    showNameHint.value = false
    return true
  }
  
  // Дозволити Backspace, Delete, Tab, Escape, Enter
  if (['Backspace', 'Delete', 'Tab', 'Escape', 'Enter'].includes(key)) {
    return true
  }
  
  // Показати підказку при спробі ввести недопустимий символ
  showNameHint.value = true
  
  // Заборонити всі інші символи
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
</script>

<style scoped>
/* Стилі винесені в src/pages/styles/contact-page.css */
/* Використовуємо спільні класи з forms.css та buttons.css */

/* Додаткові специфічні стилі для контактної форми (якщо потрібно) */
</style>