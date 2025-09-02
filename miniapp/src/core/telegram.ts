// Telegram WebApp API types
declare global {
  interface Window {
    Telegram?: {
      WebApp?: {
        ready: () => void;
        expand: () => void;
        close: () => void;
        initDataUnsafe?: {
          user?: {
            id: number;
            first_name: string;
            last_name?: string;
            username?: string;
            language_code?: string;
            is_premium?: boolean;
            added_to_attachment_menu?: boolean;
            allows_write_to_pm?: boolean;
            photo_url?: string;
          };
          chat?: {
            id: number;
            type: string;
            title?: string;
            username?: string;
            photo_url?: string;
          };
          chat_type?: string;
          chat_instance?: string;
          start_param?: string;
          can_send_after?: number;
          auth_date?: number;
          hash?: string;
        };
        MainButton?: {
          text: string;
          show: () => void;
          hide: () => void;
          onClick: (callback: () => void) => void;
        };
        BackButton?: {
          show: () => void;
          hide: () => void;
          onClick: (callback: () => void) => void;
        };
        HapticFeedback?: {
          impactOccurred: (style: 'light' | 'medium' | 'heavy') => void;
        };
        // Contact API
        requestContact?: () => Promise<TelegramContact>;
        requestPhoneNumber?: () => Promise<TelegramPhoneNumber>;
      };
    };
    // Офіційні API для web events згідно з документацією
    TelegramWebviewProxy?: {
      postEvent: (eventType: string, eventData: any) => void;
    };
  }
}

// Типи для контактів Telegram
export interface TelegramContact {
  phone_number: string;
  first_name: string;
  last_name?: string;
  user_id?: number;
}

export interface TelegramPhoneNumber {
  phone_number: string;
}

// Основні експорти
export const WebApp = window.Telegram?.WebApp;

// ===== ЧИСТІ ФУНКЦІЇ ЗГІДНО З DRY =====

/**
 * Ініціалізація Telegram WebApp
 */
export const initTelegram = (): void => {
  if (WebApp?.ready) {
    WebApp.ready();
    WebApp.expand();
  }
};

/**
 * Отримання користувача з Telegram WebApp
 */
export const getTelegramUser = () => {
  return WebApp?.initDataUnsafe?.user;
};

/**
 * Перевірка доступності Telegram Contact API
 */
export const canUseTelegramContactAPI = (): boolean => {
  return Boolean(WebApp?.requestContact || WebApp?.requestPhoneNumber);
};

/**
 * Отримання контактів через Telegram API
 * @returns Promise з контактами або null при помилці
 */
export const requestContactFromTelegram = async (): Promise<TelegramContact | null> => {
  try {
    if (!canUseTelegramContactAPI()) {
      throw new Error('Telegram Contact API недоступний');
    }

    // Спочатку пробуємо requestContact (повні контакти)
    if (WebApp?.requestContact) {
      return await WebApp.requestContact();
    }

    // Fallback на requestPhoneNumber (тільки номер)
    if (WebApp?.requestPhoneNumber) {
      const phoneData = await WebApp.requestPhoneNumber();
      return {
        phone_number: phoneData.phone_number,
        first_name: getTelegramUser()?.first_name || '',
        last_name: getTelegramUser()?.last_name
      };
    }

    throw new Error('Жоден з Contact API недоступний');
  } catch (error) {
    console.error('Помилка отримання контактів через Telegram:', error);
    return null;
  }
};

/**
 * Перевірка чи користувач знаходиться в Telegram WebApp
 */
export const isInTelegramWebApp = (): boolean => {
  return Boolean(window.Telegram?.WebApp);
};

/**
 * Отримання Telegram User ID
 */
export const getTelegramUserId = (): number | null => {
  const user = getTelegramUser();
  return user?.id || null;
};

/**
 * Закриття Telegram WebApp
 */
/**
 * Закриття Telegram WebApp через офіційну web_app_close подію
 * Згідно з офіційною документацією: https://core.telegram.org/api/web-events#web-app-close
 */
