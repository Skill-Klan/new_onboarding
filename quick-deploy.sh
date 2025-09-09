#!/bin/bash

# Швидкий деплой для локального сервера
# Використовується коли GitHub Actions недоступний

echo "🚀 Швидкий деплой на локальний сервер..."

# Конфігурація
SERVER_IP="192.168.88.121"
SERVER_USER="roman"
PROJECT_PATH="/home/roman/new_onboarding"

# 1. Push в репозиторій
echo "📤 Push в репозиторій..."
git push origin main

if [ $? -ne 0 ]; then
    echo "❌ Помилка при push в репозиторій"
    exit 1
fi

echo "✅ Код запушено в репозиторій"

# 2. Pull на сервері
echo "📥 Pull на сервері..."
ssh $SERVER_USER@$SERVER_IP "cd $PROJECT_PATH && git pull origin main"

if [ $? -ne 0 ]; then
    echo "❌ Помилка при pull на сервері"
    exit 1
fi

echo "✅ Код оновлено на сервері"

# 3. Перевірка статусу
echo "🔍 Перевірка статусу контейнерів..."
ssh $SERVER_USER@$SERVER_IP "cd $PROJECT_PATH && docker compose ps"

# 4. Тест API
echo "🧪 Тест API..."
if curl -s http://$SERVER_IP:3001/api/health > /dev/null; then
    echo "✅ API працює!"
    curl -s http://$SERVER_IP:3001/api/health
else
    echo "⚠️  API не відповідає"
fi

# 5. Тест бота
echo "🤖 Тест бота..."
ssh $SERVER_USER@$SERVER_IP "cd $PROJECT_PATH && docker exec skillklan-server node -e \"
const { Telegraf } = require('telegraf');
const bot = new Telegraf(process.env.TELEGRAM_BOT_TOKEN);
bot.telegram.getMe().then(me => {
  console.log('✅ Бот підключено:', me.first_name, '(@' + me.username + ')');
}).catch(err => {
  console.log('❌ Помилка бота:', err.message);
});
\""

# 6. Захист конфігураційних файлів
echo "🔒 Захист конфігураційних файлів..."
ssh $SERVER_USER@$SERVER_IP "cd $PROJECT_PATH && chmod 444 server/.env server/config/webhook.config.js docker-compose.yml deploy.sh 2>/dev/null || true"

echo ""
echo "🎉 Деплой завершено!"
echo "🌐 API: http://$SERVER_IP:3001/api/health"
echo "📱 Frontend: http://$SERVER_IP:8080"
echo "🤖 Bot: @Skill_Klan_bot"
echo "🔒 Конфігураційні файли захищено від редагування"
