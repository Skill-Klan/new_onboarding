#!/usr/bin/env node

/**
 * Тестовий файл для нової архітектури FlowBot
 */

require('dotenv').config({ path: './.env' });

const FlowBot = require('./bot/FlowBot');

console.log('🧪 Тестування нової архітектури FlowBot...');

async function testFlowBot() {
  try {
    console.log('🔍 Створюємо FlowBot...');
    const flowBot = new FlowBot();
    
    console.log('📊 Інформація про FlowBot:');
    console.log(JSON.stringify(flowBot.getInfo(), null, 2));
    
    console.log('✅ FlowBot створено успішно!');
    console.log('🎉 Нова архітектура працює!');
    
  } catch (error) {
    console.error('❌ Помилка тестування FlowBot:', error);
    process.exit(1);
  }
}

testFlowBot();
