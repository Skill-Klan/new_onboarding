#!/usr/bin/env node

/**
 * Тестовий файл для перевірки вибору професії
 */

require('dotenv').config({ path: './.env' });

const { Profession } = require('./bot/types');

console.log('🧪 Тестування вибору професії...');

// Тестуємо extractProfession логіку
function extractProfession(callbackData) {
  console.log('🔍 extractProfession: callbackData =', callbackData);
  
  if (callbackData === 'profession_QA') {
    console.log('✅ Знайдено QA');
    return Profession.QA;
  } else if (callbackData === 'profession_BA') {
    console.log('✅ Знайдено BA');
    return Profession.BA;
  }
  
  console.log('❌ Професія не знайдена');
  return null;
}

// Тестуємо різні варіанти
const testCases = [
  'profession_QA',
  'profession_BA',
  'profession_INVALID',
  'ready_to_try',
  null,
  undefined
];

console.log('📋 Тестування різних callback_data:');
testCases.forEach((testCase, index) => {
  console.log(`\n${index + 1}. Тест: "${testCase}"`);
  const result = extractProfession(testCase);
  console.log(`   Результат: ${result}`);
});

console.log('\n✅ Тестування завершено');
