#!/usr/bin/env node

/**
 * Тестовий файл для локального тестування нової архітектури FlowBot
 */

require('dotenv').config({ path: './.env' });

const FlowBot = require('./bot/FlowBot');

console.log('🧪 Локальне тестування нової архітектури FlowBot...');

async function testNewArchitecture() {
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
    
    // Зупиняємо бота через 5 секунд для тестування
    setTimeout(() => {
      console.log('🛑 Зупиняємо бота для завершення тесту...');
      flowBot.stop('Тест завершено');
      process.exit(0);
    }, 5000);
    
  } catch (error) {
    console.error('❌ Помилка тестування FlowBot:', error);
    process.exit(1);
  }
}

testNewArchitecture();
