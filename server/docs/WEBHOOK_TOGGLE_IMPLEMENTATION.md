# Webhook Toggle Implementation

## Огляд

Реалізовано функціональність тоглу для веб-хуків, яка дозволяє увімкнення/вимкнення webhook повідомлень через окремий файл конфігурації та REST API.

## Архітектура

### 1. Файл конфігурації
- **Розташування**: `server/config/webhook.config.js`
- **Призначення**: Централізоване управління налаштуваннями webhook
- **Підтримка**: Змінні середовища для URL webhook

### 2. Модифікований WebhookService
- **Файл**: `server/bot/services/WebhookService.js`
- **Нові функції**:
  - Завантаження конфігурації з файлу
  - Перевірка глобального тоглу
  - Перевірка індивідуальних налаштувань для кожного типу повідомлень
  - Методи для управління конфігурацією в реальному часі

### 3. REST API для управління
- **Базовий URL**: `/api/webhook`
- **Ендпоінти**:
  - `GET /status` - Отримання поточного статусу
  - `POST /toggle` - Увімкнення/вимкнення webhook
  - `POST /notification` - Управління конкретними типами повідомлень
  - `POST /config` - Оновлення повної конфігурації

## Функціональність

### Глобальний тогл
- Увімкнення/вимкнення всіх webhook повідомлень
- Налаштування через файл конфігурації або API
- Логування змін статусу

### Індивідуальні налаштування
Кожен тип повідомлень може бути увімкнений/вимкнений окремо:

1. **userStarted** - Початок взаємодії з ботом
2. **userReady** - Готовність користувача спробувати
3. **contactProvided** - Надання контактних даних
4. **taskSent** - Відправка тестового завдання
5. **taskCompleted** - Завершення завдання
6. **deadlineWarning** - Попередження про дедлайн
7. **deadlineToday** - Останній день дедлайну

### Логування
- Налаштовуваний рівень логування (debug, info, warn, error)
- Логування змін конфігурації
- Логування спроб відправки повідомлень

## Використання

### 1. Налаштування через файл конфігурації

```javascript
// server/config/webhook.config.js
module.exports = {
  enabled: true,  // Глобальний тогл
  webhookUrl: process.env.DISCORD_WEBHOOK_URL || 'https://discord.com/api/webhooks/...',
  notifications: {
    userStarted: true,
    userReady: true,
    contactProvided: true,
    taskSent: true,
    taskCompleted: true,
    deadlineWarning: false,  // Вимкнено
    deadlineToday: true
  }
};
```

### 2. Управління через API

```bash
# Вимкнути webhook
curl -X POST http://localhost:3000/api/webhook/toggle \
  -H "Content-Type: application/json" \
  -d '{"enabled": false}'

# Вимкнути конкретний тип повідомлень
curl -X POST http://localhost:3000/api/webhook/notification \
  -H "Content-Type: application/json" \
  -d '{"type": "userStarted", "enabled": false}'
```

### 3. Програмне управління

```javascript
// Отримання статусу
const status = await webhookService.getStatus();

// Вимкнення webhook
webhookService.setEnabled(false);

// Вимкнення конкретного типу
webhookService.setNotificationEnabled('userStarted', false);
```

## Переваги реалізації

### 1. Гнучкість
- Глобальний та індивідуальний контроль
- Зміни в реальному часі без перезапуску
- Підтримка змінних середовища

### 2. Надійність
- Webhook помилки не впливають на роботу бота
- Graceful fallback при вимкненому webhook
- Детальне логування

### 3. Зручність
- Простий API для управління
- Документовані приклади використання
- Тестові скрипти

## Файли

### Нові файли:
- `server/config/webhook.config.js` - Конфігурація webhook
- `server/config/README.md` - Документація конфігурації
- `server/docs/WEBHOOK_API_EXAMPLES.md` - Приклади використання API
- `server/scripts/test-webhook-api.js` - Тестовий скрипт
- `server/scripts/demo-webhook-toggle.js` - Демонстраційний скрипт

### Модифіковані файли:
- `server/bot/services/WebhookService.js` - Додано підтримку тоглу
- `server/server.js` - Додано API ендпоінти
- `server/env.example` - Додано змінну DISCORD_WEBHOOK_URL

## Тестування

### 1. Автоматичне тестування
```bash
node server/scripts/test-webhook-api.js
```

### 2. Демонстрація
```bash
node server/scripts/demo-webhook-toggle.js
```

### 3. Ручне тестування
```bash
# Перевірка статусу
curl http://localhost:3000/api/webhook/status

# Вимкнення webhook
curl -X POST http://localhost:3000/api/webhook/toggle \
  -H "Content-Type: application/json" \
  -d '{"enabled": false}'
```

## Безпека

- Валідація вхідних параметрів
- Обробка помилок
- Логування підозрілих дій
- Захист від некоректних конфігурацій

## Майбутні покращення

1. Збереження конфігурації в базі даних
2. Веб-інтерфейс для управління
3. Аудит логів змін конфігурації
4. Підтримка множинних webhook URL
5. Шаблони конфігурацій
