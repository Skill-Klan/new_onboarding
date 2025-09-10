/**
 * BotConfig - Централізована конфігурація бота
 * 
 * Містить всі тексти повідомлень, кнопки та налаштування.
 * Забезпечує DRY принцип та легку зміну UI.
 */

const { Markup } = require('telegraf');

class BotConfig {
  /**
   * Привітальне повідомлення
   */
  static getWelcomeMessage() {
    return `👋 Привіт! Я бот SkillKlan!

🎯 Допоможу тобі обрати напрямок навчання та отримати тестове завдання.

📚 Обери напрямок, який тебе цікавить:`;
  }

  /**
   * Клавіатура вибору професії
   */
  static getProfessionKeyboard() {
    return Markup.inlineKeyboard([
      [
        Markup.button.callback('1️⃣ QA — хочу тестувати!', 'profession_QA'),
        Markup.button.callback('2️⃣ Business Analyst — хочу аналізувати!', 'profession_BA')
      ]
    ]);
  }

  /**
   * Клавіатура "Готовий спробувати"
   */
  static getReadyToTryKeyboard() {
    return Markup.inlineKeyboard([
      [Markup.button.callback('Так! Хочу спробувати 🚀', 'ready_to_try')]
    ]);
  }

  /**
   * Клавіатура "Поділитись контактом"
   */
  static getContactKeyboard() {
    return Markup.keyboard([
      [Markup.button.contactRequest('📱 Поділитись контактом')]
    ]).resize();
  }

  /**
   * Головна клавіатура
   */
  static getMainKeyboard() {
    return Markup.inlineKeyboard([
      [Markup.button.callback('🔄 Почати спочатку', 'restart')]
    ]);
  }

  /**
   * Повідомлення запиту контакту
   */
  static getContactRequestMessage() {
    return `📱 Для отримання тестового завдання потрібно поділитись контактом.

Це допоможе нам:
• Надіслати тобі завдання
• Зв'язатися з тобою для зворотного зв'язку
• Відстежити твій прогрес

Натисни кнопку нижче:`;
  }

  /**
   * Повідомлення про успішне збереження контакту
   */
  static getContactSavedMessage() {
    return `✅ Контакт збережено!

Тепер надсилаю тобі тестове завдання...`;
  }

  /**
   * Повідомлення про відправку завдання
   */
  static getTaskSentMessage(profession) {
    const messages = {
      QA: `📋 Тестове завдання QA надіслано!

🎯 Твоє завдання:
• Протестувати функціональність додатку
• Знайти та описати баги
• Написати тест-кейси

⏰ Термін виконання: 9 робочих днів
📤 Надішли результат у відповідь на це повідомлення`,
      
      BA: `📋 Тестове завдання Business Analyst надіслано!

🎯 Твоє завдання:
• Проаналізувати бізнес-процеси
• Скласти технічне завдання
• Створити діаграми процесів

⏰ Термін виконання: 9 робочих днів
📤 Надішли результат у відповідь на це повідомлення`
    };
    
    return messages[profession] || 'Тестове завдання надіслано!';
  }

  /**
   * Повідомлення про завершення
   */
  static getCompletionMessage() {
    return `🎉 Вітаємо! Ти завершив онбординг!

📞 Наш менеджер зв'яжеться з тобою найближчим часом для обговорення наступних кроків.

💡 Якщо маєш питання, звертайся до нас!`;
  }

  /**
   * Повідомлення про невідому команду
   */
  static getUnknownMessage() {
    return `🤔 Не розумію цю команду.

Спробуй:
• /start - почати спочатку
• /help - отримати допомогу

Або використовуй кнопки нижче:`;
  }

  /**
   * Повідомлення про помилку
   */
  static getErrorMessage() {
    return `❌ Щось пішло не так.

Спробуй ще раз або звернись до підтримки.

🔄 Для початку натисни /start`;
  }

  /**
   * Повідомлення про допомогу
   */
  static getHelpMessage() {
    return `🆘 Допомога

📋 Доступні команди:
• /start - почати онбординг
• /help - показати це повідомлення
• /restart - почати спочатку

❓ Якщо маєш питання, звертайся до підтримки.`;
  }

  /**
   * Повідомлення про рестарт
   */
  static getRestartMessage() {
    return `🔄 Починаємо спочатку!

Обери напрямок навчання:`;
  }

  /**
   * Отримання налаштувань webhook
   */
  static getWebhookConfig() {
    return {
      enabled: process.env.WEBHOOK_ENABLED === 'true',
      url: process.env.WEBHOOK_URL,
      secret: process.env.WEBHOOK_SECRET
    };
  }

  /**
   * Отримання налаштувань бази даних
   */
  static getDatabaseConfig() {
    return {
      host: process.env.DB_HOST || 'localhost',
      port: process.env.DB_PORT || 5432,
      name: process.env.DB_NAME || 'skillklan_db',
      user: process.env.DB_USER || 'skillklan_user',
      password: process.env.DB_PASSWORD
    };
  }

  /**
   * Отримання налаштувань бота
   */
  static getBotConfig() {
    return {
      token: process.env.TELEGRAM_BOT_TOKEN,
      webappUrl: process.env.WEBAPP_URL || 'https://skill-klan.github.io/new_onboarding/',
      environment: process.env.NODE_ENV || 'development'
    };
  }

  /**
   * Валідація конфігурації
   */
  static validate() {
    const errors = [];
    
    if (!process.env.TELEGRAM_BOT_TOKEN) {
      errors.push('TELEGRAM_BOT_TOKEN не встановлено');
    }
    
    if (!process.env.DB_HOST) {
      errors.push('DB_HOST не встановлено');
    }
    
    if (!process.env.DB_PASSWORD) {
      errors.push('DB_PASSWORD не встановлено');
    }
    
    return {
      isValid: errors.length === 0,
      errors: errors
    };
  }
}

module.exports = BotConfig;
