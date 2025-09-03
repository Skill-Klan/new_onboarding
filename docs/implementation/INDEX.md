# SkillKlan Telegram Bot - Повна документація

## 📚 Зміст документації

### 🚀 Швидкий старт
- **[QUICK_START.md](./QUICK_START.md)** - Швидкий старт, налаштування та запуск
- **[README.md](./README.md)** - Повний огляд проекту та архітектури

### 🏗️ Архітектура
- **[ARCHITECTURE.md](./ARCHITECTURE.md)** - Детальна архітектура системи
- **[API_REFERENCE.md](./API_REFERENCE.md)** - Повний API reference

### 🔧 Налаштування
- **[DEPENDENCIES.md](./DEPENDENCIES.md)** - Залежності та налаштування середовища
- **[ERRORS_AND_FIXES.md](./ERRORS_AND_FIXES.md)** - Помилки та їх виправлення

## 🎯 Основні компоненти

### Bot Handlers
- `StartHandler` - Команда /start
- `ProfessionHandler` - Вибір професії (QA/BA)
- `ReadyToTryHandler` - Кнопка "Я готовий спробувати"
- `ContactHandler` - Збір контактних даних
- `TaskHandler` - Відправка PDF завдань
- `TaskSubmissionHandler` - Здача завдання

### Services
- `UserStateService` - Управління станом користувача
- `ContactService` - Робота з контактами
- `TaskService` - Робота з PDF завданнями

### Database
- `bot_users` - Основна таблиця користувачів
- `bot_contacts` - Контактні дані

## 🔄 Потік роботи

1. **Початок** - `/start` → привітання
2. **Вибір професії** - QA або BA
3. **Готовність** - "Я готовий спробувати"
4. **Контакт** - Збір телефону (якщо потрібно)
5. **Завдання** - Відправка PDF
6. **Здача** - Кнопка здачі завдання
7. **Завершення** - Повідомлення про менеджера

## 🛠️ Технології

- **Node.js** - Backend
- **Telegraf.js** - Telegram Bot API
- **PostgreSQL** - База даних
- **PDFKit** - Генерація PDF
- **Docker** - Контейнеризація

## 📋 Швидкий доступ

### Запуск проекту
```bash
# Клонування
git clone <repo>
cd server

# Встановлення
npm install

# Налаштування
cp .env.example .env
# Відредагувати .env

# БД
createdb skillklan_db
psql -d skillklan_db -f database/bot_tables.sql

# PDF
node generate-pdfs.js

# Запуск
node server.js
```

### Docker запуск
```bash
docker compose up --build
```

### Тестування
1. `/start` в Telegram
2. Вибір професії
3. "Я готовий спробувати"
4. Надання контакту
5. Отримання PDF
6. Кнопка здачі

## 🔍 Дебаг

### Логи
```bash
tail -f server.log
grep -i error server.log
```

### БД
```bash
psql -h localhost -U skillklan_user -d skillklan_db
SELECT * FROM bot_users LIMIT 5;
```

### Статус
```bash
ps aux | grep node
sudo systemctl status postgresql
docker compose ps
```

## 📞 Підтримка

### Основні файли
- `server.js` - Точка входу
- `bot/bot.js` - Основний клас бота
- `bot/handlers/` - Обробники команд
- `bot/services/` - Бізнес-логіка
- `shared/database/` - Робота з БД

### Критичні налаштування
- `TELEGRAM_BOT_TOKEN` - Токен бота
- `DB_*` - Налаштування БД
- `assets/tasks/` - PDF файли

### Важливі зауваження
- Без кешування - кожен запит в БД
- Детальне логування для дебагу
- Валідація стану в кожному обробнику
- Автоматичні кнопки через 10 секунд

## 🚀 Наступні кроки

1. Додати адмін-панель
2. Реалізувати систему сповіщень
3. Додати аналітику
4. Оптимізувати продуктивність
5. Додати тести
6. Налаштувати CI/CD

---

**Останнє оновлення:** 2025-09-03  
**Версія:** 1.0.0  
**Статус:** Production Ready
