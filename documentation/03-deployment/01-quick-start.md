# 🚀 Швидкий старт

## Передумови

### Системні вимоги
- **Node.js:** 16.0.0+
- **PostgreSQL:** 12.0+
- **Docker:** 20.0+ (опціонально)
- **Git:** 2.0+

### Облікові запити
- **Telegram Bot Token** - отримати у @BotFather
- **Discord Webhook URL** - створити в Discord сервері
- **GitHub репозиторій** - для зберігання коду

## Варіант 1: Docker (Рекомендовано)

### 1. Клонування репозиторію
```bash
git clone https://github.com/your-username/new_onboarding.git
cd new_onboarding
```

### 2. Налаштування змінних середовища
```bash
cd server
cp env.example .env
```

Відредагуйте `.env` файл:
```env
# Telegram Bot
TELEGRAM_BOT_TOKEN=your_bot_token_here
WEBAPP_URL=https://skill-klan.github.io/new_onboarding/faq

# Database
DB_HOST=postgres
DB_PORT=5432
DB_NAME=skillklan_db
DB_USER=skillklan_user
DB_PASSWORD=SkillKlan2024

# Discord Webhook
DISCORD_WEBHOOK_URL=your_discord_webhook_url_here

# Server
NODE_ENV=production
PORT=3001
```

### 3. Запуск через Docker
```bash
# Повернутися в корінь проекту
cd ..

# Запуск всіх сервісів
docker compose up -d

# Перевірка статусу
docker compose ps
```

### 4. Перевірка роботи
```bash
# Перевірка API
curl http://localhost:3001/api/health

# Перевірка логів
docker compose logs -f server
```

## Варіант 2: Локальний запуск

### 1. Встановлення залежностей
```bash
cd server
npm install
```

### 2. Налаштування бази даних
```bash
# Створення бази даних
createdb skillklan_db

# Виконання SQL скриптів
psql -d skillklan_db -f database/bot_tables.sql
psql -d skillklan_db -f database/add_reminder_columns.sql
```

### 3. Генерація PDF завдань
```bash
node generate-pdfs.js
```

### 4. Запуск сервера
```bash
node server.js
```

## Варіант 3: Автоматичний деплой на сервер

### 1. Підготовка сервера
```bash
# На сервері встановити Docker
curl -fsSL https://get.docker.com -o get-docker.sh
sh get-docker.sh

# Додати користувача до групи docker
sudo usermod -aG docker $USER
```

### 2. Налаштування SSH ключів
```bash
# На локальній машині
ssh-copy-id user@your-server-ip
```

### 3. Запуск автоматичного деплою
```bash
# З локальної машини
./deploy.sh main your-server-ip your-username
```

## Перевірка роботи

### 1. API Health Check
```bash
curl http://localhost:3001/api/health
# Очікуваний результат: {"status":"ok","timestamp":"..."}
```

### 2. Webhook Status
```bash
curl http://localhost:3001/api/webhook/status
# Очікуваний результат: {"success":true,"status":{...}}
```

### 3. Тестування бота
1. Відкрийте Telegram
2. Знайдіть вашого бота
3. Натисніть `/start`
4. Пройдіть весь флоу

### 4. Перевірка Discord webhook
1. Відкрийте Discord сервер
2. Перевірте канал з webhook
3. Повинні з'явитися сповіщення про події

## Налаштування FAQ Mini App

### 1. Автоматичний деплой (GitHub Pages)
```bash
# Push в main гілку автоматично запустить деплой
git add .
git commit -m "Update FAQ"
git push origin main
```

### 2. Локальний запуск
```bash
cd miniapp
npm install
npm run dev
```

### 3. Перевірка FAQ
- Відкрийте https://skill-klan.github.io/new_onboarding/faq
- Перевірте відображення та функціональність

## Налаштування GitHub Actions

### 1. Створення секретів
```bash
# В GitHub репозиторії перейдіть до Settings > Secrets
# Додайте наступні секрети:
SERVER_IP=your-server-ip
SERVER_USER=your-username
```

### 2. Налаштування скрипту
```bash
./setup-github-actions.sh your-username/your-repo your-server-ip your-username
```

## Усунення проблем

### Проблема: Бот не відповідає
**Рішення:**
1. Перевірте токен бота в `.env`
2. Перевірте логи: `docker compose logs server`
3. Перевірте підключення до БД

### Проблема: Webhook не працює
**Рішення:**
1. Перевірте URL webhook в Discord
2. Перевірте налаштування в `.env`
3. Перевірте логи webhook сервісу

### Проблема: FAQ не відкривається
**Рішення:**
1. Перевірте налаштування GitHub Pages
2. Перевірте URL в налаштуваннях бота
3. Перевірте збірку Mini App

## Наступні кроки

### 1. Налаштування домену
- Налаштуйте домен для сервера
- Оновіть webhook URL
- Налаштуйте SSL сертифікат

### 2. Моніторинг
- Налаштуйте логування
- Додайте метрики
- Налаштуйте алерти

### 3. Безпека
- Налаштуйте файрвол
- Оновіть паролі
- Налаштуйте backup

## Корисні команди

### Docker
```bash
# Перезапуск сервісів
docker compose restart

# Перегляд логів
docker compose logs -f

# Зупинка сервісів
docker compose down

# Очищення
docker system prune -f
```

### База даних
```bash
# Підключення до БД
psql -h localhost -U skillklan_user -d skillklan_db

# Backup БД
pg_dump -h localhost -U skillklan_user skillklan_db > backup.sql

# Restore БД
psql -h localhost -U skillklan_user -d skillklan_db < backup.sql
```

### Логи
```bash
# Перегляд логів сервера
tail -f server.log

# Пошук помилок
grep -i error server.log

# Моніторинг в реальному часі
tail -f server.log | grep -i "webhook\|error"
```
