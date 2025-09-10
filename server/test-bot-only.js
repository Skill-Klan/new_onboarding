#!/usr/bin/env node

/**
 * Тест тільки бота без БД
 */

// Встановлюємо токен через змінну середовища
process.env.TELEGRAM_BOT_TOKEN = '7239298348:AAG3XbhNRGRzRR7IsQorlDOnyIngCDWKJRU';
process.env.NODE_ENV = 'development';
process.env.LOG_LEVEL = 'debug';

const { Telegraf } = require('telegraf');

console.log('🔍 Тест тільки бота без БД...');
console.log('🤖 Токен:', process.env.TELEGRAM_BOT_TOKEN.substring(0, 10) + '...');

async function testBotOnly() {
  try {
    console.log('🔍 Створюємо Telegraf бота...');
    const bot = new Telegraf(process.env.TELEGRAM_BOT_TOKEN);
    
    // Простий обробник
    bot.start((ctx) => {
      console.log('📨 Отримано /start від:', ctx.from.username);
      ctx.reply('Привіт! Бот працює! 🤖');
    });
    
    bot.on('text', (ctx) => {
      console.log('📨 Отримано повідомлення:', ctx.message.text);
      ctx.reply('Повідомлення отримано!');
    });
    
    console.log('🔍 Запускаємо бота...');
    await bot.launch();
    
    console.log('✅ Бот запущено!');
    console.log('');
    console.log('📱 ТЕСТ:');
    console.log('1. Відправте /start боту');
    console.log('2. Напишіть будь-яке повідомлення');
    console.log('3. Перевірте чи бот відповідає');
    console.log('');
    console.log('⏰ 30 секунд...');
    
    setTimeout(() => {
      console.log('🛑 Зупиняємо тест...');
      bot.stop('SIGINT');
      process.exit(0);
    }, 30000);
    
  } catch (error) {
    console.error('❌ Помилка тесту:', error);
    console.error('Stack:', error.stack);
    process.exit(1);
  }
}

testBotOnly();
