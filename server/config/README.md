# Webhook Configuration

Ця директорія містить конфігураційні файли для webhook функціональності.

## Файли

### `webhook.config.js`

Основний конфігураційний файл для Discord webhook інтеграції.

#### Основні налаштування:

- `enabled` - Глобальний тогл для увімкнення/вимкнення webhook
- `webhookUrl` - URL Discord webhook (може бути перевизначено через змінну середовища `DISCORD_WEBHOOK_URL`)
- `timeout` - Таймаут для webhook запитів (в мілісекундах)
- `colors` - Кольори для різних типів повідомлень
- `notifications` - Налаштування для кожного типу повідомлень
- `logging` - Налаштування логування

#### Приклад конфігурації:

```javascript
module.exports = {
  enabled: true,
  webhookUrl: process.env.DISCORD_WEBHOOK_URL || 'https://discord.com/api/webhooks/...',
  timeout: 10000,
  colors: {
    info: 0x3498db,
    success: 0x2ecc71,
    warning: 0xf39c12,
    danger: 0xe74c3c,
    primary: 0x9b59b6
  },
  notifications: {
    userStarted: true,
    userReady: true,
    contactProvided: true,
    taskSent: true,
    taskCompleted: true,
    deadlineWarning: true,
    deadlineToday: true
  },
  logging: {
    enabled: true,
    logLevel: 'info'
  }
};
```

## Типи повідомлень

1. **userStarted** - Початок взаємодії користувача з ботом
2. **userReady** - Користувач готовий спробувати тестове завдання
3. **contactProvided** - Користувач надав контактні дані
4. **taskSent** - Тестове завдання відправлено користувачу
5. **taskCompleted** - Користувач завершив тестове завдання
6. **deadlineWarning** - Попередження про наближення дедлайну
7. **deadlineToday** - Останній день дедлайну

## Управління через API

Конфігурація може бути змінена в реальному часі через REST API:

- `GET /api/webhook/status` - Отримання поточного статусу
- `POST /api/webhook/toggle` - Увімкнення/вимкнення webhook
- `POST /api/webhook/notification` - Управління конкретними типами повідомлень
- `POST /api/webhook/config` - Оновлення повної конфігурації

## Змінні середовища

- `DISCORD_WEBHOOK_URL` - URL Discord webhook (опціонально)

## Примітки

- Зміни конфігурації через API зберігаються тільки в пам'яті
- При перезапуску сервера конфігурація повертається до значень з файлу
- Для постійного збереження змін модифікуйте файл `webhook.config.js`
