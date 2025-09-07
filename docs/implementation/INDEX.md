# SkillKlan Telegram Bot - Документація

## 📋 Зміст

1. [Загальний огляд](#загальний-огляд)
2. [Швидкий старт](#швидкий-старт)
3. [Архітектура](#архітектура)
4. [API Reference](#api-reference)
5. [Залежності](#залежності)
6. [Помилки та виправлення](#помилки-та-виправлення)
7. [Розгортання](#розгортання)

## 🎯 Загальний огляд

**SkillKlan Telegram Bot** - це повнофункціональний бот для онбордингу нових користувачів в IT школу SkillKlan. Бот проводить користувачів через повний цикл від вибору професії до здачі тестового завдання.

### ✨ Основні функції
- 🎯 **Вибір професії** (QA Engineer або Business Analyst)
- 📞 **Збір контактних даних** з валідацією
- 📋 **Відправка PDF завдань** з автоматичними кнопками
- ⏰ **Система нагадувань** (3-й, 7-й, 9-й день)
- 🔗 **Discord webhook інтеграція** для менеджерів
- 📊 **Розрахунок часу виконання** завдань
- 🗄️ **Надійне збереження даних** в PostgreSQL

### 🏗️ Технологічний стек
- **Backend:** Node.js + Telegraf
- **База даних:** PostgreSQL
- **PDF генерація:** PDFKit
- **Планувальник:** node-cron
- **HTTP клієнт:** axios
- **Контейнеризація:** Docker

## 🚀 Швидкий старт

### 1. Встановлення
```bash
git clone https://github.com/Skill-Klan/new_onboarding.git
cd new_onboarding/server
npm install
```

### 2. Налаштування БД
```bash
createdb skillklan_db
psql -d skillklan_db -f database/bot_tables.sql
psql -d skillklan_db -f database/add_reminder_columns.sql
```

### 3. Конфігурація
```bash
cp env.example .env
# Відредагуйте .env файл
```

### 4. Запуск
```bash
node generate-pdfs.js  # Генерація PDF завдань
node server.js         # Запуск бота
```

**Детальний гід:** [Quick Start Guide](QUICK_START.md)

## 🏗️ Архітектура

### Компоненти системи
```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Telegram      │    │   Node.js Bot   │    │   PostgreSQL    │
│   Users         │◄──►│   Server        │◄──►│   Database      │
└─────────────────┘    └─────────────────┘    └─────────────────┘
                              │
                              ▼
                       ┌─────────────────┐
                       │   Discord       │
                       │   Webhook       │
                       └─────────────────┘
```

### Структура проекту
```
server/
├── bot/                    # Telegram бот
│   ├── handlers/          # Обробники команд
│   ├── services/          # Бізнес-логіка
│   │   ├── UserStateService.js    # Управління станом
│   │   ├── ContactService.js      # Робота з контактами
│   │   ├── TaskService.js         # PDF завдання
│   │   ├── ReminderService.js     # Нагадування
│   │   └── WebhookService.js      # Discord webhook
│   ├── templates/         # Шаблони повідомлень
│   └── types/            # Типи даних
├── shared/               # Спільні компоненти
├── assets/              # Ресурси (PDF файли)
└── database/           # SQL скрипти
```

**Детальна архітектура:** [Architecture Guide](ARCHITECTURE.md)

## 📚 API Reference

### WebhookService
```javascript
const webhookService = new WebhookService();

// Повідомлення про початок взаємодії
await webhookService.notifyUserStarted(userData);

// Повідомлення про надання контакту
await webhookService.notifyContactProvided(userData, contactData);

// Повідомлення про відправку завдання
await webhookService.notifyTaskSent(userData, taskData);

// Повідомлення про завершення завдання
await webhookService.notifyTaskCompleted(userData);
```

### ReminderService
```javascript
const reminderService = new ReminderService(databaseService, bot, webhookService);

// Запуск cron job для нагадувань
reminderService.startReminderCron();

// Відправка нагадування
await reminderService.sendReminder(telegramId, 'day_3');
```

### UserStateService
```javascript
const userStateService = new UserStateService(databaseService);

// Отримання стану користувача
const state = await userStateService.getState(telegramId);

// Оновлення стану
await userStateService.updateState(telegramId, { currentStep: 'profession_selection' });

// Позначення завдання як відправлене
await userStateService.markTaskSent(telegramId);
```

**Повний API Reference:** [API Reference](API_REFERENCE.md)

## 📦 Залежності

### Основні пакети
```json
{
  "telegraf": "^4.15.0",      // Telegram Bot API
  "pg": "^8.11.0",           // PostgreSQL драйвер
  "pdfkit": "^0.14.0",       // Генерація PDF
  "axios": "^1.6.0",         // HTTP клієнт
  "node-cron": "^3.0.3"      // Планувальник завдань
}
```

### Системні вимоги
- **Node.js:** 16.0.0+
- **PostgreSQL:** 12.0+
- **RAM:** 512MB+ (рекомендовано 1GB+)
- **CPU:** 1 core+ (рекомендовано 2+ cores)

**Детальні залежності:** [Dependencies Guide](DEPENDENCIES.md)

## 🐛 Помилки та виправлення

### Поширені проблеми

#### 1. Помилка імпортів
```javascript
// ❌ Неправильно
const { MessageTemplates } = require('../templates/messages');

// ✅ Правильно
const MessageTemplates = require('../templates/messages');
```

#### 2. JSON парсинг помилки
```javascript
// Безпечний парсинг reminders_sent
if (typeof data.reminders_sent === 'string') {
  try {
    state.remindersSent = JSON.parse(data.reminders_sent);
  } catch (error) {
    state.remindersSent = [];
  }
} else {
  state.remindersSent = data.reminders_sent || [];
}
```

#### 3. Webhook помилки
```javascript
// Webhook не впливає на роботу бота
try {
  await this.webhookService.sendMessage(embed);
} catch (webhookError) {
  console.error('❌ Webhook помилка:', webhookError);
  // Продовжуємо роботу
}
```

**Всі помилки та виправлення:** [Errors and Fixes](ERRORS_AND_FIXES.md)

## 🚀 Розгортання

### Docker Deployment
```bash
# Запуск всіх сервісів
docker-compose up --build

# Запуск в фоновому режимі
docker-compose up -d --build
```

### Production з PM2
```bash
# Встановлення PM2
npm install -g pm2

# Запуск
pm2 start server.js --name "skillklan-bot"

# Автозапуск
pm2 startup
pm2 save
```

### Nginx конфігурація
```nginx
server {
    listen 80;
    server_name your-domain.com;
    
    location / {
        proxy_pass http://localhost:3000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }
}
```

## 📊 Статистика проекту

- **28 файлів** змінено
- **812 рядків** додано
- **61 рядок** видалено
- **2 нові сервіси** створено
- **6 webhook тригерів** реалізовано
- **3 типи нагадувань** налаштовано
- **100% покриття** основних сценаріїв

## 🔄 Webhook тригери

### Discord повідомлення
1. 🚀 **Початок взаємодії** - користувач натискає `/start`
2. 📞 **Надання контакту** - користувач надає номер телефону
3. 📋 **Відправка завдання** - користувач отримує PDF завдання
4. ✅ **Завершення завдання** - користувач натискає "Я готовий здати"
5. ⚠️ **Попередження дедлайну** - 7-й день після відправки
6. 🚨 **Останній день** - 9-й день (критичне попередження)

### Формат повідомлень
```javascript
{
  "embeds": [{
    "title": "🚀 Новий користувач почав взаємодію з ботом",
    "color": 3447003, // Синій
    "fields": [
      {
        "name": "👤 Користувач",
        "value": "**Ім'я:** Roman\n**Username:** @Num1221\n**Telegram ID:** `316149980`",
        "inline": true
      }
    ],
    "footer": {
      "text": "SkillKlan Onboarding Bot"
    },
    "timestamp": "2025-09-03T21:01:25.166Z"
  }]
}
```

## ⏰ Система нагадувань

### Планування
- **3-й день:** Мотиваційне повідомлення
- **7-й день:** Попередження + webhook для менеджерів
- **9-й день:** Критичне повідомлення + webhook

### Cron розклад
```javascript
// Щодня о 12:00 за Києвом, з понеділка по п'ятницю
cron.schedule('0 10 * * 1-5', async () => {
  await this.checkAndSendReminders();
}, {
  scheduled: true,
  timezone: "Europe/Kiev"
});
```

### Розрахунок дедлайну
- **9 робочих днів** (виключаючи вихідні)
- Автоматичний розрахунок при відправці завдання
- Збереження в БД для подальшого використання

## 🎯 Наступні кроки

### ✅ Завершено
- [x] Система нагадувань
- [x] Discord webhook інтеграція
- [x] Розрахунок часу виконання
- [x] Централізоване управління текстами
- [x] Детальна документація

### 🔄 В планах
- [ ] Адмін-панель для менеджерів
- [ ] Аналітика використання
- [ ] Оптимізація продуктивності
- [ ] Автоматичні тести
- [ ] Моніторинг webhook повідомлень

## 📞 Підтримка

### Корисні ресурси
- **GitHub Issues:** [Створити issue](https://github.com/Skill-Klan/new_onboarding/issues)
- **Документація:** `docs/implementation/`
- **Логи:** `server.log`
- **Конфігурація:** `.env`

### Корисні команди
```bash
# Моніторинг логів
tail -f server.log

# Перевірка статусу
curl http://localhost:3000/api/health

# Backup БД
pg_dump -h localhost -U skillklan_user skillklan_db > backup.sql

# Очищення логів
> server.log
```

---

**Версія документації:** 2.0.0  
**Останнє оновлення:** 2025-09-03  
**Автор:** SkillKlan Development Team