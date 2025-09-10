#!/usr/bin/env node

/**
 * Тест для перевірки виправлення проблеми з ctx.userState
 */

require('dotenv').config({ path: './.env' });

const FlowBot = require('./bot/FlowBot');

console.log('🔍 Тест виправлення проблеми з ctx.userState...');

async function testFix() {
  try {
    console.log('🔍 Створюємо FlowBot...');
    const flowBot = new FlowBot();
    
    console.log('🔍 Запускаємо бота...');
    await flowBot.start();
    
    console.log('✅ Бот запущено!');
    console.log('');
    console.log('📱 ТЕСТ:');
    console.log('1. Відправте /start боту');
    console.log('2. Перевірте чи з\'являється клавіатура з професіями');
    console.log('3. Спробуйте натиснути на кнопку QA або BA');
    console.log('4. Перевірте чи з\'являється кнопка "Готовий спробувати"');
    console.log('');
    console.log('⏰ 30 секунд...');
    
    setTimeout(() => {
      console.log('🛑 Зупиняємо тест...');
      flowBot.stop('Тест завершено');
      process.exit(0);
    }, 30000);
    
  } catch (error) {
    console.error('❌ Помилка тесту:', error);
    console.error('Stack:', error.stack);
    process.exit(1);
  }
}

testFix();

