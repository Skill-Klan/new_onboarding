#!/bin/bash

# Скрипт для налаштування webhook замість polling режиму
# Використання: ./setup-webhook.sh [server_ip] [server_user] [webhook_url]

set -e

# Параметри
SERVER_IP=${1:-"192.168.88.121"}
SERVER_USER=${2:-"roman"}
PROJECT_PATH="/home/roman/new_onboarding"
WEBHOOK_URL=${3:-"https://$SERVER_IP:3001/webhook"}

echo "🔧 Налаштування webhook для Telegram бота..."
echo "📋 Параметри:"
echo "   - Сервер: $SERVER_USER@$SERVER_IP"
echo "   - Шлях: $PROJECT_PATH"
echo "   - Webhook URL: $WEBHOOK_URL"
echo ""

# Функція для виконання команд на сервері
run_on_server() {
    ssh $SERVER_USER@$SERVER_IP "$1"
}

echo "🔍 Перевірка підключення до сервера..."
if ! run_on_server "echo 'Підключення успішне'"; then
    echo "❌ Помилка підключення до сервера $SERVER_IP"
    exit 1
fi

echo "✅ Підключення до сервера успішне"

# Отримуємо BOT_TOKEN
echo "🔑 Отримання BOT_TOKEN..."
BOT_TOKEN=$(run_on_server "cd $PROJECT_PATH && grep TELEGRAM_BOT_TOKEN server/.env | cut -d= -f2")
if [ -z "$BOT_TOKEN" ]; then
    echo "❌ BOT_TOKEN не знайдено в server/.env"
    exit 1
fi
echo "✅ BOT_TOKEN отримано"

echo "🧹 Очищення поточного webhook..."
WEBHOOK_RESULT=$(run_on_server "curl -s -X POST 'https://api.telegram.org/bot$BOT_TOKEN/deleteWebhook'")
echo "Webhook результат: $WEBHOOK_RESULT"

echo "🔧 Встановлення нового webhook..."
WEBHOOK_SET_RESULT=$(run_on_server "curl -s -X POST 'https://api.telegram.org/bot$BOT_TOKEN/setWebhook' -H 'Content-Type: application/json' -d '{\"url\": \"$WEBHOOK_URL\"}'")
echo "Webhook встановлення результат: $WEBHOOK_SET_RESULT"

echo "🔍 Перевірка стану webhook..."
WEBHOOK_INFO=$(run_on_server "curl -s 'https://api.telegram.org/bot$BOT_TOKEN/getWebhookInfo'")
echo "Webhook інформація: $WEBHOOK_INFO"

echo "🔧 Оновлення конфігурації webhook (увімкнення webhook режиму)..."
# Створюємо оновлену конфігурацію з webhook режимом
run_on_server "cd $PROJECT_PATH && cat > server/config/webhook.config.js << 'EOF'
// Конфігурація веб-хуків
// Цей файл містить налаштування для Discord webhook інтеграції

module.exports = {
  // Тогл для увімкнення/вимкнення webhook повідомлень
  enabled: true,
  
  // URL Discord webhook
  webhookUrl: process.env.DISCORD_WEBHOOK_URL || 'https://discord.com/api/webhooks/1412903925694332998/XDyrZ3asQ80y_NAdv_3lErNylvFUTru2pjZyzpjAm38XLs102DQ-LnUEZXNiPtmUuPWm',
  
  // Таймаут для webhook запитів (в мілісекундах)
  timeout: 10000,
  
  // Кольори для різних типів повідомлень
  colors: {
    info: 0x3498db,      // Синій - інформаційні повідомлення
    success: 0x2ecc71,   // Зелений - успішні дії
    warning: 0xf39c12,   // Помаранчевий - попередження
    danger: 0xe74c3c,    // Червоний - критичні події
    primary: 0x9b59b6    // Фіолетовий - основні події
  },
  
  // Налаштування для різних типів повідомлень
  notifications: {
    userStarted: true,        // Початок взаємодії з ботом
    userReady: true,          // Готовність користувача спробувати
    contactProvided: true,    // Надання контактних даних
    taskSent: true,           // Відправка тестового завдання
    taskCompleted: true,      // Завершення завдання
    deadlineWarning: true,    // Попередження про дедлайн
    deadlineToday: true       // Останній день дедлайну
  },
  
  // Логування webhook дій
  logging: {
    enabled: true,
    logLevel: 'info' // 'debug', 'info', 'warn', 'error'
  }
};
EOF"

echo "🔧 Оновлення server.js для підтримки webhook..."
# Оновлюємо server.js для підтримки webhook
run_on_server "cd $PROJECT_PATH && cat > server/server.js << 'EOF'
const express = require('express');
const { Pool } = require('pg');
const cors = require('cors');
const helmet = require('helmet');
require('dotenv').config();

