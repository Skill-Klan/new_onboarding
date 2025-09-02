<template>
  <button class="btn btn-primary test-task-button" @click="handleTestTaskRequest" :disabled="isLoading">
    <span class="btn-icon">📋</span>
    <span class="btn-text">{{ isLoading ? 'Перевіряємо...' : 'Отримати тестове завдання' }}</span>
  </button>
</template>

<script setup lang="ts">
import { useRoute, useRouter } from 'vue-router'
import { ref } from 'vue'
import { 
  getTelegramUserId, 
  canUseTelegramContactAPI, 
  requestContactFromTelegram,
  isInTelegramWebApp,
  closeTelegramWebApp,
  closeTelegramWebAppWithBackButton,
  closeTelegramWebAppWithEvent
} from '../core/telegram'
import {
  checkUserInDatabase,
  saveContactToDatabase,
  updateTestTaskStatus,
  convertTelegramContactToContactData,
  validateContactData,
  downloadTestTask as downloadTestTaskUtil,
  sendSuccessMessage
} from '../core/contactService'

// ===== COMPOSABLES =====
const route = useRoute()
const router = useRouter()

// ===== REACTIVE STATE =====
const isLoading = ref(false)
const telegramApiWasCalled = ref(false)

// ===== COMPUTED =====
const profession = route.params.profession as string

// ===== MAIN LOGIC =====

/**
 * Головна функція обробки запиту на тестове завдання
 * Реалізує гібридну логіку: Telegram API → БД → Fallback форма
 */
const handleTestTaskRequest = async (): Promise<void> => {
  if (isLoading.value) return
  
  try {
    isLoading.value = true
    console.log('🚀 Початок обробки запиту на тестове завдання')
    
    // 1. Перевірка середовища
    if (!isInTelegramWebApp()) {
      console.warn('⚠️ Користувач не в Telegram WebApp, переходимо на форму')
      redirectToContactForm()
      return
    }

    // 2. Отримання Telegram User ID
    const telegramId = getTelegramUserId()
    if (!telegramId) {
      console.error('❌ Не вдалося отримати Telegram User ID')
      showError('Помилка: не вдалося ідентифікувати користувача')
      return
    }

    console.log(`✅ Telegram User ID: ${telegramId}`)

    // 3. Перевірка існування користувача в БД
    const userCheckResult = await checkUserInDatabase(telegramId)
    
    if (userCheckResult.exists && userCheckResult.user?.name && userCheckResult.user?.phone) {
      console.log('✅ Користувач існує в БД з контактами')
      await processExistingUser(telegramId)
      return
    }

    // 4. Спроба отримати контакти через Telegram API
    if (canUseTelegramContactAPI()) {
      console.log('📱 Telegram Contact API доступний, пробуємо отримати контакти')
      const success = await tryTelegramContactAPI(telegramId)
      if (success) return
    }

    // 5. Fallback на ручну форму
    console.log('📝 Fallback на ручну форму введення контактів')
    redirectToContactForm(telegramId)

  } catch (error) {
    console.error('❌ Помилка в handleTestTaskRequest:', error)
    showError('Помилка обробки запиту. Спробуйте ще раз.')
  } finally {
    isLoading.value = false
    console.log('🏁 Завершено обробку запиту')
  }
}

/**
 * Обробка існуючого користувача з контактами
 */
const processExistingUser = async (telegramId: number): Promise<void> => {
  try {
    console.log('📥 Завантажуємо тестове завдання для існуючого користувача')
    
    // Завантаження PDF
    downloadTestTaskUtil(profession)
    
    // Оновлення статусу в БД
    await updateTestTaskStatus(telegramId, profession, 'sent')
    
    console.log('✅ Тестове завдання успішно завантажено')
    
    // Якщо Telegram API було викликано, закриваємо WebApp та надсилаємо повідомлення
    const timestamp = new Date().toISOString();
    console.log(`🔍 [${timestamp}] DEBUG: telegramApiWasCalled.value =`, telegramApiWasCalled.value);
    console.log(`🔍 [${timestamp}] DEBUG: window.Telegram =`, window.Telegram);
    console.log(`🔍 [${timestamp}] DEBUG: window.Telegram?.WebApp =`, window.Telegram?.WebApp);
    console.log(`🔍 [${timestamp}] DEBUG: window.location.href =`, window.location.href);
    console.log(`🔍 [${timestamp}] DEBUG: window.navigator.userAgent =`, window.navigator.userAgent);
    
    if (telegramApiWasCalled.value) {
      console.log(`📤 [${timestamp}] Надсилаємо повідомлення та налаштовуємо UX для закриття WebApp`)
      
      // ЯКІР: UX-рішення з інструкціями для закриття WebApp
      // TODO: ГЛОБАЛЬНІ ЗМІНИ - це точка повернення для відкату
      // Показуємо повідомлення з інструкціями
      const successMessage = `✅ Тестове завдання для ${profession.toUpperCase()} готове!

📱 Для завершення:
• Натисніть кнопку "Назад" в Telegram
• Або закрийте WebApp вручну

📋 Завдання збережено в вашому профілі`;
      
      alert(successMessage);
      
      // Показуємо BackButton для зручності
      if (WebApp?.BackButton) {
        console.log(`🔙 [${timestamp}] Показуємо BackButton для зручності користувача`);
        WebApp.BackButton.show();
      }
      
      // Додаємо вібрацію як підтвердження
      if (WebApp?.HapticFeedback) {
        console.log(`📳 [${timestamp}] Додаємо вібрацію як підтвердження`);
        WebApp.HapticFeedback.impactOccurred('medium');
      }
      
      // Спробуємо закрити (може не працювати на мобільних)
      console.log(`🔙 [${timestamp}] Спробуємо закрити WebApp (може не працювати на мобільних)`);
      setTimeout(() => {
        const setTimeoutTimestamp = new Date().toISOString();
        console.log(`🔒 [${setTimeoutTimestamp}] Викликаємо closeTelegramWebAppWithEvent()`);
        closeTelegramWebAppWithEvent();
      }, 100);
      
    } else {
      console.log(`ℹ️ [${timestamp}] Telegram API не було викликано, WebApp не закриваємо`)
    }
    
  } catch (error) {
    console.error('❌ Помилка обробки існуючого користувача:', error)
    throw error
  }
}

