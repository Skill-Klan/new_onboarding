#!/usr/bin/env node

/**
 * Тест для перевірки описів професій
 */

const { Profession } = require('./bot/types');
const MessageTemplates = require('./bot/templates/messages');

console.log('🧪 Тестування описів професій...');

function getProfessionDescription(profession) {
  console.log('🔍 getProfessionDescription: profession =', profession);
  
  switch (profession) {
    case Profession.QA:
      console.log('✅ Вибрано QA');
      return MessageTemplates.getQADescription();
    case Profession.BA:
      console.log('✅ Вибрано BA');
      return MessageTemplates.getBADescription();
    default:
      console.log('❌ Невідома професія');
      return MessageTemplates.getErrorMessage();
  }
}

// Тестуємо різні варіанти
const testCases = [
  { input: 'QA', expected: 'QA' },
  { input: 'BA', expected: 'BA' },
  { input: 'INVALID', expected: 'ERROR' }
];

testCases.forEach((testCase, index) => {
  console.log(`\n${index + 1}. Тест: "${testCase.input}"`);
  const result = getProfessionDescription(testCase.input);
  console.log('📝 Результат:');
  console.log(result);
  console.log('---');
});

console.log('\n✅ Тестування завершено');
