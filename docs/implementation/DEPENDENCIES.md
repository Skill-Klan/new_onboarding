# Залежності та налаштування - SkillKlan Bot

## 📦 NPM пакети

### Основні залежності

#### 1. Telegraf (^4.15.0)
**Призначення:** Telegram Bot API для Node.js
```bash
npm install telegraf
```

**Використання:**
```javascript
const { Telegraf } = require('telegraf');
const bot = new Telegraf(process.env.TELEGRAM_BOT_TOKEN);
```

**Ключові функції:**
- Обробка команд та callback'ів
- Відправка повідомлень та файлів
- Робота з клавіатурами
- Middleware система

#### 2. pg (^8.11.0)
**Призначення:** PostgreSQL драйвер для Node.js
```bash
npm install pg
```

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

**Ключові функції:**
- Підключення до PostgreSQL
- Виконання SQL запитів
- Connection pooling
- Транзакції

#### 3. pdfkit (^0.14.0)
**Призначення:** Генерація PDF файлів
```bash
npm install pdfkit
```

**Використання:**
```javascript
const PDFDocument = require('pdfkit');
const doc = new PDFDocument();
doc.pipe(fs.createWriteStream('output.pdf'));
doc.text('Hello World');
doc.end();
```

**Ключові функції:**
- Створення PDF документів
- Додавання тексту та зображень
- Форматування
- Збереження в файл

### Dev залежності (опціонально)

#### 1. nodemon
**Призначення:** Автоматичний перезапуск при змінах
```bash
npm install --save-dev nodemon
```

**Використання:**
```bash
npx nodemon server.js
```

#### 2. eslint
**Призначення:** Лінтер для JavaScript
```bash
npm install --save-dev eslint
```

## 🖥️ Системні вимоги

### Node.js
**Версія:** 16.0.0 або вище
```bash
# Перевірка версії
node --version

# Встановлення через nvm
nvm install 16
nvm use 16
```

### PostgreSQL
**Версія:** 12.0 або вище
```bash
# Ubuntu/Debian
sudo apt-get install postgresql postgresql-contrib

# macOS
brew install postgresql

# Windows
# Завантажити з https://www.postgresql.org/download/windows/
```

### Docker (опціонально)
**Версія:** 20.0 або вище
```bash
# Перевірка версії
docker --version
docker compose version
```

## ⚙️ Налаштування середовища

### 1. Змінні середовища

#### server/.env
```bash
# Telegram Bot
TELEGRAM_BOT_TOKEN=your_bot_token_here

# Database
DB_HOST=localhost
DB_PORT=5432
DB_NAME=skillklan_db
DB_USER=skillklan_user
DB_PASSWORD=your_password_here

# Server
PORT=3000
NODE_ENV=development
```

#### server/config.env (для Docker)
```bash
# Telegram Bot
TELEGRAM_BOT_TOKEN=your_bot_token_here

# Database
DB_HOST=postgres
DB_PORT=5432
DB_NAME=skillklan_db
DB_USER=skillklan_user
DB_PASSWORD=your_password_here

# Server
PORT=3000
NODE_ENV=production
```

### 2. Налаштування PostgreSQL

#### Створення бази даних
```sql
-- Підключення як postgres
sudo -u postgres psql

-- Створення користувача
CREATE USER skillklan_user WITH PASSWORD 'your_password';

-- Створення бази даних
CREATE DATABASE skillklan_db OWNER skillklan_user;

-- Надання прав
GRANT ALL PRIVILEGES ON DATABASE skillklan_db TO skillklan_user;

-- Підключення до бази
\c skillklan_db

-- Надання прав на схему
GRANT ALL ON SCHEMA public TO skillklan_user;
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO skillklan_user;
GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO skillklan_user;
```

#### Створення таблиць
```sql
-- Виконання SQL скрипту
psql -h localhost -U skillklan_user -d skillklan_db -f database/bot_tables.sql
```

### 3. Налаштування Telegram Bot

