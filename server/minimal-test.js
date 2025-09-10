#!/usr/bin/env node

/**
 * Мінімальний тест для діагностики проблеми
 */

require('dotenv').config({ path: './.env' });

const FlowBot = require('./bot/FlowBot');

console.log('🔍 Мінімальний тест...');

async function minimalTest() {
  try {
    console.log('🔍 Створюємо FlowBot...');
    const flowBot = new FlowBot();
    
    console.log('🔍 Запускаємо бота...');
    await flowBot.start();
    
    console.log('✅ Бот запущено!');
    console.log('');
    console.log('📱 ТЕСТ:');
    console.log('1. Відправте /start');
    console.log('2. Натисніть "1️⃣ QA — хочу тестувати!"');
    console.log('3. Дивіться логи в консолі');
    console.log('');
    console.log('⏰ 10 секунд...');
    
    setTimeout(() => {
      console.log('🛑 Зупиняємо...');
      flowBot.stop('Тест завершено');
      process.exit(0);
    }, 10000);
    
  } catch (error) {
    console.error('❌ Помилка:', error);
    console.error('Stack:', error.stack);
    process.exit(1);
  }
}

minimalTest();

