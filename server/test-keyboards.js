#!/usr/bin/env node

/**
 * Тестовий файл для перевірки клавіатур
 */

require('dotenv').config({ path: './.env' });

const KeyboardTemplates = require('./bot/templates/keyboards');
const MessageTemplates = require('./bot/templates/messages');

console.log('🧪 Тестування клавіатур...');

// Тестуємо створення клавіатур
console.log('\n1. Тестування getProfessionKeyboard():');
try {
  const professionKeyboard = KeyboardTemplates.getProfessionKeyboard();
  console.log('✅ Клавіатура створена успішно');
  console.log('📋 Структура:', JSON.stringify(professionKeyboard, null, 2));
} catch (error) {
  console.error('❌ Помилка створення клавіатури:', error);
}

console.log('\n2. Тестування getReadyToTryKeyboard():');
try {
  const readyKeyboard = KeyboardTemplates.getReadyToTryKeyboard();
  console.log('✅ Клавіатура створена успішно');
  console.log('📋 Структура:', JSON.stringify(readyKeyboard, null, 2));
} catch (error) {
  console.error('❌ Помилка створення клавіатури:', error);
}

console.log('\n3. Тестування повідомлень:');
try {
  const welcomeMessage = MessageTemplates.getWelcomeMessage();
  console.log('✅ Вітальне повідомлення:');
  console.log(welcomeMessage);
  
  const qaDescription = MessageTemplates.getQADescription();
  console.log('\n✅ Опис QA:');
  console.log(qaDescription);
} catch (error) {
  console.error('❌ Помилка створення повідомлень:', error);
}

console.log('\n4. Тестування WEBAPP_URL:');
console.log('WEBAPP_URL =', process.env.WEBAPP_URL);

console.log('\n✅ Тестування завершено');
