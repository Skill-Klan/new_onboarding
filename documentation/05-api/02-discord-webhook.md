# 🔗 Discord Webhook інтеграція

## Огляд

Discord Webhook інтеграція забезпечує автоматичні сповіщення менеджерів про всі події в системі онбордингу. Система підтримує гнучке управління через конфігураційний файл та REST API.

## Архітектура

### Компоненти системи

```
┌─────────────────────────────────────────────────────────────────┐
│                    Webhook Toggle System                       │
└─────────────────────────────────────────────────────────────────┘

┌─────────────────┐    ┌──────────────────┐    ┌─────────────────┐
│   Config File   │    │  WebhookService  │    │   REST API      │
│                 │    │                  │    │                 │
│ webhook.config  │───▶│                  │◀───│ /api/webhook/*  │
│                 │    │                  │    │                 │
│ - enabled       │    │ - loadConfig()   │    │ - /status       │
│ - notifications │    │ - sendMessage()  │    │ - /toggle       │
│ - logging       │    │ - setEnabled()   │    │ - /notification │
│ - webhookUrl    │    │ - updateConfig() │    │ - /config       │
└─────────────────┘    └──────────────────┘    └─────────────────┘
                                │
                                ▼
                    ┌─────────────────────┐
                    │   Discord Webhook   │
                    │                     │
                    │ - User Started      │
                    │ - Contact Provided  │
                    │ - Task Sent         │
                    │ - Task Completed    │
                    │ - Deadline Warning  │
                    │ - Deadline Today    │
                    └─────────────────────┘
```

## Конфігурація

### Файл конфігурації
**Розташування:** `server/config/webhook.config.js`

```javascript
module.exports = {
  // Тогл для увімкнення/вимкнення webhook повідомлень
  enabled: false,
  
  // URL Discord webhook
  webhookUrl: process.env.DISCORD_WEBHOOK_URL || 'https://discord.com/api/webhooks/...',
  
  // Таймаут для webhook запитів (в мілісекундах)
  timeout: 10000,
  
  // Кольори для різних типів повідомлень
  colors: {
    info: 0x3498db,      // Синій - інформаційні повідомлення
    success: 0x2ecc71,   // Зелений - успішні дії
    warning: 0xf39c12,   // Помаранчевий - попередження
    danger: 0xe74c3c,    // Червоний - критичні події
    primary: 0x9b59b6    // Фіолетовий - основні події
  },
  
  // Налаштування для різних типів повідомлень
  notifications: {
    userStarted: true,        // Початок взаємодії з ботом
    userReady: true,          // Готовність користувача спробувати
    contactProvided: true,    // Надання контактних даних
    taskSent: true,           // Відправка тестового завдання
    taskCompleted: true,      // Завершення завдання
    deadlineWarning: true,    // Попередження про дедлайн
    deadlineToday: true       // Останній день дедлайну
  },
  
  // Логування webhook дій
  logging: {
    enabled: true,
    logLevel: 'info' // 'debug', 'info', 'warn', 'error'
  }
};
```

## REST API

### Базовий URL
```
http://localhost:3001/api/webhook
```

### Ендпоінти

#### 1. Отримання статусу webhook
**GET** `/api/webhook/status`

```bash
curl -X GET http://localhost:3001/api/webhook/status
```

**Відповідь:**
```json
{
  "success": true,
  "status": {
    "enabled": true,
    "webhookUrl": "встановлено",
    "notifications": {
      "userStarted": true,
      "userReady": true,
      "contactProvided": true,
      "taskSent": true,
      "taskCompleted": true,
      "deadlineWarning": true,
      "deadlineToday": true
    },
    "logging": {
      "enabled": true,
      "logLevel": "info"
    }
  }
}
```

#### 2. Увімкнення/вимкнення webhook
**POST** `/api/webhook/toggle`

```bash
curl -X POST http://localhost:3001/api/webhook/toggle \
  -H "Content-Type: application/json" \
  -d '{"enabled": true}'
```

**Відповідь:**
```json
{
  "success": true,
  "message": "Webhook увімкнено",
  "enabled": true
}
```

#### 3. Управління конкретними типами повідомлень
**POST** `/api/webhook/notification`

```bash
curl -X POST http://localhost:3001/api/webhook/notification \
  -H "Content-Type: application/json" \
  -d '{"type": "userStarted", "enabled": false}'
```

