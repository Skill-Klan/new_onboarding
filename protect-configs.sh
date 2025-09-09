#!/bin/bash

# Скрипт для захисту конфігураційних файлів
# Запускати після кожного деплою

echo "🔒 Захист конфігураційних файлів..."

# Конфігурація
SERVER_IP="192.168.88.121"
SERVER_USER="roman"
PROJECT_PATH="/home/roman/new_onboarding"

# Список файлів для захисту
PROTECTED_FILES=(
    "server/.env"
    "server/config/webhook.config.js"
    "server/config/production.config.js"
    "docker-compose.yml"
    "deploy.sh"
)

# Функція для встановлення прав тільки для читання
protect_file() {
    local file_path="$1"
    echo "🛡️  Захищаю: $file_path"
    
    # Встановлюємо права тільки для читання
    ssh $SERVER_USER@$SERVER_IP "cd $PROJECT_PATH && chmod 444 $file_path 2>/dev/null || echo 'Файл не знайдено: $file_path'"
    
    # Створюємо резервну копію
    ssh $SERVER_USER@$SERVER_IP "cd $PROJECT_PATH && cp $file_path ${file_path}.backup 2>/dev/null || echo 'Не вдалося створити backup: $file_path'"
}

# Захищаємо кожен файл
for file in "${PROTECTED_FILES[@]}"; do
    protect_file "$file"
done

# Створюємо індексний файл захищених файлів
ssh $SERVER_USER@$SERVER_IP "cd $PROJECT_PATH && cat > PROTECTED_FILES.txt << 'EOF'
# Захищені конфігураційні файли
# Дата захисту: $(date)

server/.env
server/config/webhook.config.js
server/config/production.config.js
docker-compose.yml
deploy.sh

# Для редагування використовуйте:
# chmod 644 filename
# nano filename
# chmod 444 filename
EOF"

echo "✅ Конфігураційні файли захищено!"
echo "📋 Список захищених файлів:"
ssh $SERVER_USER@$SERVER_IP "cd $PROJECT_PATH && cat PROTECTED_FILES.txt"

echo ""
echo "🔧 Для редагування конфігурації:"
echo "   1. ssh roman@192.168.88.121"
echo "   2. cd /home/roman/new_onboarding"
echo "   3. chmod 644 filename"
echo "   4. nano filename"
echo "   5. chmod 444 filename"
