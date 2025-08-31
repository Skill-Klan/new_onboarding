<template>
  <button class="btn btn-primary test-task-button" @click="handleTestTaskRequest" :disabled="isLoading">
    <span class="btn-icon">📋</span>
    <span class="btn-text">{{ isLoading ? 'Перевіряємо...' : 'Отримати тестове завдання' }}</span>
  </button>
</template>

<script setup lang="ts">
import { useRoute, useRouter } from 'vue-router'
import { ref } from 'vue'

const route = useRoute()
const router = useRouter()
const profession = route.params.profession as string
const isLoading = ref(false)

const handleTestTaskRequest = async () => {
  if (isLoading.value) return
  
  try {
    isLoading.value = true
    
    console.log('=== ПОЧАТОК ОБРОБКИ ЗАПИТУ ===')
    console.log('Поточний шлях:', route.path)
    console.log('Професія:', profession)
    
    // Детальне логування Telegram WebApp
    console.log('1. Перевірка window.Telegram:', window.Telegram)
    console.log('2. Тип window.Telegram:', typeof window.Telegram)
    
    if (window.Telegram) {
      console.log('3. WebApp доступний:', window.Telegram.WebApp)
      console.log('4. Тип WebApp:', typeof window.Telegram.WebApp)
      
      if (window.Telegram.WebApp) {
        console.log('5. WebApp.initDataUnsafe:', window.Telegram.WebApp.initDataUnsafe)
        console.log('6. Тип initDataUnsafe:', typeof window.Telegram.WebApp.initDataUnsafe)
        
        if (window.Telegram.WebApp.initDataUnsafe) {
          console.log('7. User data:', window.Telegram.WebApp.initDataUnsafe.user)
          console.log('8. Тип user:', typeof window.Telegram.WebApp.initDataUnsafe.user)
        }
      }
    }
    
    // Отримати дані користувача з Telegram WebApp
    const telegramUser = window.Telegram?.WebApp?.initDataUnsafe?.user
    
    console.log('9. Отриманий telegramUser:', telegramUser)
    
    if (!telegramUser) {
      console.error('❌ Помилка: telegramUser не знайдено')
      console.error('Доступні властивості window.Telegram:', Object.keys(window.Telegram || {}))
      if (window.Telegram?.WebApp) {
        console.error('Доступні властивості WebApp:', Object.keys(window.Telegram.WebApp))
      }
      alert('Помилка: не вдалося отримати дані користувача')
      return
    }
    
    console.log('10. Використовуємо telegramUser:', telegramUser)
    console.log('11. ID користувача:', telegramUser.id)
    
    // Перевірити, чи є користувач в базі даних
    console.log('12. Відправляємо запит до API...')
    const apiUrl = `/api/check-user/${telegramUser.id}`
    console.log('13. API URL:', apiUrl)
    
    const checkResponse = await fetch(apiUrl)
    console.log('14. Відповідь API отримана:', checkResponse)
    console.log('15. Статус відповіді:', checkResponse.status)
    console.log('16. Заголовки відповіді:', Object.fromEntries(checkResponse.headers.entries()))
    
    const checkResult = await checkResponse.json()
    console.log('17. Результат API:', checkResult)
    
    if (checkResult.exists && checkResult.user.name && checkResult.user.phone) {
      // Користувач існує і має контактні дані - видаємо тестове завдання
      console.log('✅ Користувач існує, завантажуємо тестове завдання')
      await downloadTestTask()
    } else {
      // Користувача немає або немає контактних даних - переходимо на форму
      console.log(' Користувача немає, перенаправляємо на форму контактів')
      console.log('18. Параметри навігації:', {
        path: '/contact',
        query: { 
          profession: profession,
          returnTo: route.path,
          telegramId: telegramUser.id.toString()
        }
      })
      
      router.push({
        path: '/contact',
        query: { 
          profession: profession,
          returnTo: route.path,
          telegramId: telegramUser.id.toString()
        }
      })
    }
    
  } catch (error) {
    console.error('❌ ПОМИЛКА В handleTestTaskRequest:', error)
    console.error('Деталі помилки:', {
      message: error.message,
      name: error.name,
      stack: error.stack,
      cause: error.cause
    })
    
    // Додаткова діагностика
    if (error instanceof TypeError) {
      console.error('TypeError - можливо проблема з fetch або API')
    } else if (error instanceof SyntaxError) {
      console.error('SyntaxError - проблема з JSON')
    }
    
    alert('Помилка перевірки. Спробуйте ще раз.')
  } finally {
    isLoading.value = false
    console.log('=== ЗАВЕРШЕНО ОБРОБКУ ЗАПИТУ ===')
  }
}

const downloadTestTask = async () => {
  try {
    console.log(' Початок завантаження тестового завдання')
    console.log('Професія для завантаження:', profession)
    
    const pdfPath = `/src/data/test-tasks/${profession}-test-task.pdf`
    console.log('Шлях до PDF:', pdfPath)
    
    const link = document.createElement('a')
    link.href = pdfPath
    link.download = `${profession.toUpperCase()}-test-task.pdf`
    
    console.log('Створений link елемент:', link)
    console.log('Link href:', link.href)
    console.log('Link download:', link.download)
    
    document.body.appendChild(link)
    console.log('Link додано до DOM')
    
    link.click()
    console.log('Link клік виконано')
    
    document.body.removeChild(link)
    console.log('Link видалено з DOM')
    
    // Оновити статус в базі даних
    const telegramUser = window.Telegram?.WebApp?.initDataUnsafe?.user
    if (telegramUser) {
      console.log(' Оновлюємо статус в базі даних...')
      
      const updateResponse = await fetch('/api/update-test-task-status', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          telegram_id: telegramUser.id,
          profession: profession,
          status: 'sent'
        })
      })
      
      console.log('Відповідь оновлення статусу:', updateResponse)
      const updateResult = await updateResponse.json()
      console.log('Результат оновлення:', updateResult)
    }
    
    console.log('✅ Тестове завдання успішно завантажено')
    
  } catch (error) {
    console.error('❌ Помилка завантаження тестового завдання:', error)
    console.error('Деталі помилки:', {
      message: error.message,
      name: error.name,
      stack: error.stack
    })
    alert('Помилка завантаження. Спробуйте ще раз.')
  }
}
</script>

<style scoped>
/* Стилі винесені в src/styles/buttons.css */
/* Використовуємо спільні класи з buttons.css та variables.css */

/* Специфічні стилі для TestTaskButton (якщо потрібно) */
</style>