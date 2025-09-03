# Quick Start Guide - SkillKlan Bot

## 🚀 Швидкий старт

### 1. Клонування та встановлення
```bash
# Клонування репозиторію
git clone <repository-url>
cd new_onboarding/server

# Встановлення залежностей
npm install
```

### 2. Налаштування змінних середовища
```bash
# Копіювання прикладу
cp .env.example .env

# Редагування .env файлу
nano .env
```

**Вміст .env:**
```bash
TELEGRAM_BOT_TOKEN=your_bot_token_here
DB_HOST=localhost
DB_PORT=5432
DB_NAME=skillklan_db
DB_USER=skillklan_user
DB_PASSWORD=your_password_here
```

### 3. Налаштування бази даних
```bash
# Створення бази даних
createdb skillklan_db

# Створення користувача
sudo -u postgres psql
CREATE USER skillklan_user WITH PASSWORD 'your_password';
GRANT ALL PRIVILEGES ON DATABASE skillklan_db TO skillklan_user;
\q

# Створення таблиць
psql -h localhost -U skillklan_user -d skillklan_db -f database/bot_tables.sql
```

### 4. Генерація PDF файлів
```bash
# Генерація тестових завдань
node generate-pdfs.js
```

### 5. Запуск сервера
```bash
# Запуск
node server.js

# Або з автоперезапуском
npx nodemon server.js
```

## 🧪 Тестування

### 1. Перевірка підключення
```bash
# Перевірка БД
psql -h localhost -U skillklan_user -d skillklan_db -c "SELECT COUNT(*) FROM bot_users;"

# Перевірка токена
curl "https://api.telegram.org/bot<YOUR_BOT_TOKEN>/getMe"
```

### 2. Тестовий флоу в Telegram
1. Знайти бота в Telegram
2. Відправити `/start`
3. Вибрати професію (QA або BA)
4. Натиснути "Я готовий спробувати"
5. Надати контакт
6. Отримати PDF завдання
7. Через 10 сек натиснути кнопку здачі

## 🔧 Налаштування Telegram Bot

### 1. Отримання токена
1. Відкрити [@BotFather](https://t.me/botfather)
2. Відправити `/newbot`
3. Вказати назву: `SkillKlan Bot`
4. Вказати username: `skillklan_bot`
5. Отримати токен

### 2. Налаштування бота
```bash
# Встановлення опису
/setdescription
Офіційний бот SkillKlan для онбордингу нових співробітників

# Встановлення команд
/setcommands
start - Почати роботу з ботом
help - Допомога
```

## 🐳 Docker запуск

### 1. Запуск через Docker Compose
```bash
# Запуск
docker compose up --build

# В фоновому режимі
docker compose up -d --build

# Перегляд логів
docker compose logs -f bot
```

### 2. Зупинка
```bash
# Зупинка
docker compose down

# З видаленням томів
docker compose down -v
```

## 📊 Моніторинг

### 1. Перегляд логів
```bash
# В реальному часі
tail -f server.log

# Пошук помилок
grep -i error server.log

# Останні 50 рядків
tail -50 server.log
```

### 2. Перевірка стану БД
```bash
# Підключення
psql -h localhost -U skillklan_user -d skillklan_db

# Перевірка користувачів
SELECT COUNT(*) FROM bot_users;

# Перевірка контактів
SELECT COUNT(*) FROM bot_contacts;

# Останні користувачі
SELECT telegram_id, current_step, selected_profession, created_at 
FROM bot_users 
ORDER BY created_at DESC 
LIMIT 10;
```

## 🛠️ Troubleshooting

### 1. Помилка підключення до БД
```bash
# Перевірка статусу PostgreSQL
sudo systemctl status postgresql

# Перезапуск
sudo systemctl restart postgresql

# Перевірка портів
netstat -tlnp | grep 5432
```

### 2. Помилка токена бота
```bash
# Перевірка токена
curl "https://api.telegram.org/bot<TOKEN>/getMe"

# Перевірка змінних
echo $TELEGRAM_BOT_TOKEN
```

### 3. Помилка PDF файлів
```bash
# Перевірка наявності
ls -la assets/tasks/

# Перегенерація
node generate-pdfs.js
```

### 4. Помилка портів
```bash
# Перевірка зайнятих портів
lsof -i :3000
lsof -i :5432

# Звільнення порту
kill -9 <PID>
```

## 📝 Основні команди

### Робота з Git
```bash
# Статус
git status

# Додати зміни
git add .

# Коміт
git commit -m "Опис змін"

# Пуш
git push origin main
```

### Робота з NPM
```bash
# Встановлення
npm install

# Оновлення
npm update

# Перевірка
npm audit
```

### Робота з БД
```bash
# Підключення
psql -h localhost -U skillklan_user -d skillklan_db

# Виконання SQL
psql -h localhost -U skillklan_user -d skillklan_db -f script.sql

# Експорт
pg_dump -h localhost -U skillklan_user skillklan_db > backup.sql

# Імпорт
psql -h localhost -U skillklan_user -d skillklan_db < backup.sql
```

## 🔄 Розробка

### 1. Структура проекту
```
server/
├── bot/                    # Код бота
│   ├── handlers/          # Обробники команд
│   ├── services/          # Бізнес-логіка
│   ├── templates/         # Шаблони
│   └── types/            # Типи
├── shared/               # Спільні компоненти
├── assets/              # Ресурси
├── database/            # SQL скрипти
└── docs/               # Документація
```

### 2. Додавання нового обробника
```javascript
// bot/handlers/NewHandler.js
const BaseHandler = require('./BaseHandler');

class NewHandler extends BaseHandler {
  async execute(ctx, userState) {
    // Логіка обробника
  }
  
  validateState(userState) {
    // Валідація стану
  }
  
  getNextStep() {
    // Наступний крок
  }
}

module.exports = NewHandler;
```

### 3. Додавання нового повідомлення
```javascript
// bot/templates/messages.js
static getNewMessage() {
  return 'Нове повідомлення';
}
```

### 4. Додавання нової клавіатури
```javascript
// bot/templates/keyboards.js
static getNewKeyboard() {
  return Markup.inlineKeyboard([
    [Markup.button.callback('Кнопка', 'callback_data')]
  ]);
}
```

## 📚 Корисні посилання

- [Telegraf.js Documentation](https://telegraf.js.org/)
- [PostgreSQL Documentation](https://www.postgresql.org/docs/)
- [PDFKit Documentation](https://pdfkit.org/)
- [Telegram Bot API](https://core.telegram.org/bots/api)
- [Node.js Documentation](https://nodejs.org/docs/)

## 🆘 Підтримка

### Логи для дебагу:
```bash
# Всі логи
tail -f server.log

# Тільки помилки
grep -i error server.log

# Тільки конкретний компонент
grep "ComponentName" server.log
```

### Перевірка стану:
```bash
# Статус сервера
ps aux | grep node

# Статус БД
sudo systemctl status postgresql

# Статус Docker
docker compose ps
```

### Очищення:
```bash
# Очищення логів
> server.log

# Очищення БД
psql -h localhost -U skillklan_user -d skillklan_db -c "TRUNCATE bot_users, bot_contacts;"

# Очищення Docker
docker compose down -v
docker system prune -a
```