// Імпорт бота
const SkillKlanBot = require('./bot/bot');

const app = express();

// Middleware
app.use(helmet());
app.use(cors({
  origin: process.env.NODE_ENV === 'production' 
    ? ['https://your-domain.com'] 
    : ['http://localhost:5173', 'https://*.ngrok-free.app']
}));
app.use(express.json());

// Підключення до PostgreSQL
const pool = new Pool({
  user: process.env.DB_USER,
  host: process.env.DB_HOST,
  database: process.env.DB_NAME,
  password: process.env.DB_PASSWORD,
  port: process.env.DB_PORT,
});

// Тест підключення до БД
pool.query('SELECT NOW()', (err, res) => {
  if (err) {
    console.error('Database connection error:', err);
  } else {
    console.log('Database connected successfully');
  }
});

// Health check endpoint
app.get(\"/api/health\", (req, res) => {
  res.json({ status: \"ok\", timestamp: new Date().toISOString() });
});

// Webhook endpoint для Telegram
app.post('/webhook', (req, res) => {
  console.log('📨 Отримано webhook від Telegram:', req.body);
  
  if (botInstance) {
    botInstance.handleUpdate(req.body);
  }
  
  res.status(200).send('OK');
});

// API для збереження заявки на тестове завдання
app.post('/api/test-task-request', async (req, res) => {
  const client = await pool.connect();
  
  try {
    const { name, phone, email, profession, telegram_id, contact_source = 'manual' } = req.body;
    
    // Валідація даних
    if (!name || !phone || !profession) {
      return res.status(400).json({ 
        error: 'Необхідно заповнити ім\\'я, телефон та професію' 
      });
    }
    
    if (!['qa', 'ba'].includes(profession)) {
      return res.status(400).json({ 
        error: 'Невірна професія' 
      });
    }

    // Валідація джерела контактів
    if (!['telegram', 'manual'].includes(contact_source)) {
      return res.status(400).json({ 
        error: 'Невірне джерело контактів' 
      });
    }

    // Валідація номера телефону для українських номерів
    const cleanPhone = phone.replace(/[^\\d]/g, '');
    if (cleanPhone.length !== 10 || !cleanPhone.startsWith('0')) {
      return res.status(400).json({ 
        error: 'Невірний формат номера телефону. Очікується український номер (10 цифр, починається з 0)' 
      });
    }

    // Валідація імені
    if (name.trim().length < 2 || name.trim().length > 50) {
      return res.status(400).json({ 
        error: 'Ім\\'я має бути від 2 до 50 символів' 
      });
    }

    // Логування джерела контактів
    console.log(\`📝 Збереження контактів з джерела: \${contact_source} для telegram_id: \${telegram_id}\`);
    
    await client.query('BEGIN');
    
    // Перевіряємо, чи існує користувач з таким telegram_id
    let userResult = await client.query(
      'SELECT id FROM users WHERE telegram_id = \$1',
      [telegram_id]
    );
    
    let userId;
    
    if (userResult.rows.length === 0) {
      // Створюємо нового користувача
      console.log(\`👤 Створюємо нового користувача з telegram_id: \${telegram_id}\`);
      const newUserResult = await client.query(
        'INSERT INTO users (telegram_id, name, phone, email) VALUES (\$1, \$2, \$3, \$4) RETURNING id',
        [telegram_id, name.trim(), phone, email || '']
      );
      userId = newUserResult.rows[0].id;
      console.log(\`✅ Користувача створено з ID: \${userId}\`);
    } else {
      // Оновлюємо існуючого користувача
      console.log(\`🔄 Оновлюємо існуючого користувача з ID: \${userResult.rows[0].id}\`);
      await client.query(
        'UPDATE users SET name = \$1, phone = \$2, email = \$3, updated_at = CURRENT_TIMESTAMP WHERE telegram_id = \$4',
        [name.trim(), phone, email || '', telegram_id]
      );
      userId = userResult.rows[0].id;
    }
    
    // Створюємо заявку на тестове завдання
    console.log(\`📋 Створюємо заявку на тестове завдання для користувача \${userId}, професія: \${profession}\`);
    await client.query(
      'INSERT INTO test_task_requests (user_id, profession) VALUES (\$1, \$2)',
      [userId, profession]
    );
    
    await client.query('COMMIT');
    
    console.log(\`✅ Заявку успішно збережено. User ID: \${userId}, Джерело: \${contact_source}\`);
    
    res.json({ 
      success: true, 
      message: 'Заявку на тестове завдання збережено успішно',
      user_id: userId,
      contact_source: contact_source
    });
    
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('❌ Помилка збереження заявки:', error);
    res.status(500).json({ 
      error: 'Помилка збереження заявки. Спробуйте ще раз.' 
    });
  } finally {
    client.release();
  }
});

// ========================================
// Webhook Management API
// ========================================

// Глобальна змінна для зберігання посилання на webhookService
let webhookServiceInstance = null;
let botInstance = null;

// API для отримання статусу webhook
app.get('/api/webhook/status', (req, res) => {
  try {
    if (!webhookServiceInstance) {
      return res.status(503).json({ 
        error: 'WebhookService не ініціалізовано' 
      });
    }
    
    const status = webhookServiceInstance.getStatus();
    res.json({ success: true, status });
  } catch (error) {
    console.error('Error getting webhook status:', error);
    res.status(500).json({ error: 'Помилка отримання статусу webhook' });
  }
});

// API для увімкнення/вимкнення webhook
app.post('/api/webhook/toggle', (req, res) => {
  try {
    const { enabled } = req.body;
    
    if (typeof enabled !== 'boolean') {
      return res.status(400).json({ 
        error: 'Параметр enabled має бути boolean' 
      });
    }
    
    if (!webhookServiceInstance) {
      return res.status(503).json({ 
        error: 'WebhookService не ініціалізовано' 
      });
    }
    
    webhookServiceInstance.setEnabled(enabled);
    
    res.json({ 
      success: true, 
      message: \`Webhook \${enabled ? 'увімкнено' : 'вимкнено'}\`,
      enabled 
    });
  } catch (error) {
    console.error('Error toggling webhook:', error);
    res.status(500).json({ error: 'Помилка перемикання webhook' });
  }
});

// Graceful shutdown
process.on('SIGINT', () => {
  pool.end();
  process.exit(0);
});

// Запуск сервера та бота
const PORT = process.env.PORT || 3000;

async function startServer() {
  try {
    // Запускаємо Express сервер
    app.listen(PORT, () => {
      console.log(\`Server running on port \${PORT}\`);
    });

    // Запускаємо Telegram бота (якщо є токен)
    if (process.env.TELEGRAM_BOT_TOKEN) {
      console.log('🔍 Створюємо новий екземпляр бота...');
      const bot = new SkillKlanBot();
      botInstance = bot;
      console.log('🔍 Екземпляр бота створено, запускаємо...');
      await bot.start();
      
      // Зберігаємо посилання на webhookService для API управління
      webhookServiceInstance = bot.webhookService;
      console.log('🔧 WebhookService посилання збережено для API управління');
      
      // Запускаємо cron job для нагадувань
      bot.reminderService.startReminderCron();
      
      console.log('🤖 Telegram bot запущено в webhook режимі');
      console.log('⏰ Cron job для нагадувань запущено');
    } else {
      console.log('⚠️ TELEGRAM_BOT_TOKEN не встановлено, бот не запущено');
    }

  } catch (error) {
    console.error('❌ Помилка запуску сервера:', error);
    process.exit(1);
  }
}

startServer();
EOF"

echo "🛑 Зупинка поточних контейнерів..."
run_on_server "cd $PROJECT_PATH && docker compose down || true"

echo "⏳ Очікування завершення всіх процесів..."
sleep 5

echo "🚀 Запуск контейнерів з webhook режимом..."
run_on_server "cd $PROJECT_PATH && docker compose up -d"

echo "⏳ Очікування запуску сервісів..."
sleep 15

echo "🔍 Перевірка статусу контейнерів..."
run_on_server "cd $PROJECT_PATH && docker compose ps"

echo "📋 Перевірка логів сервера..."
run_on_server "cd $PROJECT_PATH && docker logs skillklan-server --tail 20"

echo "🧪 Тестування API..."
if run_on_server "curl -s http://localhost:3001/api/health | grep -q 'OK'"; then
    echo "✅ API працює правильно"
else
    echo "⚠️  API не відповідає, перевірте логи"
fi

echo "🔍 Фінальна перевірка webhook..."
WEBHOOK_FINAL=$(run_on_server "curl -s 'https://api.telegram.org/bot$BOT_TOKEN/getWebhookInfo'")
echo "Фінальний стан webhook: $WEBHOOK_FINAL"

echo "🎉 Налаштування webhook завершено!"
echo ""
echo "📊 Статус сервісів:"
run_on_server "cd $PROJECT_PATH && docker compose ps"
echo ""
echo "🌐 Доступні URL:"
echo "   - API: http://$SERVER_IP:3001"
echo "   - Health: http://$SERVER_IP:3001/api/health"
echo "   - Webhook: https://$SERVER_IP:3001/webhook"
echo "   - Webhook Status: http://$SERVER_IP:3001/api/webhook/status"
echo "   - Webhook Toggle: http://$SERVER_IP:3001/api/webhook/toggle"
