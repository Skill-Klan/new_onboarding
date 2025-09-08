# 🚀 Скрипти розгортання

## Огляд

Проект включає набір скриптів для автоматизації розгортання та управління системою. Всі скрипти розташовані в корені проекту та готові до використання.

## 📋 Доступні скрипти

### 1. deploy.sh - Автоматичне розгортання

**Призначення:** Повне розгортання проекту на сервер з GitHub репозиторію

**Використання:**
```bash
./deploy.sh [branch] [server_ip] [server_user] [project_path] [repo_url]
```

**Параметри:**
- `branch` - гілка для розгортання (за замовчуванням: main)
- `server_ip` - IP адреса сервера (за замовчуванням: 192.168.88.121)
- `server_user` - користувач на сервері (за замовчуванням: roman)
- `project_path` - шлях до проекту на сервері (за замовчуванням: /home/roman/new_onboarding)
- `repo_url` - URL репозиторію (за замовчуванням: https://github.com/your-username/new_onboarding.git)

**Приклад:**
```bash
./deploy.sh main 192.168.88.121 roman
```

**Функції:**
- ✅ Перевірка підключення до сервера
- ✅ Зупинка поточних контейнерів
- ✅ Клонування/оновлення репозиторію
- ✅ Встановлення залежностей
- ✅ Збірка Docker образів
- ✅ Копіювання конфігурації
- ✅ Очищення старих ресурсів
- ✅ Запуск контейнерів
- ✅ Тестування API
- ✅ Перевірка статусу

### 2. fix-bot-conflict.sh - Вирішення конфлікту бота

**Призначення:** Вирішення проблеми з конфліктом 409 "terminated by setWebhook request"

**Використання:**
```bash
./fix-bot-conflict.sh [server_ip] [server_user]
```

**Параметри:**
- `server_ip` - IP адреса сервера (за замовчуванням: 192.168.88.121)
- `server_user` - користувач на сервері (за замовчуванням: roman)

**Приклад:**
```bash
./fix-bot-conflict.sh 192.168.88.121 roman
```

**Функції:**
- ✅ Очищення webhook
- ✅ Зупинка всіх контейнерів
- ✅ Пошук інших екземплярів бота
- ✅ Очищення Docker ресурсів
- ✅ Оновлення конфігурації
- ✅ Перезапуск сервісів
- ✅ Тестування роботи

### 3. setup-webhook.sh - Налаштування webhook режиму

**Призначення:** Налаштування webhook режиму замість polling для Telegram бота

**Використання:**
```bash
./setup-webhook.sh [server_ip] [server_user] [webhook_url]
```

**Параметри:**
- `server_ip` - IP адреса сервера (за замовчуванням: 192.168.88.121)
- `server_user` - користувач на сервері (за замовчуванням: roman)
- `webhook_url` - URL для webhook (за замовчуванням: https://SERVER_IP:3001/webhook)

**Приклад:**
```bash
./setup-webhook.sh 192.168.88.121 roman https://192.168.88.121:3001/webhook
```

**Функції:**
- ✅ Очищення поточного webhook
- ✅ Встановлення нового webhook
- ✅ Оновлення конфігурації сервера
- ✅ Перезапуск сервісів
- ✅ Тестування webhook

### 4. setup-github-actions.sh - Налаштування GitHub Actions

**Призначення:** Налаштування секретів для GitHub Actions CI/CD

**Використання:**
```bash
./setup-github-actions.sh [repository] [server_ip] [server_user]
```

**Параметри:**
- `repository` - репозиторій у форматі owner/repo (за замовчуванням: your-username/new_onboarding)
- `server_ip` - IP адреса сервера (за замовчуванням: 192.168.88.121)
- `server_user` - користувач на сервері (за замовчуванням: roman)

**Приклад:**
```bash
./setup-github-actions.sh your-username/new_onboarding 192.168.88.121 roman
```

**Функції:**
- ✅ Перевірка GitHub CLI
- ✅ Авторизація в GitHub
- ✅ Встановлення секретів
- ✅ Перевірка налаштувань

## 🔧 Налаштування

### Перед використанням скриптів

#### 1. SSH ключі
```bash
# Генерація SSH ключа (якщо немає)
ssh-keygen -t rsa -b 4096 -C "your_email@example.com"

# Копіювання ключа на сервер
ssh-copy-id user@your-server-ip

# Тестування підключення
ssh user@your-server-ip "echo 'Підключення успішне'"
```

#### 2. GitHub CLI
```bash
# Встановлення GitHub CLI
# macOS
brew install gh

# Ubuntu/Debian
curl -fsSL https://cli.github.com/packages/githubcli-archive-keyring.gpg | sudo dd of=/usr/share/keyrings/githubcli-archive-keyring.gpg
echo "deb [arch=$(dpkg --print-architecture) signed-by=/usr/share/keyrings/githubcli-archive-keyring.gpg] https://cli.github.com/packages stable main" | sudo tee /etc/apt/sources.list.d/github-cli.list > /dev/null
sudo apt update
sudo apt install gh

# Авторизація
gh auth login
```

#### 3. Docker на сервері
```bash
# Встановлення Docker
curl -fsSL https://get.docker.com -o get-docker.sh
sh get-docker.sh

# Додавання користувача до групи docker
sudo usermod -aG docker $USER

# Перезавантаження сесії
exit
ssh user@server-ip
```

## 📊 Моніторинг скриптів

### Логи виконання
```bash
# Запуск з логуванням
./deploy.sh 2>&1 | tee deploy.log

# Перегляд логів
tail -f deploy.log

# Пошук помилок
grep -i error deploy.log
```

### Перевірка статусу
```bash
# Статус контейнерів
ssh user@server-ip "cd /path/to/project && docker compose ps"

# Логи сервера
ssh user@server-ip "cd /path/to/project && docker logs skillklan-server --tail 20"

# API health check
curl http://server-ip:3001/api/health
```

## 🔄 Автоматизація

### Cron job для регулярного деплою
```bash
# Додати до crontab
crontab -e

# Щодня о 2:00 ранку
0 2 * * * /path/to/project/deploy.sh main server-ip username

# Щотижня о 3:00 ранку в неділю
0 3 * * 0 /path/to/project/deploy.sh main server-ip username
```

### Alias для швидкого доступу
```bash
# Додати до ~/.bashrc або ~/.zshrc
alias deploy-bot="cd /path/to/project && ./deploy.sh"
alias fix-bot="cd /path/to/project && ./fix-bot-conflict.sh"
alias setup-webhook="cd /path/to/project && ./setup-webhook.sh"
alias check-status="ssh user@server-ip 'cd /path/to/project && docker compose ps'"

# Перезавантажити shell
source ~/.bashrc
```

## 🐛 Усунення проблем

### Проблема: Permission denied
**Рішення:**
```bash
chmod +x *.sh
```

### Проблема: SSH connection failed
**Рішення:**
```bash
# Перевірка SSH ключів
ssh-add -l

# Тестування підключення
ssh -v user@server-ip
```

### Проблема: Docker command not found
**Рішення:**
```bash
# На сервері
sudo usermod -aG docker $USER
# Перезавантажити сесію
```

### Проблема: GitHub CLI not found
**Рішення:**
```bash
# Встановити GitHub CLI
# Див. інструкції вище
```

### Проблема: Webhook не працює
**Рішення:**
```bash
# Перевірити webhook статус
curl -s 'https://api.telegram.org/bot<TOKEN>/getWebhookInfo'

# Очистити webhook
curl -s -X POST 'https://api.telegram.org/bot<TOKEN>/deleteWebhook'

# Встановити новий webhook
curl -s -X POST 'https://api.telegram.org/bot<TOKEN>/setWebhook' -H 'Content-Type: application/json' -d '{"url": "https://your-server.com/webhook"}'
```

## 📝 Приклади використання

### Повний цикл розгортання
```bash
# 1. Вирішення конфлікту (якщо потрібно)
./fix-bot-conflict.sh

# 2. Налаштування webhook
./setup-webhook.sh

# 3. Повний деплой
./deploy.sh main 192.168.88.121 roman

# 4. Перевірка роботи
curl http://192.168.88.121:3001/api/health
```

### Оновлення тільки коду
```bash
# Швидке оновлення без повного деплою
ssh user@server-ip "cd /path/to/project && git pull origin main && docker compose restart"
```

### Backup перед деплоєм
```bash
# Створення backup
ssh user@server-ip "cd /path/to/project && docker compose exec postgres pg_dump -U skillklan_user skillklan_db > backup_$(date +%Y%m%d_%H%M%S).sql"

# Деплой
./deploy.sh main 192.168.88.121 roman

# Відкат при проблемах
ssh user@server-ip "cd /path/to/project && docker compose exec postgres psql -U skillklan_user skillklan_db < backup_20250108_120000.sql"
```

## 🎯 Рекомендації

### Безпека
- ✅ Використовуйте SSH ключі замість паролів
- ✅ Обмежте доступ до сервера
- ✅ Регулярно оновлюйте залежності
- ✅ Робіть backup перед деплоєм

### Продуктивність
- ✅ Використовуйте Docker для консистентності
- ✅ Моніторьте ресурси сервера
- ✅ Оптимізуйте збірку образів
- ✅ Використовуйте multi-stage builds

### Надійність
- ✅ Тестуйте скрипти на staging
- ✅ Робіть rollback план
- ✅ Моніторьте логи
- ✅ Налаштуйте алерти
