# 🔐 GitHub Secrets Configuration

Цей файл описує всі необхідні GitHub Secrets для роботи workflows.

## 📋 Необхідні Secrets

### **SSH та Сервер**
```bash
# SSH приватний ключ для підключення до сервера
SSH_PRIVATE_KEY=-----BEGIN OPENSSH PRIVATE KEY-----
# Ваш приватний SSH ключ тут
-----END OPENSSH PRIVATE KEY-----

# Дані сервера
SERVER_HOST=37.57.209.201
SERVER_USER=roman
SSH_PORT=2222
```

### **API URLs для різних середовищ**
```bash
# Staging environment
API_URL_STAGING=https://staging.your-domain.com/api

# Production environment  
API_URL_PRODUCTION=https://your-domain.com/api
```

### **Додаткові Secrets (опціонально)**
```bash
# Telegram Bot (якщо потрібно)
TELEGRAM_BOT_TOKEN=your_bot_token_here

# Database (якщо потрібно для тестів)
DB_HOST=localhost
DB_USER=skillklan_user
DB_PASSWORD=your_db_password
DB_NAME=skillklan_db
```

## 🚀 Швидке налаштування для SkillKlan

### **Крок 1: Отримання SSH ключа**
```bash
# На локальному комп'ютері
cat ~/.ssh/id_ed25519_skillklan_local
```

### **Крок 2: Додавання GitHub Secrets**
1. Перейдіть в репозиторій: `Settings → Secrets and variables → Actions`
2. Додайте кожен Secret:

| Name | Value |
|------|-------|
| `SSH_PRIVATE_KEY` | Вміст файлу `~/.ssh/id_ed25519_skillklan_local` |
| `SERVER_HOST` | `37.57.209.201` |
| `SERVER_USER` | `roman` |
| `SSH_PORT` | `2222` |
| `API_URL_STAGING` | `https://37.57.209.201/api` |
| `API_URL_PRODUCTION` | `https://37.57.209.201/api` |

### **Крок 3: Перевірка**
```bash
# Тест SSH підключення
ssh -i ~/.ssh/id_ed25519_skillklan_local -p 2222 roman@37.57.209.201 "echo 'SSH працює!'"
```

## 🔧 Як налаштувати Secrets (загальна інструкція)

### **1. Перейдіть в GitHub репозиторій**
```
Settings → Secrets and variables → Actions
```

### **2. Додайте кожен Secret**
- Натисніть "New repository secret"
- Введіть назву (наприклад, `SSH_PRIVATE_KEY`)
- Введіть значення
- Натисніть "Add secret"

### **3. Перевірте наявність всіх Secrets**
```bash
# Обов'язкові для SkillKlan
✅ SSH_PRIVATE_KEY
✅ SERVER_HOST (37.57.209.201)
✅ SERVER_USER (roman)
✅ SSH_PORT (2222)
✅ API_URL_STAGING (https://37.57.209.201/api)
✅ API_URL_PRODUCTION (https://37.57.209.201/api)

# Опціональні
⚠️  TELEGRAM_BOT_TOKEN
⚠️  DB_HOST
⚠️  DB_USER
⚠️  DB_PASSWORD
⚠️  DB_NAME
```

## 🚀 Тестування Secrets

### **1. Запустіть тестовий workflow**
```bash
# Перейдіть в Actions → Manual Deploy & Rollback
# Натисніть "Run workflow"
# Виберіть action: "health-check"
# Environment: "staging"
```

### **2. Перевірте логи**
- Якщо є помилки з Secrets → перевірте назви
- Якщо є помилки підключення → перевірте значення

## 🔒 Безпека Secrets

### **⚠️ НЕ робіть так:**
```bash
# ❌ НЕ комітьте секрети в код
const apiKey = "secret123";

# ❌ НЕ додавайте .env файли в Git
echo "DB_PASSWORD=secret" >> .env
git add .env
```

### **✅ Робіть так:**
```bash
# ✅ Використовуйте GitHub Secrets
const apiKey = process.env.API_KEY;

# ✅ Створіть .env.example
echo "DB_PASSWORD=your_password_here" > .env.example
git add .env.example
```

## 🎯 Наші реальні налаштування

### **Обов'язкові Secrets для SkillKlan:**
```bash
# SSH та Сервер
SSH_PRIVATE_KEY=-----BEGIN OPENSSH PRIVATE KEY-----
# Вміст файлу ~/.ssh/id_ed25519_skillklan_local
-----END OPENSSH PRIVATE KEY-----

SERVER_HOST=37.57.209.201
SERVER_USER=roman
SSH_PORT=2222

# API URLs
API_URL_STAGING=https://37.57.209.201/api
API_URL_PRODUCTION=https://37.57.209.201/api
```

### **Як отримати SSH_PRIVATE_KEY:**
```bash
# На локальному комп'ютері
cat ~/.ssh/id_ed25519_skillklan_local
# Скопіюйте весь вміст (включаючи BEGIN та END рядки)
```

## 📝 Приклад .env.example

```bash
# Server Configuration
NODE_ENV=production
PORT=3000

# Database Configuration
DB_USER=skillklan_user
DB_HOST=localhost
DB_NAME=skillklan_db
DB_PASSWORD=your_secure_password_here
DB_PORT=5432

# API URLs
API_URL_STAGING=https://37.57.209.201/api
API_URL_PRODUCTION=https://37.57.209.201/api

# Security
JWT_SECRET=your_jwt_secret_here

# Telegram Bot (optional)
TELEGRAM_BOT_TOKEN=your_bot_token_here
```

## 🔍 Перевірка роботи

### **1. Перевірте підключення до сервера**
```bash
# На локальному комп'ютері
ssh -i ~/.ssh/id_ed25519_skillklan_local -p 2222 roman@37.57.209.201
```

### **2. Перевірте права користувача**
```bash
# На сервері
sudo -l
ls -la /var/www/skillklan/
```

### **3. Перевірте статус сервісів**
```bash
# На сервері
pm2 list
sudo systemctl status nginx
sudo systemctl status postgresql
```

## 🆘 Вирішення проблем

### **Проблема: "Permission denied"**
```bash
# Рішення: Перевірте SSH ключ та права користувача
ssh-keygen -t ed25519 -f ~/.ssh/id_ed25519_skillklan
ssh-add ~/.ssh/id_ed25519_skillklan
```

### **Проблема: "Connection refused"**
```bash
# Рішення: Перевірте firewall та SSH на сервері
sudo ufw allow 22
sudo systemctl start ssh
```

### **Проблема: "Secret not found"**
```bash
# Рішення: Перевірте назви Secrets в GitHub
# Назви мають точно співпадати
```

## 📞 Підтримка

При проблемах з Secrets:
1. Перевірте назви та значення
2. Перевірте права доступу
3. Перевірте логи workflows
4. Зверніться до документації