export const closeTelegramWebAppWithEvent = (): void => {
  const timestamp = new Date().toISOString();
  console.log(`🔍 [${timestamp}] DEBUG: Використовуємо офіційну web_app_close подію для закриття WebApp`);
  
  // ЯКІР: Офіційна web_app_close подія для закриття WebApp
  // TODO: ГЛОБАЛЬНІ ЗМІНИ - це точка повернення для відкату
  console.log(`🔍 [${timestamp}] DEBUG: window.TelegramWebviewProxy =`, window.TelegramWebviewProxy);
  console.log(`🔍 [${timestamp}] DEBUG: window.external =`, window.external);
  console.log(`🔍 [${timestamp}] DEBUG: window.parent =`, window.parent);
  console.log(`🔍 [${timestamp}] DEBUG: WebApp =`, WebApp);
  console.log(`🔍 [${timestamp}] DEBUG: WebApp?.close =`, WebApp?.close);
  console.log(`🔍 [${timestamp}] DEBUG: WebApp?.BackButton =`, WebApp?.BackButton);
  console.log(`🔍 [${timestamp}] DEBUG: window.location.href =`, window.location.href);
  console.log(`🔍 [${timestamp}] DEBUG: window.navigator.userAgent =`, window.navigator.userAgent);
  
  try {
    // Спочатку пробуємо прямий виклик WebApp.close()
    if (WebApp?.close) {
      console.log(`🔒 [${timestamp}] Пробуємо прямий виклик WebApp.close()`);
      try {
        WebApp.close();
        console.log(`✅ [${timestamp}] WebApp.close() викликано успішно`);
        return;
      } catch (closeError) {
        console.error(`❌ [${timestamp}] Помилка при виклику WebApp.close():`, closeError);
      }
    }
    
    // Спробуємо використати офіційну web_app_close подію
    if (typeof window !== 'undefined' && window.TelegramWebviewProxy?.postEvent) {
      console.log(`📤 [${timestamp}] Відправляємо web_app_close подію через TelegramWebviewProxy`);
      try {
        window.TelegramWebviewProxy.postEvent('web_app_close', {});
        console.log(`✅ [${timestamp}] web_app_close подія відправлена успішно через TelegramWebviewProxy`);
        return;
      } catch (proxyError) {
        console.error(`❌ [${timestamp}] Помилка через TelegramWebviewProxy:`, proxyError);
      }
    }
    
    // Альтернативний спосіб через window.external
    if (typeof window !== 'undefined' && (window.external as any)?.notify) {
      console.log(`📤 [${timestamp}] Відправляємо web_app_close подію через window.external`);
      try {
        (window.external as any).notify(JSON.stringify({
          eventType: 'web_app_close',
          eventData: {}
        }));
        console.log(`✅ [${timestamp}] web_app_close подія відправлена через window.external`);
        return;
      } catch (externalError) {
        console.error(`❌ [${timestamp}] Помилка через window.external:`, externalError);
      }
    }
    
    // Fallback через postMessage API
    if (typeof window !== 'undefined' && window.parent?.postMessage) {
      console.log(`📤 [${timestamp}] Відправляємо web_app_close подію через postMessage`);
      try {
        window.parent.postMessage(JSON.stringify({
          eventType: 'web_app_close',
          eventData: {}
        }), '*');
        console.log(`✅ [${timestamp}] web_app_close подія відправлена через postMessage`);
        return;
      } catch (postMessageError) {
        console.error(`❌ [${timestamp}] Помилка через postMessage:`, postMessageError);
      }
    }
    
    // Якщо нічого не спрацювало, використовуємо старий метод
    console.warn(`⚠️ [${timestamp}] Офіційні методи недоступні, використовуємо fallback`);
    closeTelegramWebAppWithBackButton();
    
  } catch (error) {
    console.error(`❌ [${timestamp}] Помилка при відправці web_app_close події:`, error);
    console.warn(`⚠️ [${timestamp}] Використовуємо fallback метод`);
    closeTelegramWebAppWithBackButton();
  }
};

/**
 * Закриття Telegram WebApp через BackButton (fallback)
 * Рішення згідно з GitHub Issue #566
 */