/**
 * Спроба отримати контакти через Telegram API
 */
const tryTelegramContactAPI = async (telegramId: number): Promise<boolean> => {
  try {
    const timestamp = new Date().toISOString();
    console.log(`📱 [${timestamp}] Запит контактів через Telegram API...`)
    console.log(`📱 [${timestamp}] DEBUG: window.Telegram =`, window.Telegram);
    console.log(`📱 [${timestamp}] DEBUG: window.Telegram?.WebApp =`, window.Telegram?.WebApp);
    console.log(`📱 [${timestamp}] DEBUG: canUseTelegramContactAPI() =`, canUseTelegramContactAPI());
    console.log(`📱 [${timestamp}] DEBUG: window.location.href =`, window.location.href);
    console.log(`📱 [${timestamp}] DEBUG: window.navigator.userAgent =`, window.navigator.userAgent);
    
    // Встановлюємо флаг, що Telegram API було викликано
    telegramApiWasCalled.value = true
    console.log(`📱 [${timestamp}] telegramApiWasCalled.value встановлено в true`)
    
    const telegramContact = await requestContactFromTelegram()
    if (!telegramContact) {
      console.warn(`⚠️ [${timestamp}] Telegram API не повернув контакти`)
      return false
    }

    console.log(`✅ [${timestamp}] Контакти отримано через Telegram API:`, telegramContact)

    // Конвертація та валідація
    const contactData = convertTelegramContactToContactData(telegramContact, profession, telegramId)
    
    if (!validateContactData(contactData)) {
      console.warn(`⚠️ [${timestamp}] Контакти з Telegram API не пройшли валідацію`)
      return false
    }

    // Збереження в БД
    console.log(`💾 [${timestamp}] Зберігаємо контакти в БД...`)
    await saveContactToDatabase(contactData)
    
    console.log(`✅ [${timestamp}] Контакти збережено в БД`)
    
    // Завантаження тестового завдання
    console.log(`🔄 [${timestamp}] Переходимо до обробки існуючого користувача`)
    await processExistingUser(telegramId)
    
    return true

  } catch (error) {
    const timestamp = new Date().toISOString();
    console.error(`❌ [${timestamp}] Помилка отримання контактів через Telegram API:`, error)
    console.error(`❌ [${timestamp}] DEBUG: error.stack =`, error.stack);
    return false
  }
}

/**
 * Перенаправлення на форму контактів
 */
const redirectToContactForm = (telegramId?: number): void => {
  // Якщо Telegram API було викликано, не перенаправляємо на форму
  if (telegramApiWasCalled.value) {
    console.log('🚫 Telegram API було викликано, не перенаправляємо на форму контактів')
    return
  }
  
  const query: Record<string, string> = {
    profession,
    returnTo: route.path
  }
  
  if (telegramId) {
    query.telegramId = telegramId.toString()
  }

  console.log('🔄 Перенаправлення на форму контактів з параметрами:', query)
  
  router.push({
    path: '/contact',
    query
  })
}

/**
 * Показ помилки користувачу
 */
const showError = (message: string): void => {
  console.error('🚨 Помилка для користувача:', message)
  alert(message)
}

// ===== EXPOSE =====
// Експортуємо тільки те, що потрібно для тестування
defineExpose({
  handleTestTaskRequest,
  tryTelegramContactAPI,
  processExistingUser
})
</script>

<style scoped>
/* Стилі залишаються без змін - використовуються глобальні стилі з buttons.css */
</style>