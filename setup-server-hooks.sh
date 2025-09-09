#!/bin/bash

# Скрипт для встановлення Git hooks на сервері

SERVER_IP="192.168.88.121"
SERVER_USER="roman"
PROJECT_PATH="/home/roman/new_onboarding"

echo "🔧 Встановлення Git hooks на сервері..."

# Копіюємо post-receive hook на сервер
echo "📋 Копіюємо post-receive hook..."
scp server-post-receive-hook $SERVER_USER@$SERVER_IP:$PROJECT_PATH/.git/hooks/post-receive

# Робимо hook виконуваним
echo "🔑 Встановлюємо права доступу..."
ssh $SERVER_USER@$SERVER_IP "chmod +x $PROJECT_PATH/.git/hooks/post-receive"

# Перевіряємо встановлення
echo "✅ Перевіряємо встановлення..."
ssh $SERVER_USER@$SERVER_IP "ls -la $PROJECT_PATH/.git/hooks/post-receive"

echo "🎉 Git hooks встановлено на сервері!"
echo ""
echo "📝 Тепер при git push в репозиторій буде автоматично:"
echo "   1. Оновлювати код на сервері"
echo "   2. Перезапускати Docker контейнери"
echo "   3. Тестувати API"
