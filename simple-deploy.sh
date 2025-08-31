#!/bin/bash

# 🚀 Простий деплой SkillKlan
# Автор: Roman
# Дата: 31 серпня 2025

set -e  # Зупинитися при помилці

echo "🚀 Starting SkillKlan deployment..."

# 1. Перевірка Git статусу
echo "📋 Checking Git status..."
if [ -n "$(git status --porcelain)" ]; then
    echo "⚠️  Warning: Uncommitted changes detected"
    echo "📝 Current changes:"
    git status --short
    read -p "Continue with deployment? (y/N): " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        echo "❌ Deployment cancelled"
        exit 1
    fi
fi

# 2. Git pull (оновлення коду)
echo "📥 Pulling latest changes..."
git pull origin main
echo "✅ Code updated successfully"

# 3. Restart Docker services
echo "🐳 Restarting Docker services..."
docker compose restart
echo "✅ Docker services restarted"

# 4. Wait for services to start
echo "⏳ Waiting for services to start..."
sleep 10

# 5. Health check
echo "🏥 Performing health check..."
if curl -s -f http://localhost/api/health > /dev/null; then
    echo "✅ Health check passed"
else
    echo "⚠️  Health check failed - checking service status..."
    docker compose ps
    echo "⚠️  Services may need more time to start"
fi

echo "🎉 Deployment completed!"
echo "🌐 Frontend: http://localhost"
echo "🔌 API: http://localhost/api"
echo "📊 Status: docker compose ps"
