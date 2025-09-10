#!/usr/bin/env node

/**
 * Тест для перевірки доставки завдання
 */

require('dotenv').config({ path: './.env' });

const FlowBot = require('./bot/FlowBot');

console.log('🔍 Тест доставки завдання...');

async function testTaskDelivery() {
  try {
    console.log('🔍 Створюємо FlowBot...');
    const flowBot = new FlowBot();
    
    console.log('🔍 Запускаємо бота...');
    await flowBot.start();
    
    console.log('✅ Бот запущено!');
    console.log('');
    console.log('📱 ТЕСТ:');
    console.log('1. Відправте /start боту');
    console.log('2. Виберіть професію (QA або BA)');
    console.log('3. Натисніть "Так, хочу спробувати"');
    console.log('4. Перевірте чи надсилається файл завдання');
    console.log('');
    console.log('⏰ 60 секунд...');
    
    setTimeout(() => {
      console.log('🛑 Зупиняємо тест...');
      flowBot.stop('Тест завершено');
      process.exit(0);
    }, 60000);
    
  } catch (error) {
    console.error('❌ Помилка тесту:', error);
    console.error('Stack:', error.stack);
    process.exit(1);
  }
}

testTaskDelivery();

