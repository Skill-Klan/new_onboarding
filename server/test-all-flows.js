#!/usr/bin/env node

/**
 * Детальний тестовий файл для тестування всіх флоу FlowBot
 */

require('dotenv').config({ path: './.env' });

const FlowBot = require('./bot/FlowBot');

console.log('🧪 Детальне тестування всіх флоу FlowBot...');

async function testAllFlows() {
  try {
    console.log('🔍 Перевіряємо наявність токена...');
    if (!process.env.TELEGRAM_BOT_TOKEN) {
      throw new Error('TELEGRAM_BOT_TOKEN не встановлено в .env файлі');
    }
    console.log('✅ Токен знайдено');

    console.log('🔍 Створюємо FlowBot...');
    const flowBot = new FlowBot();
    
    console.log('📊 Інформація про FlowBot:');
    console.log(JSON.stringify(flowBot.getInfo(), null, 2));
    
    console.log('🔍 Тестуємо запуск бота...');
    await flowBot.start();
    
    console.log('✅ FlowBot запущено успішно!');
    console.log('🎉 Нова архітектура працює локально!');
    console.log('🤖 Бот готовий до тестування в Telegram');
    console.log('');
    console.log('📋 Тестування флоу:');
    console.log('1. /start - OnboardingFlow');
    console.log('2. Вибір професії - OnboardingFlow');
    console.log('3. "Так хочу спробувати" - OnboardingFlow');
    console.log('4. Надання контакту - ContactFlow');
    console.log('5. Отримання завдання - TaskFlow');
    console.log('6. /help - HelpFlow');
    console.log('7. FAQ кнопка - HelpFlow');
    console.log('');
    console.log('⏰ Бот працюватиме 30 секунд для тестування...');
    
    // Зупиняємо бота через 30 секунд для тестування
    setTimeout(() => {
      console.log('🛑 Зупиняємо бота для завершення тесту...');
      flowBot.stop('Тест завершено');
      process.exit(0);
    }, 30000);
    
  } catch (error) {
    console.error('❌ Помилка тестування FlowBot:', error);
    process.exit(1);
  }
}

testAllFlows();
