#!/usr/bin/env node

/**
 * Скрипт для тестування Webhook Management API
 * Використання: node scripts/test-webhook-api.js
 */

const axios = require('axios');

const BASE_URL = 'http://localhost:3000/api/webhook';

// Кольори для консолі
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m'
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

async function testAPI() {
  log('\n🧪 Тестування Webhook Management API', 'bright');
  log('=====================================', 'cyan');

  try {
    // 1. Отримання початкового статусу
    log('\n1. Отримання початкового статусу webhook...', 'blue');
    const statusResponse = await axios.get(`${BASE_URL}/status`);
    log('✅ Статус отримано:', 'green');
    console.log(JSON.stringify(statusResponse.data, null, 2));

    // 2. Вимкнення webhook
    log('\n2. Вимкнення webhook...', 'blue');
    const disableResponse = await axios.post(`${BASE_URL}/toggle`, { enabled: false });
    log('✅ Webhook вимкнено:', 'green');
    console.log(JSON.stringify(disableResponse.data, null, 2));

    // 3. Перевірка статусу після вимкнення
    log('\n3. Перевірка статусу після вимкнення...', 'blue');
    const statusAfterDisable = await axios.get(`${BASE_URL}/status`);
    log('✅ Статус після вимкнення:', 'green');
    console.log(JSON.stringify(statusAfterDisable.data, null, 2));

    // 4. Вимкнення конкретного типу повідомлень
    log('\n4. Вимкнення повідомлень про початок взаємодії...', 'blue');
    const disableUserStarted = await axios.post(`${BASE_URL}/notification`, {
      type: 'userStarted',
      enabled: false
    });
    log('✅ Повідомлення userStarted вимкнено:', 'green');
    console.log(JSON.stringify(disableUserStarted.data, null, 2));

    // 5. Вимкнення повідомлень про дедлайн
    log('\n5. Вимкнення повідомлень про дедлайн...', 'blue');
    const disableDeadline = await axios.post(`${BASE_URL}/notification`, {
      type: 'deadlineWarning',
      enabled: false
    });
    log('✅ Повідомлення deadlineWarning вимкнено:', 'green');
    console.log(JSON.stringify(disableDeadline.data, null, 2));

    // 6. Оновлення конфігурації
    log('\n6. Оновлення конфігурації webhook...', 'blue');
    const updateConfig = await axios.post(`${BASE_URL}/config`, {
      config: {
        enabled: true,
        notifications: {
          userStarted: false,
          userReady: true,
          contactProvided: true,
          taskSent: true,
          taskCompleted: true,
          deadlineWarning: false,
          deadlineToday: true
        },
        logging: {
          enabled: true,
          logLevel: 'debug'
        }
      }
    });
    log('✅ Конфігурація оновлена:', 'green');
    console.log(JSON.stringify(updateConfig.data, null, 2));

    // 7. Фінальна перевірка статусу
    log('\n7. Фінальна перевірка статусу...', 'blue');
    const finalStatus = await axios.get(`${BASE_URL}/status`);
    log('✅ Фінальний статус:', 'green');
    console.log(JSON.stringify(finalStatus.data, null, 2));

    log('\n🎉 Всі тести пройшли успішно!', 'green');

  } catch (error) {
    log('\n❌ Помилка під час тестування:', 'red');
    if (error.response) {
      log(`Статус: ${error.response.status}`, 'red');
      log(`Дані: ${JSON.stringify(error.response.data, null, 2)}`, 'red');
    } else {
      log(`Помилка: ${error.message}`, 'red');
    }
    process.exit(1);
  }
}

// Запуск тестів
if (require.main === module) {
  testAPI();
}

module.exports = { testAPI };
