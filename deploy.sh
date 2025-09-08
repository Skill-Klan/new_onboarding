#!/bin/bash

# Скрипт автоматичного розгортання проекту на сервер
# Використання: ./deploy.sh [branch] [server_ip] [server_user]

set -e  # Зупинити виконання при помилці

# Конфігурація за замовчуванням
DEFAULT_BRANCH="main"
DEFAULT_SERVER_IP="192.168.88.121"
DEFAULT_SERVER_USER="roman"
DEFAULT_PROJECT_PATH="/home/roman/new_onboarding"
DEFAULT_REPO_URL="https://github.com/your-username/new_onboarding.git"

# Параметри
BRANCH=${1:-$DEFAULT_BRANCH}
SERVER_IP=${2:-$DEFAULT_SERVER_IP}
SERVER_USER=${3:-$DEFAULT_SERVER_USER}
PROJECT_PATH=${4:-$DEFAULT_PROJECT_PATH}
REPO_URL=${5:-$DEFAULT_REPO_URL}

echo "🚀 Початок автоматичного розгортання..."
echo "📋 Параметри:"
echo "   - Гілка: $BRANCH"
echo "   - Сервер: $SERVER_USER@$SERVER_IP"
echo "   - Шлях: $PROJECT_PATH"
echo "   - Репозиторій: $REPO_URL"
echo ""

# Функція для виконання команд на сервері
run_on_server() {
    ssh $SERVER_USER@$SERVER_IP "$1"
}

# Функція для копіювання файлів на сервер
copy_to_server() {
    scp -r "$1" $SERVER_USER@$SERVER_IP:"$2"
}

echo "🔍 Перевірка підключення до сервера..."
if ! run_on_server "echo 'Підключення успішне'"; then
    echo "❌ Помилка підключення до сервера $SERVER_IP"
    exit 1
fi

echo "✅ Підключення до сервера успішне"

echo "🛑 Зупинка поточних контейнерів..."
run_on_server "cd $PROJECT_PATH && docker compose down || true"

echo "📦 Клонування/оновлення репозиторію..."
run_on_server "if [ -d '$PROJECT_PATH' ]; then
    cd $PROJECT_PATH
    git fetch origin
    git reset --hard origin/$BRANCH
    git clean -fd
else
    git clone -b $BRANCH $REPO_URL $PROJECT_PATH
    cd $PROJECT_PATH
fi"

echo "🔧 Встановлення залежностей..."
run_on_server "cd $PROJECT_PATH/server && npm install --production"

echo "🐳 Збірка Docker образів..."
run_on_server "cd $PROJECT_PATH && docker build -t new_onboarding-server ./server"

echo "🔧 Налаштування конфігурації..."
# Копіюємо .env файл якщо він існує локально
if [ -f "server/.env" ]; then
    echo "📋 Копіювання .env файлу..."
    copy_to_server "server/.env" "$PROJECT_PATH/server/.env"
fi

# Копіюємо webhook конфігурацію
if [ -f "server/config/webhook.config.js" ]; then
    echo "📋 Копіювання webhook конфігурації..."
    copy_to_server "server/config/webhook.config.js" "$PROJECT_PATH/server/config/webhook.config.js"
fi

echo "🧹 Очищення старих Docker ресурсів..."
run_on_server "docker system prune -f || true"

echo "🚀 Запуск контейнерів..."
run_on_server "cd $PROJECT_PATH && docker compose up -d"

echo "⏳ Очікування запуску сервісів..."
sleep 10

echo "🔍 Перевірка статусу контейнерів..."
run_on_server "cd $PROJECT_PATH && docker compose ps"

echo "🧪 Тестування API..."
if run_on_server "curl -s http://localhost:3001/api/health | grep -q 'OK'"; then
    echo "✅ API працює правильно"
else
    echo "⚠️  API не відповідає, перевірте логи"
fi

echo "📋 Перевірка логів сервера..."
run_on_server "cd $PROJECT_PATH && docker logs skillklan-server --tail 10"

echo "🎉 Розгортання завершено!"
echo ""
echo "📊 Статус сервісів:"
run_on_server "cd $PROJECT_PATH && docker compose ps"
echo ""
echo "🌐 Доступні URL:"
echo "   - API: http://$SERVER_IP:3001"
echo "   - Health: http://$SERVER_IP:3001/api/health"
echo "   - Webhook Toggle: http://$SERVER_IP:3001/api/webhook/toggle"
echo ""
echo "📝 Корисні команди:"
echo "   - Переглянути логи: ssh $SERVER_USER@$SERVER_IP 'cd $PROJECT_PATH && docker logs skillklan-server'"
echo "   - Перезапустити: ssh $SERVER_USER@$SERVER_IP 'cd $PROJECT_PATH && docker compose restart'"
echo "   - Зупинити: ssh $SERVER_USER@$SERVER_IP 'cd $PROJECT_PATH && docker compose down'"
