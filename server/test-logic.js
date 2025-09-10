#!/usr/bin/env node

/**
 * Тест логіки без запуску бота
 */

const { Profession } = require('./bot/types');
const MessageTemplates = require('./bot/templates/messages');
const KeyboardTemplates = require('./bot/templates/keyboards');

console.log('🧪 Тестування логіки вибору професії...');

// Симулюємо логіку handleProfessionSelection
function simulateProfessionSelection(callbackData) {
  console.log(`\n🔍 Симуляція вибору професії: "${callbackData}"`);
  
  // 1. Витягуємо професію
  const profession = extractProfession(callbackData);
  console.log('✅ Витягнута професія:', profession);
  
  if (!profession) {
    console.log('❌ Професія не знайдена');
    return;
  }
  
  // 2. Отримуємо опис професії
  const description = getProfessionDescription(profession);
  console.log('✅ Опис професії:');
  console.log(description);
  
  // 3. Отримуємо клавіатуру
  const keyboard = KeyboardTemplates.getReadyToTryKeyboard();
  console.log('✅ Клавіатура:');
  console.log(JSON.stringify(keyboard, null, 2));
  
  console.log('✅ Симуляція завершена успішно!');
}

function extractProfession(callbackData) {
  if (callbackData === 'profession_QA') {
    return Profession.QA;
  } else if (callbackData === 'profession_BA') {
    return Profession.BA;
  }
  return null;
}

function getProfessionDescription(profession) {
  switch (profession) {
    case Profession.QA:
      return MessageTemplates.getQADescription();
    case Profession.BA:
      return MessageTemplates.getBADescription();
    default:
      return MessageTemplates.getErrorMessage();
  }
}

// Тестуємо різні сценарії
const testCases = [
  'profession_QA',
  'profession_BA',
  'profession_INVALID',
  'ready_to_try'
];

testCases.forEach((testCase, index) => {
  console.log(`\n--- Тест ${index + 1} ---`);
  simulateProfessionSelection(testCase);
});

console.log('\n🎉 Всі тести завершено!');

