# Залежності SkillKlan Telegram Bot

## 📋 Зміст

1. [Основні залежності](#основні-залежності)
2. [Dev залежності](#dev-залежності)
3. [Системні вимоги](#системні-вимоги)
4. [Встановлення](#встановлення)
5. [Конфігурація](#конфігурація)
6. [Версії та сумісність](#версії-та-сумісність)

## 📦 Основні залежності

### Core Dependencies
```json
{
  "telegraf": "^4.15.0",
  "pg": "^8.11.0",
  "pdfkit": "^0.14.0",
  "axios": "^1.6.0",
  "node-cron": "^3.0.3"
}
```

### Детальний опис

#### 1. telegraf (^4.15.0)
**Призначення:** Telegram Bot API framework
**Функції:**
- Обробка команд та callback'ів
- Відправка повідомлень та файлів
- Робота з клавіатурами
- WebApp інтеграція
- Middleware підтримка

**Використання:**
```javascript
const { Telegraf } = require('telegraf');
const bot = new Telegraf(process.env.TELEGRAM_BOT_TOKEN);
```

**Альтернативи:** `node-telegram-bot-api`, `grammy`

#### 2. pg (^8.11.0)
**Призначення:** PostgreSQL драйвер для Node.js
**Функції:**
- Підключення до PostgreSQL
- Connection pooling
- Підтримка транзакцій
- Prepared statements
- SSL підтримка

**Використання:**
```javascript
const { Pool } = require('pg');
const pool = new Pool({
  host: process.env.DB_HOST,
  port: process.env.DB_PORT,
  database: process.env.DB_NAME,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
});
```

**Альтернативи:** `mysql2`, `sqlite3`, `mongodb`

#### 3. pdfkit (^0.14.0)
**Призначення:** Генерація PDF документів
**Функції:**
- Створення PDF файлів
- Текст та форматування
- Зображення та графіка
- Таблиці та списки

**Використання:**
```javascript
const PDFDocument = require('pdfkit');
const doc = new PDFDocument();
```

**Альтернативи:** `jspdf`, `puppeteer`, `html-pdf`

#### 4. axios (^1.6.0)
**Призначення:** HTTP клієнт для webhook запитів
**Функції:**
- HTTP/HTTPS запити
- Promise-based API
- Request/Response interceptors
- Timeout підтримка
- Error handling

**Використання:**
```javascript
const axios = require('axios');
const response = await axios.post(webhookUrl, payload, {
  headers: { 'Content-Type': 'application/json' },
  timeout: 10000
});
```

**Альтернативи:** `node-fetch`, `got`, `request`

#### 5. node-cron (^3.0.3)
**Призначення:** Планувальник завдань (cron jobs)
**Функції:**
- Cron expression підтримка
- Timezone підтримка
- Запуск/зупинка завдань
- Error handling

**Використання:**
```javascript
const cron = require('node-cron');
cron.schedule('0 10 * * 1-5', async () => {
  await checkAndSendReminders();
}, {
  scheduled: true,
  timezone: "Europe/Kiev"
});
```

**Альтернативи:** `node-schedule`, `agenda`, `bull`

## 🛠️ Dev залежності

### Development Dependencies
```json
{
  "nodemon": "^3.0.0",
  "dotenv": "^16.0.0"
}
```

### Детальний опис

#### 1. nodemon (^3.0.0)
**Призначення:** Автоматичний перезапуск при змінах
**Функції:**
- File watching
- Automatic restart
- Configurable patterns
- Environment variables

**Використання:**
```bash
npx nodemon server.js
```

#### 2. dotenv (^16.0.0)
**Призначення:** Завантаження змінних середовища
**Функції:**
- .env file підтримка
- Environment variable loading
- Validation
- Type conversion

**Використання:**
```javascript
require('dotenv').config();
console.log(process.env.TELEGRAM_BOT_TOKEN);
```

## 💻 Системні вимоги

### Node.js
- **Мінімальна версія:** 16.0.0
- **Рекомендована версія:** 18.0.0+
- **LTS версія:** 20.0.0+

### PostgreSQL
- **Мінімальна версія:** 12.0
- **Рекомендована версія:** 13.0+
- **Підтримувані версії:** 12, 13, 14, 15, 16

### Операційна система
- **Linux:** Ubuntu 20.04+, CentOS 8+, Debian 11+
- **macOS:** 10.15+ (Catalina)
- **Windows:** Windows 10+ (з WSL2)

### Апаратні вимоги
- **RAM:** Мінімум 512MB, рекомендовано 1GB+
- **CPU:** 1 core, рекомендовано 2+ cores
- **Диск:** 1GB вільного місця
- **Мережа:** Стабільне інтернет-з'єднання

## 🚀 Встановлення

### 1. Встановлення Node.js
```bash
# Ubuntu/Debian
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# macOS (з Homebrew)
brew install node

# Windows (з Chocolatey)
choco install nodejs
```

### 2. Встановлення PostgreSQL
```bash
# Ubuntu/Debian
sudo apt-get install postgresql postgresql-contrib

# macOS (з Homebrew)
brew install postgresql

# Windows
# Завантажити з https://www.postgresql.org/download/windows/
```

### 3. Встановлення залежностей проекту
```bash
# Клонування репозиторію
git clone https://github.com/Skill-Klan/new_onboarding.git
cd new_onboarding/server

# Встановлення залежностей
npm install

# Або з yarn
yarn install
```

### 4. Налаштування бази даних
```bash
# Створення бази даних
createdb skillklan_db

# Створення користувача
sudo -u postgres createuser skillklan_user
sudo -u postgres psql -c "ALTER USER skillklan_user PASSWORD 'your_password';"
sudo -u postgres psql -c "GRANT ALL PRIVILEGES ON DATABASE skillklan_db TO skillklan_user;"

# Виконання SQL скриптів
psql -d skillklan_db -f database/bot_tables.sql
psql -d skillklan_db -f database/add_reminder_columns.sql
```

## ⚙️ Конфігурація

### Environment Variables
```bash
# .env файл
TELEGRAM_BOT_TOKEN=your_bot_token_here
DB_HOST=localhost
DB_PORT=5432
DB_NAME=skillklan_db
DB_USER=skillklan_user
DB_PASSWORD=your_secure_password
PORT=3000
NODE_ENV=development
```

### Telegram Bot Token
1. Створіть бота через [@BotFather](https://t.me/botfather)
2. Отримайте токен
3. Додайте токен в .env файл

### Discord Webhook
1. Створіть webhook в Discord каналі
2. Скопіюйте URL webhook
3. Додайте в код або змінні середовища

### Database Configuration
```javascript
// Рекомендовані налаштування пулу з'єднань
const pool = new Pool({
  host: process.env.DB_HOST,
  port: process.env.DB_PORT,
  database: process.env.DB_NAME,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  max: 20,                    // Максимум з'єднань
  idleTimeoutMillis: 30000,   // Таймаут неактивних з'єднань
  connectionTimeoutMillis: 2000, // Таймаут підключення
});
```

## 🔄 Версії та сумісність

### Semantic Versioning
- **Major (X.0.0):** Breaking changes
- **Minor (0.X.0):** Нові функції, backward compatible
- **Patch (0.0.X):** Bug fixes, backward compatible

### Версії залежностей

#### telegraf
- **4.15.0:** Поточна версія
- **4.14.x:** Підтримується
- **4.13.x:** Застаріла
- **Breaking changes:** При оновленні до 5.x

#### pg
- **8.11.0:** Поточна версія
- **8.10.x:** Підтримується
- **8.9.x:** Застаріла
- **Breaking changes:** При оновленні до 9.x

#### pdfkit
- **0.14.0:** Поточна версія
- **0.13.x:** Підтримується
- **0.12.x:** Застаріла

#### axios
- **1.6.0:** Поточна версія
- **1.5.x:** Підтримується
- **1.4.x:** Застаріла
- **Breaking changes:** При оновленні до 2.x

#### node-cron
- **3.0.3:** Поточна версія
- **2.x:** Застаріла
- **Breaking changes:** При оновленні до 3.x

### Оновлення залежностей
```bash
# Перевірка застарілих пакетів
npm outdated

# Оновлення до останніх версій
npm update

# Оновлення конкретного пакету
npm install telegraf@latest

# Оновлення всіх пакетів
npx npm-check-updates -u
npm install
```

## 🐛 Troubleshooting

### Поширені проблеми

#### 1. Помилка підключення до БД
```bash
Error: connect ECONNREFUSED 127.0.0.1:5432
```
**Рішення:**
- Перевірте, чи запущений PostgreSQL
- Перевірте налаштування в .env
- Перевірте права доступу користувача

#### 2. Помилка Telegram Bot API
```bash
Error: 401: Unauthorized
```
**Рішення:**
- Перевірте правильність токена
- Переконайтеся, що бот не заблокований
- Перевірте налаштування webhook

#### 3. Помилка Discord Webhook
```bash
Error: Request failed with status code 404
```
**Рішення:**
- Перевірте правильність URL webhook
- Переконайтеся, що webhook не видалений
- Перевірте права доступу до каналу

#### 4. Помилка PDF генерації
```bash
Error: ENOENT: no such file or directory
```
**Рішення:**
- Перевірте існування PDF файлів
- Запустіть генерацію PDF: `node generate-pdfs.js`
- Перевірте права доступу до файлів

### Логи та дебаг
```bash
# Запуск з детальними логами
DEBUG=* node server.js

# Моніторинг логів
tail -f server.log

# Перевірка статусу сервісів
systemctl status postgresql
systemctl status nginx
```

## 📊 Performance Considerations

### Memory Usage
- **Node.js:** ~50-100MB базове використання
- **PostgreSQL:** ~100-200MB для невеликої БД
- **Total:** ~200-300MB для повної системи

### CPU Usage
- **Idle:** < 1% CPU
- **Active:** 5-15% CPU при обробці повідомлень
- **Peak:** До 50% CPU при генерації PDF

### Network Usage
- **Inbound:** ~1-5KB на повідомлення
- **Outbound:** ~10-50KB на відповідь
- **Webhook:** ~1-2KB на Discord повідомлення

### Database Performance
- **Connection Pool:** 10-20 з'єднань
- **Query Time:** < 100ms для більшості запитів
- **Indexes:** Оптимізовані для швидкого пошуку

## 🔒 Security Considerations

### Dependencies Security
```bash
# Перевірка вразливостей
npm audit

# Автоматичне виправлення
npm audit fix

# Детальний звіт
npm audit --audit-level moderate
```

### Environment Security
- Використовуйте сильні паролі
- Обмежте доступ до .env файлів
- Використовуйте HTTPS для webhook
- Регулярно оновлюйте залежності

### Database Security
- Використовуйте SSL з'єднання
- Обмежте права користувача БД
- Регулярно робіть резервні копії
- Моніторьте підозрілу активність