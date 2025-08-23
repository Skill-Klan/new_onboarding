#!/bin/bash

# SkillKlan Mini App Local Deployment Script
# Використовує існуючу інфраструктуру на сервері
# Автор: Roman
# Дата: 2025-08-23

set -e

# Кольори для виводу
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

echo -e "${BLUE}🚀 Локальний деплой Mini App SkillKlan${NC}"

# Перевірка залежностей
echo -e "${GREEN}📋 Перевірка залежностей...${NC}"
if ! command -v npm &> /dev/null; then
    echo "❌ npm не знайдено!"
    exit 1
fi

if ! command -v node &> /dev/null; then
    echo "❌ Node.js не знайдено!"
    exit 1
fi

echo "✅ Всі залежності знайдено"

# Збірка проекту
echo -e "${GREEN}🔨 Збірка проекту...${NC}"
cd miniapp

echo "📦 Встановлення залежностей..."
npm install

echo "🏗️ Збірка проекту..."
npm run build

if [ ! -d "dist" ]; then
    echo "❌ Збірка невдала!"
    exit 1
fi

echo "✅ Проект успішно збудовано"
echo "📊 Розмір збудованих файлів:"
du -sh dist/*

cd ..

# Копіювання на сервер
echo -e "${GREEN}📤 Копіювання на сервер...${NC}"
echo "📁 Копіювання dist директорії..."

scp -P 2222 -i ~/.ssh/id_ed25519_skillklan_local -r miniapp/dist roman@37.57.209.201:/tmp/

if [ $? -ne 0 ]; then
    echo "❌ Помилка копіювання на сервер!"
    exit 1
fi

echo "✅ Файли скопійовано на сервер"

# Розгортання на сервері
echo -e "${GREEN}🚀 Розгортання на сервері...${NC}"
ssh -i ~/.ssh/id_ed25519_skillklan_local -p 2222 roman@37.57.209.201 "
    echo 'Створення бекапу...'
    echo 'SamsunG' | sudo -S mkdir -p /var/www/skillklan/miniapp/backup
    
    echo 'Бекап поточної версії...'
    if [ -d '/var/www/skillklan/miniapp/index.html' ]; then
        echo 'SamsunG' | sudo -S cp -r /var/www/skillklan/miniapp/index.html /var/www/skillklan/miniapp/backup/index-\$(date +%Y%m%d-%H%M%S).html 2>/dev/null || true
    fi
    
    echo 'Видалення старих файлів...'
    echo 'SamsunG' | sudo -S rm -f /var/www/skillklan/miniapp/index.html
    echo 'SamsunG' | sudo -S rm -f /var/www/skillklan/miniapp/vite.svg
    echo 'SamsunG' | sudo -S rm -rf /var/www/skillklan/miniapp/assets
    
    echo 'Розгортання нової версії...'
    echo 'SamsunG' | sudo -S cp -r /tmp/dist/* /var/www/skillklan/miniapp/
    
    echo 'Встановлення прав...'
    echo 'SamsunG' | sudo -S chown -R roman:roman /var/www/skillklan/miniapp/*
    echo 'SamsunG' | sudo -S chmod -R 755 /var/www/skillklan/miniapp/*
    
    echo 'Очищення тимчасових файлів...'
    rm -rf /tmp/dist
    
    echo '✅ Mini App розгорнуто успішно!'
"

if [ $? -ne 0 ]; then
    echo "❌ Помилка розгортання на сервері!"
    exit 1
fi

# Перезавантаження Nginx
echo -e "${GREEN}🔄 Перезавантаження Nginx...${NC}"
ssh -i ~/.ssh/id_ed25519_skillklan_local -p 2222 roman@37.57.209.201 "echo 'SamsunG' | sudo -S systemctl reload nginx"

# Тестування деплою
echo -e "${GREEN}🧪 Тестування деплою...${NC}"
echo "🌐 Тестування головної сторінки..."
http_response=$(ssh -i ~/.ssh/id_ed25519_skillklan_local -p 2222 roman@37.57.209.201 "curl -k -s -o /dev/null -w '%{http_code}' https://localhost/")

if [ "$http_response" = "200" ]; then
    echo "✅ Головна сторінка: $http_response"
else
    echo "⚠️ Головна сторінка: $http_response"
fi

echo "🔌 Тестування API..."
api_response=$(ssh -i ~/.ssh/id_ed25519_skillklan_local -p 2222 roman@37.57.209.201 "curl -k -s -o /dev/null -w '%{http_code}' https://localhost/api/check-user/123456789")

if [ "$api_response" = "200" ]; then
    echo "✅ API: $api_response"
else
    echo "⚠️ API: $api_response"
fi

# Фінальна перевірка
echo -e "${GREEN}📋 Фінальна перевірка...${NC}"
ssh -i ~/.ssh/id_ed25519_skillklan_local -p 2222 roman@37.57.209.201 "
    echo '📁 Структура файлів:'
    ls -la /var/www/skillklan/miniapp/ | grep -E '(index\.html|assets|vite\.svg)'
    
    echo '📊 Розмір файлів:'
    du -sh /var/www/skillklan/miniapp/*
"

echo -e "${BLUE}🎉 ДЕПЛОЙ MINI APP ЗАВЕРШЕНО УСПІШНО!${NC}"
echo -e "${GREEN}🌐 Mini App доступна: https://37.57.209.201${NC}"
echo -e "${GREEN}🔌 API доступне: https://37.57.209.201/api/${NC}"
echo -e "${YELLOW}💡 Для повного деплою використовуйте: ./deploy-skillklan.sh miniapp${NC}"
