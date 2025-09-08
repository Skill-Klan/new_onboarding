#!/usr/bin/env node

/**
 * Демонстраційний скрипт для показу роботи webhook тоглу
 * Використання: node scripts/demo-webhook-toggle.js
 */

const axios = require('axios');

const BASE_URL = 'http://localhost:3000/api/webhook';

async function demo() {
  console.log('🎭 Демонстрація Webhook Toggle функціональності');
  console.log('===============================================\n');

  try {
    // 1. Показуємо початковий статус
    console.log('1️⃣ Початковий статус webhook:');
    const initialStatus = await axios.get(`${BASE_URL}/status`);
    console.log(`   Webhook увімкнено: ${initialStatus.data.status.enabled ? '✅' : '❌'}`);
    console.log(`   URL встановлено: ${initialStatus.data.status.webhookUrl === 'встановлено' ? '✅' : '❌'}`);
    console.log('');

    // 2. Вимкнення webhook
    console.log('2️⃣ Вимкнення webhook...');
    await axios.post(`${BASE_URL}/toggle`, { enabled: false });
    console.log('   ✅ Webhook вимкнено');
    console.log('');

    // 3. Показуємо статус після вимкнення
    console.log('3️⃣ Статус після вимкнення:');
    const disabledStatus = await axios.get(`${BASE_URL}/status`);
    console.log(`   Webhook увімкнено: ${disabledStatus.data.status.enabled ? '✅' : '❌'}`);
    console.log('');

    // 4. Вимкнення конкретних типів повідомлень
    console.log('4️⃣ Вимкнення повідомлень про початок взаємодії...');
    await axios.post(`${BASE_URL}/notification`, {
      type: 'userStarted',
      enabled: false
    });
    console.log('   ✅ Повідомлення userStarted вимкнено');
    console.log('');

    // 5. Вимкнення повідомлень про дедлайн
    console.log('5️⃣ Вимкнення повідомлень про дедлайн...');
    await axios.post(`${BASE_URL}/notification`, {
      type: 'deadlineWarning',
      enabled: false
    });
    console.log('   ✅ Повідомлення deadlineWarning вимкнено');
    console.log('');

    // 6. Показуємо фінальний статус
    console.log('6️⃣ Фінальний статус:');
    const finalStatus = await axios.get(`${BASE_URL}/status`);
    console.log(`   Webhook увімкнено: ${finalStatus.data.status.enabled ? '✅' : '❌'}`);
    console.log('   Налаштування повідомлень:');
    Object.entries(finalStatus.data.status.notifications).forEach(([key, value]) => {
      console.log(`     ${key}: ${value ? '✅' : '❌'}`);
    });
    console.log('');

    // 7. Увімкнення webhook назад
    console.log('7️⃣ Увімкнення webhook назад...');
    await axios.post(`${BASE_URL}/toggle`, { enabled: true });
    console.log('   ✅ Webhook увімкнено');
    console.log('');

    console.log('🎉 Демонстрація завершена!');
    console.log('\n💡 Тепер webhook повідомлення будуть відправлятися знову.');
    console.log('💡 Ви можете використовувати API для управління webhook в реальному часі.');

  } catch (error) {
    console.error('❌ Помилка під час демонстрації:', error.message);
    if (error.response) {
      console.error('   Статус:', error.response.status);
      console.error('   Дані:', error.response.data);
    }
    process.exit(1);
  }
}

// Запуск демонстрації
if (require.main === module) {
  demo();
}

module.exports = { demo };
