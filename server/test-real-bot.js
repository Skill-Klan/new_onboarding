#!/usr/bin/env node

/**
 * Тест реального бота з коротким часом роботи
 */

require('dotenv').config({ path: './.env' });

const FlowBot = require('./bot/FlowBot');

console.log('🧪 Тест реального бота...');

async function testRealBot() {
  try {
    console.log('🔍 Створюємо FlowBot...');
    const flowBot = new FlowBot();
    
    console.log('🔍 Запускаємо бота...');
    await flowBot.start();
    
    console.log('✅ Бот запущено!');
    console.log('');
    console.log('📱 ІНСТРУКЦІЇ ДЛЯ ТЕСТУВАННЯ:');
    console.log('1. Відкрийте Telegram');
    console.log('2. Знайдіть бота @Skill_Klan_bot');
    console.log('3. Відправте /start');
    console.log('4. Натисніть "1️⃣ QA — хочу тестувати!"');
    console.log('5. Перевірте чи прийшов опис QA з кнопкою "Так! Хочу спробувати 🚀"');
    console.log('6. Натисніть "2️⃣ Business Analyst — хочу аналізувати!"');
    console.log('7. Перевірте чи прийшов опис BA з кнопкою "Так! Хочу спробувати 🚀"');
    console.log('');
    console.log('⏰ Бот працюватиме 20 секунд...');
    
    // Зупиняємо через 20 секунд
    setTimeout(() => {
      console.log('🛑 Зупиняємо бота...');
      flowBot.stop('Тест завершено');
      process.exit(0);
    }, 20000);
    
  } catch (error) {
    console.error('❌ Помилка:', error);
    process.exit(1);
  }
}

testRealBot();

