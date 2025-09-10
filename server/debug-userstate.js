#!/usr/bin/env node

/**
 * Діагностика проблеми з userState
 */

require('dotenv').config({ path: './.env' });

const FlowBot = require('./bot/FlowBot');

console.log('🔍 Діагностика проблеми з userState...');

async function debugUserState() {
  try {
    console.log('🔍 Створюємо FlowBot...');
    const flowBot = new FlowBot();
    
    console.log('🔍 Запускаємо бота...');
    await flowBot.start();
    
    console.log('✅ Бот запущено!');
    console.log('');
    console.log('📱 ДІАГНОСТИКА:');
    console.log('1. Відправте /start боту');
    console.log('2. Натисніть "1️⃣ QA — хочу тестувати!"');
    console.log('3. Дивіться детальні логи в консолі');
    console.log('');
    console.log('⏰ 15 секунд...');
    
    setTimeout(() => {
      console.log('🛑 Зупиняємо діагностику...');
      flowBot.stop('Діагностика завершена');
      process.exit(0);
    }, 15000);
    
  } catch (error) {
    console.error('❌ Помилка діагностики:', error);
    console.error('Stack:', error.stack);
    process.exit(1);
  }
}

debugUserState();