#### Отримання токена
1. Відкрити [@BotFather](https://t.me/botfather)
2. Відправити `/newbot`
3. Вказати назву бота
4. Вказати username бота
5. Отримати токен

#### Налаштування бота
```bash
# Встановлення опису
/setdescription

# Встановлення команд
/setcommands
start - Почати роботу з ботом
help - Допомога
```

## 🐳 Docker налаштування

### docker-compose.yml
```yaml
version: '3.8'

services:
  postgres:
    image: postgres:14
    environment:
      POSTGRES_DB: skillklan_db
      POSTGRES_USER: skillklan_user
      POSTGRES_PASSWORD: your_password
    ports:
      - "5432:5432"
    volumes:
      - postgres_data:/var/lib/postgresql/data
      - ./database:/docker-entrypoint-initdb.d

  bot:
    build: .
    depends_on:
      - postgres
    environment:
      - NODE_ENV=production
    env_file:
      - config.env
    volumes:
      - ./assets:/app/assets
    restart: unless-stopped

volumes:
  postgres_data:
```

### Dockerfile
```dockerfile
FROM node:16-alpine

WORKDIR /app

# Копіювання package.json та package-lock.json
COPY package*.json ./

# Встановлення залежностей
RUN npm ci --only=production

# Копіювання коду
COPY . .

# Створення користувача
RUN addgroup -g 1001 -S nodejs
RUN adduser -S nodejs -u 1001

# Зміна власника
RUN chown -R nodejs:nodejs /app
USER nodejs

# Відкриття порту
EXPOSE 3000

# Команда запуску
CMD ["node", "server.js"]
```

## 🔧 Налаштування розробки

### 1. Структура проекту
```
server/
├── .env                    # Локальні змінні
├── .gitignore             # Git ignore
├── package.json           # NPM залежності
├── server.js              # Точка входу
├── bot/                   # Код бота
├── shared/                # Спільні компоненти
├── assets/                # Ресурси
├── database/              # SQL скрипти
└── docs/                  # Документація
```

### 2. .gitignore
```gitignore
# Dependencies
node_modules/
npm-debug.log*

# Environment variables
.env
.env.local
.env.production

# Logs
*.log
logs/

# Runtime data
pids/
*.pid
*.seed
*.pid.lock

# Coverage directory used by tools like istanbul
coverage/

# nyc test coverage
.nyc_output

# Dependency directories
node_modules/
jspm_packages/

# Optional npm cache directory
.npm

# Optional REPL history
.node_repl_history

# Output of 'npm pack'
*.tgz

# Yarn Integrity file
.yarn-integrity

# dotenv environment variables file
.env

# IDE
.vscode/
.idea/
*.swp
*.swo

# OS
.DS_Store
Thumbs.db
```

### 3. package.json
```json
{
  "name": "skillklan-server",
  "version": "1.0.0",
  "description": "SkillKlan Telegram Bot Server",
  "main": "server.js",
  "scripts": {
    "start": "node server.js",
    "dev": "nodemon server.js",
    "test": "echo \"Error: no test specified\" && exit 1"
  },
  "dependencies": {
    "telegraf": "^4.15.0",
    "pg": "^8.11.0",
    "pdfkit": "^0.14.0"
  },
  "devDependencies": {
    "nodemon": "^3.0.0"
  },
  "engines": {
    "node": ">=16.0.0"
  }
}
```

## 🚀 Запуск проекту

### 1. Локальний запуск
```bash
# Клонування репозиторію
git clone <repository-url>
cd new_onboarding/server

# Встановлення залежностей
npm install

# Налаштування змінних середовища
cp .env.example .env
# Відредагувати .env файл

# Налаштування БД
createdb skillklan_db
psql -d skillklan_db -f database/bot_tables.sql

# Генерація PDF файлів
node generate-pdfs.js

# Запуск сервера
npm start
```

### 2. Docker запуск
```bash
# Запуск через Docker Compose
docker compose up --build

# Запуск в фоновому режимі
docker compose up -d --build

# Перегляд логів
docker compose logs -f bot
```

### 3. Production запуск
```bash
# Встановлення PM2
npm install -g pm2

# Запуск через PM2
pm2 start server.js --name "skillklan-bot"

# Налаштування автозапуску
pm2 startup
pm2 save
```

## 🔍 Перевірка налаштувань

### 1. Перевірка Node.js
```bash
node --version
npm --version
```

### 2. Перевірка PostgreSQL
```bash
# Підключення до БД
psql -h localhost -U skillklan_user -d skillklan_db

# Перевірка таблиць
\dt

# Перевірка даних
SELECT COUNT(*) FROM bot_users;
```

### 3. Перевірка Telegram Bot
```bash
# Тест токена
curl "https://api.telegram.org/bot<YOUR_BOT_TOKEN>/getMe"
```

### 4. Перевірка сервера
```bash
# Запуск сервера
node server.js

# Перевірка в браузері
curl http://localhost:3000/health
```

## 🛠️ Troubleshooting

### 1. Проблеми з підключенням до БД
```bash
# Перевірка статусу PostgreSQL
sudo systemctl status postgresql

# Перезапуск PostgreSQL
sudo systemctl restart postgresql

# Перевірка портів
netstat -tlnp | grep 5432
```

### 2. Проблеми з токеном бота
```bash
# Перевірка токена
curl "https://api.telegram.org/bot<TOKEN>/getMe"

# Перевірка змінних середовища
echo $TELEGRAM_BOT_TOKEN
```

### 3. Проблеми з правами доступу
```bash
# Зміна прав на файли
chmod 644 server.js
chmod 755 assets/

# Зміна власника
chown -R $USER:$USER .
```

### 4. Проблеми з портами
```bash
# Перевірка зайнятих портів
lsof -i :3000
lsof -i :5432

# Звільнення порту
kill -9 <PID>
```
