#!/usr/bin/env node

/**
 * Тест флоу кнопок напрямків навчання
 */

require('dotenv').config({ path: './.env' });

const FlowBot = require('./bot/FlowBot');
const { Profession } = require('./bot/types');

console.log('🔍 Тест флоу кнопок напрямків навчання...');

async function testButtonsFlow() {
  try {
    console.log('🔍 Створюємо FlowBot...');
    const flowBot = new FlowBot();
    
    console.log('🔍 Запускаємо бота...');
    await flowBot.start();
    
    console.log('✅ Бот запущено!');
    console.log('');
    console.log('📱 ТЕСТ КНОПОК:');
    console.log('1. Відправте /start боту');
    console.log('2. Натисніть "1️⃣ QA — хочу тестувати!"');
    console.log('3. Перевірте чи прийшов опис QA');
    console.log('4. Натисніть "Так! Хочу спробувати 🚀"');
    console.log('5. Перевірте чи прийшла кнопка контакту');
    console.log('');
    console.log('🔍 ДЕТАЛЬНІ ЛОГИ:');
    console.log('- Перевіряйте чи callback_data правильно передається');
    console.log('- Перевіряйте чи extractProfession працює');
    console.log('- Перевіряйте чи оновлюється стан користувача');
    console.log('');
    console.log('⏰ 20 секунд...');
    
    setTimeout(() => {
      console.log('🛑 Зупиняємо тест...');
      flowBot.stop('Тест завершено');
      process.exit(0);
    }, 20000);
    
  } catch (error) {
    console.error('❌ Помилка тесту:', error);
    console.error('Stack:', error.stack);
    process.exit(1);
  }
}

testButtonsFlow();

