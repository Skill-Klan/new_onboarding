#!/bin/bash

# Скрипт для вирішення проблеми з конфліктом Telegram бота
# Використання: ./fix-bot-conflict.sh [server_ip] [server_user]

set -e

# Параметри
SERVER_IP=${1:-"192.168.88.121"}
SERVER_USER=${2:-"roman"}
PROJECT_PATH="/home/roman/new_onboarding"

echo "🔧 Вирішення проблеми з конфліктом Telegram бота..."
echo "📋 Параметри:"
echo "   - Сервер: $SERVER_USER@$SERVER_IP"
echo "   - Шлях: $PROJECT_PATH"
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

echo "🧹 Очищення webhook..."
WEBHOOK_RESULT=$(run_on_server "curl -s -X POST 'https://api.telegram.org/bot$BOT_TOKEN/deleteWebhook'")
echo "Webhook результат: $WEBHOOK_RESULT"

echo "🔍 Перевірка поточного стану webhook..."
WEBHOOK_INFO=$(run_on_server "curl -s 'https://api.telegram.org/bot$BOT_TOKEN/getWebhookInfo'")
echo "Webhook інформація: $WEBHOOK_INFO"

echo "🛑 Зупинка всіх контейнерів..."
run_on_server "cd $PROJECT_PATH && docker compose down || true"

echo "⏳ Очікування завершення всіх процесів..."
sleep 5

echo "🔍 Пошук інших екземплярів бота..."
run_on_server "ps aux | grep -i bot | grep -v grep || echo 'Інших екземплярів бота не знайдено'"

echo "🔍 Пошук інших Docker контейнерів з ботом..."
run_on_server "docker ps -a | grep -i bot || echo 'Інших контейнерів з ботом не знайдено'"

echo "🧹 Очищення Docker ресурсів..."
run_on_server "docker system prune -f || true"

echo "🔧 Оновлення конфігурації webhook (вимкнення polling)..."
# Створюємо тимчасовий файл з оновленою конфігурацією
run_on_server "cd $PROJECT_PATH && cat > server/config/webhook.config.js << 'EOF'
// Конфігурація веб-хуків
// Цей файл містить налаштування для Discord webhook інтеграції

module.exports = {
  // Тогл для увімкнення/вимкнення webhook повідомлень
  enabled: false,
  
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

echo "🚀 Запуск контейнерів..."
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

echo "🎉 Вирішення конфлікту завершено!"
echo ""
echo "📊 Статус сервісів:"
run_on_server "cd $PROJECT_PATH && docker compose ps"
echo ""
echo "🌐 Доступні URL:"
echo "   - API: http://$SERVER_IP:3001"
echo "   - Health: http://$SERVER_IP:3001/api/health"
echo "   - Webhook Toggle: http://$SERVER_IP:3001/api/webhook/toggle"
