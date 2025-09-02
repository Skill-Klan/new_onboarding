#!/bin/bash

# Скрипт для запуску Telegram бота в Docker контейнері

echo "🤖 Запуск SkillKlan Telegram Bot в Docker..."

# Перевіряємо чи є токен
if [ -z "$TELEGRAM_BOT_TOKEN" ]; then
    echo "❌ TELEGRAM_BOT_TOKEN не встановлено"
    echo "Встановіть токен: export TELEGRAM_BOT_TOKEN=your_token_here"
    exit 1
fi

# Перевіряємо токен
echo "🔍 Перевірка токена..."
RESPONSE=$(curl -s "https://api.telegram.org/bot$TELEGRAM_BOT_TOKEN/getMe")
if echo "$RESPONSE" | grep -q '"ok":true'; then
    echo "✅ Токен валідний"
    BOT_NAME=$(echo "$RESPONSE" | grep -o '"first_name":"[^"]*"' | cut -d'"' -f4)
    echo "📱 Бот: $BOT_NAME"
else
    echo "❌ Токен невалідний"
    exit 1
fi

# Видаляємо webhook якщо є
echo "🧹 Очищення webhook..."
curl -s "https://api.telegram.org/bot$TELEGRAM_BOT_TOKEN/deleteWebhook" > /dev/null

# Зупиняємо всі getUpdates
echo "🛑 Зупинка всіх getUpdates..."
curl -s "https://api.telegram.org/bot$TELEGRAM_BOT_TOKEN/getUpdates?offset=-1" > /dev/null

# Запускаємо бота в Docker контейнері
echo "🚀 Запуск бота в Docker контейнері..."
docker exec -e TELEGRAM_BOT_TOKEN="$TELEGRAM_BOT_TOKEN" skillklan-server node -e "
const SkillKlanBot = require('./bot/bot.js');
const bot = new SkillKlanBot();
bot.start().then(() => {
    console.log('🤖 Telegram bot запущено успішно!');
    console.log('📱 Бот готовий до роботи');
    console.log('💡 Напишіть /start боту для тестування');
}).catch(error => {
    console.error('❌ Помилка запуску бота:', error.message);
    process.exit(1);
});
"