export const closeTelegramWebAppWithBackButton = (): void => {
  const timestamp = new Date().toISOString();
  console.log(`🔍 [${timestamp}] DEBUG: Використовуємо BackButton workaround для закриття WebApp`);
  console.log(`🔍 [${timestamp}] DEBUG: WebApp?.BackButton =`, WebApp?.BackButton);
  console.log(`🔍 [${timestamp}] DEBUG: WebApp?.close =`, WebApp?.close);
  console.log(`🔍 [${timestamp}] DEBUG: window.location.href =`, window.location.href);
  console.log(`🔍 [${timestamp}] DEBUG: window.navigator.userAgent =`, window.navigator.userAgent);
  
  if (WebApp?.BackButton) {
    console.log(`🔙 [${timestamp}] Показуємо BackButton та налаштовуємо закриття`);
    
    try {
      // Показуємо BackButton
      WebApp.BackButton.show();
      console.log(`✅ [${timestamp}] BackButton показано успішно`);
      
      // Налаштовуємо обробник кліку
      WebApp.BackButton.onClick(() => {
        const clickTimestamp = new Date().toISOString();
        console.log(`🔒 [${clickTimestamp}] Користувач натиснув BackButton - закриваємо WebApp`);
        console.log(`🔒 [${clickTimestamp}] DEBUG: WebApp?.close =`, WebApp?.close);
        
        if (WebApp?.close) {
          console.log(`🔒 [${clickTimestamp}] Викликаємо WebApp.close()`);
          try {
            WebApp.close();
            console.log(`✅ [${clickTimestamp}] WebApp.close() викликано успішно`);
          } catch (closeError) {
            console.error(`❌ [${clickTimestamp}] Помилка при виклику WebApp.close():`, closeError);
          }
        } else {
          console.warn(`⚠️ [${clickTimestamp}] WebApp.close() недоступний`);
        }
      });
      
      console.log(`✅ [${timestamp}] BackButton налаштовано для закриття WebApp`);
    } catch (backButtonError) {
      console.error(`❌ [${timestamp}] Помилка при роботі з BackButton:`, backButtonError);
    }
  } else {
    console.warn(`⚠️ [${timestamp}] BackButton недоступний`);
    console.warn(`⚠️ [${timestamp}] Можливо, ви не в Telegram WebApp контексті`);
    console.warn(`⚠️ [${timestamp}] WebApp =`, WebApp);
    console.warn(`⚠️ [${timestamp}] window.Telegram =`, window.Telegram);
    
    // Fallback для звичайного браузера
    if (typeof window !== 'undefined') {
      console.log(`🧪 [${timestamp}] FALLBACK: Симулюємо закриття WebApp для тестування`);
      alert('✅ Тестове завдання готове! (В Telegram WebApp тут закриється)');
    }
  }
};

/**
 * Закриття Telegram WebApp (старий метод - залишаємо для сумісності)
 */
export const closeTelegramWebApp = (): void => {
  console.log('🔍 DEBUG: Перевіряємо доступність WebApp.close()');
  console.log('🔍 DEBUG: WebApp =', WebApp);
  console.log('🔍 DEBUG: WebApp?.close =', WebApp?.close);
  
  if (WebApp?.close) {
    console.log('🔒 Закриваємо Telegram WebApp');
    try {
      WebApp.close();
      console.log('✅ WebApp.close() викликано успішно');
    } catch (error) {
      console.error('❌ Помилка при виклику WebApp.close():', error);
    }
  } else {
    console.warn('⚠️ Функція закриття WebApp недоступна');
    console.warn('⚠️ Можливо, ви не в Telegram WebApp контексті');
    console.warn('⚠️ В звичайному браузері WebApp.close() не працює');
    
    // Fallback для тестування в звичайному браузері
    if (typeof window !== 'undefined') {
      console.log('🧪 FALLBACK: Симулюємо закриття WebApp для тестування');
      // Можна додати візуальний індикатор закриття
      alert('✅ Тестове завдання готове! (В Telegram WebApp тут закриється)');
    }
  }
};