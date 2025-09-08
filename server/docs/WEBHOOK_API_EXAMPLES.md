# Webhook Management API - Приклади використання

## Огляд

Цей документ містить приклади використання API для управління webhook налаштуваннями.

## Базовий URL

```
http://localhost:3000/api/webhook
```

## Ендпоінти

### 1. Отримання статусу webhook

**GET** `/api/webhook/status`

```bash
curl -X GET http://localhost:3000/api/webhook/status
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

### 2. Увімкнення/вимкнення webhook

**POST** `/api/webhook/toggle`

```bash
# Вимкнути webhook
curl -X POST http://localhost:3000/api/webhook/toggle \
  -H "Content-Type: application/json" \
  -d '{"enabled": false}'

# Увімкнути webhook
curl -X POST http://localhost:3000/api/webhook/toggle \
  -H "Content-Type: application/json" \
  -d '{"enabled": true}'
```

**Відповідь:**
```json
{
  "success": true,
  "message": "Webhook вимкнено",
  "enabled": false
}
```

### 3. Управління конкретними типами повідомлень

**POST** `/api/webhook/notification`

```bash
# Вимкнути повідомлення про початок взаємодії
curl -X POST http://localhost:3000/api/webhook/notification \
  -H "Content-Type: application/json" \
  -d '{"type": "userStarted", "enabled": false}'

# Увімкнути повідомлення про дедлайн
curl -X POST http://localhost:3000/api/webhook/notification \
  -H "Content-Type: application/json" \
  -d '{"type": "deadlineWarning", "enabled": true}'
```

**Доступні типи повідомлень:**
- `userStarted` - Початок взаємодії з ботом
- `userReady` - Готовність користувача спробувати
- `contactProvided` - Надання контактних даних
- `taskSent` - Відправка тестового завдання
- `taskCompleted` - Завершення завдання
- `deadlineWarning` - Попередження про дедлайн
- `deadlineToday` - Останній день дедлайну

**Відповідь:**
```json
{
  "success": true,
  "message": "Повідомлення userStarted вимкнено",
  "type": "userStarted",
  "enabled": false
}
```

### 4. Оновлення конфігурації webhook

**POST** `/api/webhook/config`

```bash
# Оновити конфігурацію
curl -X POST http://localhost:3000/api/webhook/config \
  -H "Content-Type: application/json" \
  -d '{
    "config": {
      "enabled": true,
      "notifications": {
        "userStarted": false,
        "userReady": true,
        "contactProvided": true,
        "taskSent": true,
        "taskCompleted": true,
        "deadlineWarning": false,
        "deadlineToday": true
      },
      "logging": {
        "enabled": true,
        "logLevel": "debug"
      }
    }
  }'
```

**Відповідь:**
```json
{
  "success": true,
  "message": "Конфігурація webhook оновлена",
  "config": {
    "enabled": true,
    "webhookUrl": "встановлено",
    "notifications": {
      "userStarted": false,
      "userReady": true,
      "contactProvided": true,
      "taskSent": true,
      "taskCompleted": true,
      "deadlineWarning": false,
      "deadlineToday": true
    },
    "logging": {
      "enabled": true,
      "logLevel": "debug"
    }
  }
}
```

## Приклади використання в JavaScript

```javascript
// Отримання статусу
async function getWebhookStatus() {
  const response = await fetch('http://localhost:3000/api/webhook/status');
  const data = await response.json();
  console.log('Webhook статус:', data.status);
}

// Вимкнення webhook
async function disableWebhook() {
  const response = await fetch('http://localhost:3000/api/webhook/toggle', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ enabled: false })
  });
  const data = await response.json();
  console.log('Результат:', data.message);
}

// Вимкнення конкретного типу повідомлень
async function disableUserStartedNotifications() {
  const response = await fetch('http://localhost:3000/api/webhook/notification', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ 
      type: 'userStarted', 
      enabled: false 
    })
  });
  const data = await response.json();
  console.log('Результат:', data.message);
}
```

## Приклади використання в Python

```python
import requests
import json

# Отримання статусу
def get_webhook_status():
    response = requests.get('http://localhost:3000/api/webhook/status')
    return response.json()

# Вимкнення webhook
def disable_webhook():
    response = requests.post(
        'http://localhost:3000/api/webhook/toggle',
        headers={'Content-Type': 'application/json'},
        data=json.dumps({'enabled': False})
    )
    return response.json()

# Вимкнення конкретного типу повідомлень
def disable_notification_type(notification_type):
    response = requests.post(
        'http://localhost:3000/api/webhook/notification',
        headers={'Content-Type': 'application/json'},
        data=json.dumps({
            'type': notification_type,
            'enabled': False
        })
    )
    return response.json()
```

## Коди помилок

- `400` - Невірні параметри запиту
- `503` - WebhookService не ініціалізовано
- `500` - Внутрішня помилка сервера

## Примітки

1. Всі зміни конфігурації застосовуються негайно
2. Конфігурація зберігається тільки в пам'яті (не зберігається в файлі)
3. При перезапуску сервера конфігурація повертається до значень з файлу `webhook.config.js`
4. Для постійного збереження змін модифікуйте файл `server/config/webhook.config.js`