**Відповідь:**
```json
{
  "success": true,
  "message": "Повідомлення userStarted вимкнено",
  "type": "userStarted",
  "enabled": false
}
```

#### 4. Оновлення повної конфігурації
**POST** `/api/webhook/config`

```bash
curl -X POST http://localhost:3001/api/webhook/config \
  -H "Content-Type: application/json" \
  -d '{
    "config": {
      "enabled": true,
      "notifications": {
        "userStarted": true,
        "userReady": false
      }
    }
  }'
```

## Типи повідомлень

### 1. 🚀 Початок взаємодії (userStarted)
**Коли:** Користувач натискає `/start`
**Колір:** Синій (інформаційний)
**Дані:** Ім'я, username, Telegram ID

### 2. 🚀 Готовність спробувати (userReady)
**Коли:** Користувач натискає "Так хочу спробувати"
**Колір:** Синій (інформаційний)
**Дані:** Ім'я, username, Telegram ID, вибрана професія

### 3. 📞 Надання контакту (contactProvided)
**Коли:** Користувач надає номер телефону
**Колір:** Зелений (успішна дія)
**Дані:** Контактна інформація, професія

### 4. 📋 Відправка завдання (taskSent)
**Коли:** Користувач отримує PDF завдання
**Колір:** Фіолетовий (основна подія)
**Дані:** Напрямок, час відправки, дедлайн

### 5. ✅ Завершення завдання (taskCompleted)
**Коли:** Користувач натискає "Я готовий здати"
**Колір:** Зелений (успішна дія)
**Дані:** Час виконання, контактна інформація

### 6. ⚠️ Попередження дедлайну (deadlineWarning)
**Коли:** 7-й день після відправки завдання
**Колір:** Помаранчевий (попередження)
**Дані:** Залишок часу, контактна інформація

### 7. 🚨 Останній день (deadlineToday)
**Коли:** 9-й день (останній день дедлайну)
**Колір:** Червоний (критична подія)
**Дані:** Критичне попередження для менеджерів

## Формат повідомлень

### Структура Discord Embed
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
      },
      {
        "name": "⏰ Час",
        "value": "<t:1756933285:F>", // Discord timestamp
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

## Налаштування Discord

### 1. Створення Webhook
1. Відкрийте Discord сервер
2. Перейдіть до налаштувань каналу
3. Інтеграції → Webhooks → Створити Webhook
4. Скопіюйте URL webhook

### 2. Налаштування в проекті
```env
# В .env файлі
DISCORD_WEBHOOK_URL=https://discord.com/api/webhooks/YOUR_WEBHOOK_URL
```

### 3. Тестування webhook
```bash
# Тестування відправки
curl -X POST http://localhost:3001/api/webhook/toggle \
  -H "Content-Type: application/json" \
  -d '{"enabled": true}'

# Перевірка статусу
curl http://localhost:3001/api/webhook/status
```

## Обробка помилок

### Типові помилки
1. **Webhook URL не встановлено**
   - Перевірте змінну `DISCORD_WEBHOOK_URL`
   - Перевірте правильність URL

2. **Webhook не відповідає**
   - Перевірте доступність Discord
   - Перевірте правильність URL
   - Перевірте мережеве підключення

3. **Повідомлення не відправляються**
   - Перевірте статус webhook
   - Перевірте налаштування notifications
   - Перевірте логи сервера

### Логування
```javascript
// Включення детального логування
{
  "logging": {
    "enabled": true,
    "logLevel": "debug"
  }
}
```

## Моніторинг

### Перевірка статусу
```bash
# Статус webhook
curl http://localhost:3001/api/webhook/status

# Логи сервера
docker logs skillklan-server | grep webhook
```

### Метрики
- Кількість відправлених повідомлень
- Кількість помилок відправки
- Час відповіді webhook
- Статус підключення

## Безпека

### Рекомендації
1. **Не зберігайте webhook URL в коді** - використовуйте змінні середовища
2. **Обмежте доступ до API** - налаштуйте аутентифікацію
3. **Моніторьте використання** - відстежуйте кількість запитів
4. **Регулярно оновлюйте URL** - змінюйте webhook при необхідності

### Обмеження Discord
- **Rate limiting:** 30 повідомлень на хвилину
- **Розмір повідомлення:** 2000 символів
- **Кількість embeds:** 10 на повідомлення
