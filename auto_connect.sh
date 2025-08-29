#!/bin/bash

echo "=== АВТОМАТИЧНЕ ПІДКЛЮЧЕННЯ ДО СЕРВЕРА ==="
echo "IP: 37.57.209.201"
echo "Користувач: roman"
echo "Порт: 22"

# Використовуємо expect для автоматичного введення пароля
expect << 'EOF'
set timeout 30
spawn ssh -o StrictHostKeyChecking=no -p 22 roman@37.57.209.201
expect {
    "password:" {
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
    }
    "Permission denied" {
        send_user "Пароль не прийнято\n"
        exit 1
    }
    timeout {
        send_user "Таймаут підключення\n"
        exit 1
    }
}
EOF

echo "=== ПІДКЛЮЧЕННЯ ЗАВЕРШЕНЕ ==="



