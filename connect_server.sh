#!/bin/bash

echo "=== ПІДКЛЮЧЕННЯ ДО СЕРВЕРА ==="
echo "IP: 37.57.209.201"
echo "Користувач: roman"
echo "Порт: 22"

# Використовуємо expect для автоматичного введення пароля
expect << 'EOF'
spawn ssh -o StrictHostKeyChecking=no -p 22 roman@37.57.209.201
expect "password:"
send "SamsunG\r"
expect "$"
send "echo '=== СТАН СЕРВЕРА ==='\r"
expect "$"
send "whoami\r"
expect "$"
send "pwd\r"
expect "$"
send "echo '--- PM2 СТАТУС ---'\r"
expect "$"
send "pm2 status 2>/dev/null || echo 'PM2 не запущений'\r"
expect "$"
send "echo '--- NGINX СТАТУС ---'\r"
expect "$"
send "sudo systemctl status nginx --no-pager 2>/dev/null || echo 'Nginx не запущений'\r"
expect "$"
send "echo '--- ВІДКРИТІ ПОРТИ ---'\r"
expect "$"
send "netstat -tlnp 2>/dev/null | grep -E ':(80|3000|443|22)' || echo 'netstat недоступний'\r"
expect "$"
send "echo '--- ПРОЦЕСИ NODE.JS ---'\r"
expect "$"
send "ps aux | grep node | grep -v grep || echo 'Node.js процеси не знайдено'\r"
expect "$"
send "exit\r"
expect eof
EOF

echo "=== ПІДКЛЮЧЕННЯ ЗАВЕРШЕНЕ ==="







