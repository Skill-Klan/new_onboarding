#!/usr/bin/env node

/**
 * Детальний тест для перевірки флоу вибору професії
 */

require('dotenv').config({ path: './.env' });

const FlowBot = require('./bot/FlowBot');

console.log('🧪 Детальний тест флоу вибору професії...');

async function testProfessionFlow() {
  try {
    console.log('🔍 Створюємо FlowBot...');
    const flowBot = new FlowBot();
    
    console.log('🔍 Запускаємо бота...');
    await flowBot.start();
    
    console.log('✅ Бот запущено!');
    console.log('');
    console.log('📋 Інструкції для тестування:');
    console.log('1. Відправте /start боту');
    console.log('2. Натисніть на кнопку "1️⃣ QA — хочу тестувати!"');
    console.log('3. Перевірте чи прийшов опис QA з кнопкою "Так! Хочу спробувати 🚀"');
    console.log('4. Натисніть на кнопку "2️⃣ Business Analyst — хочу аналізувати!"');
    console.log('5. Перевірте чи прийшов опис BA з кнопкою "Так! Хочу спробувати 🚀"');
    console.log('');
    console.log('⏰ Бот працюватиме 60 секунд для тестування...');
    
    // Зупиняємо бота через 60 секунд
    setTimeout(() => {
      console.log('🛑 Зупиняємо бота...');
      flowBot.stop('Тест завершено');
      process.exit(0);
    }, 60000);
    
  } catch (error) {
    console.error('❌ Помилка тестування:', error);
    process.exit(1);
  }
}

testProfessionFlow();
