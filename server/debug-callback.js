#!/usr/bin/env node

/**
 * Детальний дебаг callback queries
 */

require('dotenv').config({ path: './.env' });

const FlowBot = require('./bot/FlowBot');

console.log('🔍 Детальний дебаг callback queries...');

async function debugCallback() {
  try {
    console.log('🔍 Створюємо FlowBot...');
    const flowBot = new FlowBot();
    
    console.log('🔍 Запускаємо бота...');
    await flowBot.start();
    
    console.log('✅ Бот запущено!');
    console.log('');
    console.log('🔍 ДЕБАГ ІНСТРУКЦІЇ:');
    console.log('1. Відправте /start боту');
    console.log('2. Натисніть "1️⃣ QA — хочу тестувати!"');
    console.log('3. Дивіться логи в консолі для діагностики');
    console.log('');
    console.log('⏰ Бот працюватиме 15 секунд...');
    
    // Зупиняємо через 15 секунд
    setTimeout(() => {
      console.log('🛑 Зупиняємо бота...');
      flowBot.stop('Дебаг завершено');
      process.exit(0);
    }, 15000);
    
  } catch (error) {
    console.error('❌ Помилка дебагу:', error);
    console.error('Stack trace:', error.stack);
    process.exit(1);
  }
}

debugCallback();

