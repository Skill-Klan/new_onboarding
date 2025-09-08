# Webhook Toggle Architecture

## Архітектурна діаграма

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

## Потік даних

```
1. Bot Handler
   │
   ▼
2. WebhookService.notifyXxx()
   │
   ▼
3. Перевірка enabled (глобальний тогл)
   │
   ▼
4. Перевірка notifications[type] (індивідуальний тогл)
   │
   ▼
5. WebhookService.sendMessage()
   │
   ▼
6. Перевірка webhookUrl
   │
   ▼
7. HTTP POST до Discord
   │
   ▼
8. Логування результату
```

## Компоненти

### 1. Конфігурація
- **Файл**: `server/config/webhook.config.js`
- **Функція**: Централізоване зберігання налаштувань
- **Підтримка**: Змінні середовища, значення за замовчуванням

### 2. WebhookService
- **Файл**: `server/bot/services/WebhookService.js`
- **Функція**: Логіка відправки webhook повідомлень
- **Методи**:
  - `sendMessage()` - Відправка повідомлення
  - `setEnabled()` - Управління глобальним тоглом
  - `setNotificationEnabled()` - Управління індивідуальними тоглами
  - `updateConfig()` - Оновлення конфігурації
  - `getStatus()` - Отримання поточного статусу

### 3. REST API
- **Файл**: `server/server.js`
- **Функція**: HTTP інтерфейс для управління
- **Ендпоінти**:
  - `GET /api/webhook/status` - Статус
  - `POST /api/webhook/toggle` - Глобальний тогл
  - `POST /api/webhook/notification` - Індивідуальні тогли
  - `POST /api/webhook/config` - Оновлення конфігурації

### 4. Bot Handlers
- **Файли**: `server/bot/handlers/*.js`
- **Функція**: Виклик webhook повідомлень
- **Інтеграція**: Через WebhookService

## Типи повідомлень

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   User Started  │    │   User Ready    │    │ Contact Provided│
│                 │    │                 │    │                 │
│ notifyUserStarted│    │ notifyUserReady │    │notifyContactProvided│
└─────────────────┘    └─────────────────┘    └─────────────────┘
         │                       │                       │
         └───────────────────────┼───────────────────────┘
                                 │
         ┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
         │   Task Sent     │    │ Task Completed  │    │ Deadline Warning│
         │                 │    │                 │    │                 │
         │ notifyTaskSent  │    │notifyTaskCompleted│   │notifyDeadlineWarning│
         └─────────────────┘    └─────────────────┘    └─────────────────┘
                                 │
                    ┌─────────────────┐
                    │  Deadline Today │
                    │                 │
                    │notifyDeadlineToday│
                    └─────────────────┘
```

## Конфігурація

### Глобальні налаштування
```javascript
{
  enabled: true,           // Глобальний тогл
  webhookUrl: "...",       // URL webhook
  timeout: 10000,          // Таймаут запитів
  logging: {               // Налаштування логування
    enabled: true,
    logLevel: 'info'
  }
}
```

### Налаштування повідомлень
```javascript
{
  notifications: {
    userStarted: true,        // Початок взаємодії
    userReady: true,          // Готовність спробувати
    contactProvided: true,    // Надання контактів
    taskSent: true,           // Відправка завдання
    taskCompleted: true,      // Завершення завдання
    deadlineWarning: true,    // Попередження дедлайну
    deadlineToday: true       // Останній день дедлайну
  }
}
```

## Переваги архітектури

### 1. Модульність
- Окремий файл конфігурації
- Ізольований WebhookService
- Незалежний REST API

### 2. Гнучкість
- Глобальний та індивідуальний контроль
- Зміни в реальному часі
- Підтримка змінних середовища

### 3. Надійність
- Graceful fallback
- Детальне логування
- Обробка помилок

### 4. Зручність
- Простий API
- Документовані приклади
- Тестові скрипти
