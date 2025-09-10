#!/usr/bin/env node

/**
 * Швидкий тест для перевірки основної функціональності
 */

require('dotenv').config({ path: './.env' });

const FlowBot = require('./bot/FlowBot');

console.log('🧪 Швидкий тест FlowBot...');

async function quickTest() {
  try {
    console.log('🔍 Створюємо FlowBot...');
    const flowBot = new FlowBot();
    
    console.log('🔍 Запускаємо бота...');
    await flowBot.start();
    
    console.log('✅ Бот запущено успішно!');
    console.log('');
    console.log('📱 Тепер протестуйте в Telegram:');
    console.log('1. Відправте /start');
    console.log('2. Натисніть "1️⃣ QA — хочу тестувати!"');
    console.log('3. Перевірте чи прийшов опис QA з кнопкою "Так! Хочу спробувати 🚀"');
    console.log('4. Натисніть "2️⃣ Business Analyst — хочу аналізувати!"');
    console.log('5. Перевірте чи прийшов опис BA з кнопкою "Так! Хочу спробувати 🚀"');
    console.log('');
    console.log('⏰ Бот працюватиме 30 секунд...');
    
    // Зупиняємо через 30 секунд
    setTimeout(() => {
      console.log('🛑 Зупиняємо бота...');
      flowBot.stop('Тест завершено');
      process.exit(0);
    }, 30000);
    
  } catch (error) {
    console.error('❌ Помилка:', error);
    process.exit(1);
  }
}

quickTest();

