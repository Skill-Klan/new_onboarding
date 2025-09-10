#!/usr/bin/env node

/**
 * Простий тест для репродукції помилки
 */

require('dotenv').config({ path: './.env' });

const FlowBot = require('./bot/FlowBot');

console.log('🔍 Тест для репродукції помилки...');

async function testError() {
  try {
    console.log('🔍 Створюємо FlowBot...');
    const flowBot = new FlowBot();
    
    console.log('🔍 Запускаємо бота...');
    await flowBot.start();
    
    console.log('✅ Бот запущено!');
    console.log('');
    console.log('📱 ТЕСТ:');
    console.log('1. Відправте /start боту');
    console.log('2. Дивіться логи в консолі');
    console.log('');
    console.log('⏰ 10 секунд...');
    
    setTimeout(() => {
      console.log('🛑 Зупиняємо тест...');
      flowBot.stop('Тест завершено');
      process.exit(0);
    }, 10000);
    
  } catch (error) {
    console.error('❌ Помилка тесту:', error);
    console.error('Stack:', error.stack);
    process.exit(1);
  }
}

testError();

