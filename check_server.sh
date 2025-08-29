#!/bin/bash

echo "=== ПЕРЕВІРКА СТАНУ СЕРВЕРА ==="
echo "Підключаюся до сервера..."

# Автоматичне підключення через expect або створення SSH ключа
ssh -o StrictHostKeyChecking=no -o ConnectTimeout=10 -p 22 roman@37.57.209.201 << 'EOF'
echo "=== СТАН СЕРВЕРА ==="
echo "1. Поточний користувач:"
whoami
echo "2. Поточний каталог:"
pwd
echo "3. Статус PM2:"
pm2 status 2>/dev/null || echo "PM2 не встановлений або не запущений"
echo "4. Статус Nginx:"
sudo systemctl status nginx --no-pager 2>/dev/null || echo "Nginx не встановлений або не запущений"
echo "5. Відкриті порти:"
netstat -tlnp 2>/dev/null | grep -E ":(80|3000|443|22)" || echo "netstat недоступний"
echo "6. Процеси Node.js:"
ps aux | grep node | grep -v grep || echo "Node.js процеси не знайдено"
echo "7. Процеси Nginx:"
ps aux | grep nginx | grep -v grep || echo "Nginx процеси не знайдено"
EOF

echo "=== ПЕРЕВІРКА ЗАВЕРШЕНА ==="

