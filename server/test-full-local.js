#!/usr/bin/env node

/**
 * Повний тест з БД
 */

// Встановлюємо змінні середовища
process.env.TELEGRAM_BOT_TOKEN = '7239298348:AAG3XbhNRGRzRR7IsQorlDOnyIngCDWKJRU';
process.env.NODE_ENV = 'development';
process.env.LOG_LEVEL = 'debug';
process.env.DB_USER = 'skillklan_user';
process.env.DB_HOST = 'localhost';
process.env.DB_NAME = 'skillklan_db';
process.env.DB_PASSWORD = 'skillklan_password';
process.env.DB_PORT = '5432';
process.env.DB_SSL = 'false';
process.env.WEBAPP_URL = 'https://skill-klan.github.io/new_onboarding/';

const FlowBot = require('./bot/FlowBot');

console.log('🔍 Повний тест з БД...');
console.log('🤖 Токен:', process.env.TELEGRAM_BOT_TOKEN.substring(0, 10) + '...');
console.log('🗄️ БД:', process.env.DB_NAME + '@' + process.env.DB_HOST);

async function testFullLocal() {
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
    console.log('5. Натисніть "Надсилаю завдання"');
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

testFullLocal();
