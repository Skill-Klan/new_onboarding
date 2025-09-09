// Тестовий скрипт для перевірки роботи бота
const { Telegraf } = require('telegraf');

// Завантажуємо змінні середовища
require('dotenv').config();

const bot = new Telegraf(process.env.TELEGRAM_BOT_TOKEN);

// Тестовий користувач (замініть на свій Telegram ID)
const TEST_USER_ID = 316149980; // Замініть на ваш Telegram ID

async function testBot() {
  try {
    console.log('🤖 Тестуємо бота...');
    
    // Перевіряємо токен
    const me = await bot.telegram.getMe();
    console.log('✅ Бот підключений:', me.first_name);
    
    // Відправляємо тестове повідомлення
    await bot.telegram.sendMessage(TEST_USER_ID, '🧪 Тестове повідомлення від бота!');
    console.log('✅ Тестове повідомлення відправлено');
    
    // Тестуємо команду /start
    await bot.telegram.sendMessage(TEST_USER_ID, '/start');
    console.log('✅ Команда /start відправлена');
    
    console.log('✅ Тест завершено успішно!');
    
  } catch (error) {
    console.error('❌ Помилка тестування:', error);
  }
}

// Запускаємо тест
testBot();
