# 🌐 REST API

## Огляд

REST API забезпечує HTTP інтерфейс для взаємодії з системою онбордингу. API підтримує роботу з користувачами, завданнями, webhook налаштуваннями та статистикою.

## Базовий URL

```
http://localhost:3001/api
```

## Аутентифікація

Наразі API не вимагає аутентифікації, але рекомендується додати її для продакшн використання.

## Ендпоінти

### Health Check

#### GET /api/health
Перевірка стану сервера

**Запит:**
```bash
curl http://localhost:3001/api/health
```

**Відповідь:**
```json
{
  "status": "ok",
  "timestamp": "2025-09-08T12:00:00.000Z"
}
```

### Користувачі

#### GET /api/check-user/:telegramId
Перевірка існування користувача

**Параметри:**
- `telegramId` - Telegram ID користувача

**Запит:**
```bash
curl http://localhost:3001/api/check-user/316149980
```

**Відповідь (користувач існує):**
```json
{
  "exists": true,
  "user": {
    "id": 1,
    "name": "Roman",
    "phone": "+380501234567",
    "email": "roman@example.com"
  }
}
```

**Відповідь (користувач не існує):**
```json
{
  "exists": false,
  "user": null
}
```

#### POST /api/test-task-request
Створення заявки на тестове завдання

**Тіло запиту:**
```json
{
  "name": "Roman",
  "phone": "+380501234567",
  "email": "roman@example.com",
  "profession": "qa",
  "telegram_id": "316149980",
  "contact_source": "telegram"
}
```

**Параметри:**
- `name` (обов'язково) - ім'я користувача
- `phone` (обов'язково) - номер телефону
- `email` (опціонально) - email адреса
- `profession` (обов'язково) - професія ("qa" або "ba")
- `telegram_id` (опціонально) - Telegram ID
- `contact_source` (опціонально) - джерело контактів ("telegram" або "manual")

**Запит:**
```bash
curl -X POST http://localhost:3001/api/test-task-request \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Roman",
    "phone": "+380501234567",
    "email": "roman@example.com",
    "profession": "qa",
    "telegram_id": "316149980",
    "contact_source": "telegram"
  }'
```

**Відповідь (успіх):**
```json
{
  "success": true,
  "message": "Заявку на тестове завдання збережено успішно",
  "user_id": 1,
  "contact_source": "telegram"
}
```

**Відповідь (помилка):**
```json
{
  "error": "Необхідно заповнити ім'я, телефон та професію"
}
```

#### POST /api/update-test-task-status
Оновлення статусу тестового завдання

**Тіло запиту:**
```json
{
  "telegram_id": "316149980",
  "profession": "qa",
  "status": "sent"
}
```

**Параметри:**
- `telegram_id` (обов'язково) - Telegram ID користувача
- `profession` (обов'язково) - професія
- `status` (обов'язково) - новий статус

**Запит:**
```bash
curl -X POST http://localhost:3001/api/update-test-task-status \
  -H "Content-Type: application/json" \
  -d '{
    "telegram_id": "316149980",
    "profession": "qa",
    "status": "sent"
  }'
```

**Відповідь:**
```json
{
  "success": true,
  "message": "Статус оновлено"
}
```

### Адміністративні ендпоінти

#### GET /api/admin/stats
Отримання статистики

**Запит:**
```bash
curl http://localhost:3001/api/admin/stats
```

**Відповідь:**
```json
{
  "success": true,
  "stats": [
    {
      "profession": "qa",
      "status": "pending",
      "count": "5"
    },
    {
      "profession": "ba",
      "status": "sent",
      "count": "3"
    }
  ]
}
```

#### GET /api/admin/requests
Отримання всіх заявок

**Запит:**
```bash
curl http://localhost:3001/api/admin/requests
```

**Відповідь:**
```json
{
  "success": true,
  "requests": [
    {
      "id": 1,
      "profession": "qa",
      "status": "pending",
      "created_at": "2025-09-08T10:00:00.000Z",
      "name": "Roman",
      "phone": "+380501234567",
      "email": "roman@example.com",
      "telegram_id": "316149980"
    }
  ]
}
```

### Webhook Management

#### GET /api/webhook/status
Отримання статусу webhook

**Запит:**
```bash
curl http://localhost:3001/api/webhook/status
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

#### POST /api/webhook/toggle
Увімкнення/вимкнення webhook

**Тіло запиту:**
```json
{
  "enabled": true
}
```

**Запит:**
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

#### POST /api/webhook/notification
Управління конкретними типами повідомлень

**Тіло запиту:**
```json
{
  "type": "userStarted",
  "enabled": false
}
```

**Запит:**
```bash
curl -X POST http://localhost:3001/api/webhook/notification \
  -H "Content-Type: application/json" \
  -d '{
    "type": "userStarted",
    "enabled": false
  }'
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

#### POST /api/webhook/config
Оновлення повної конфігурації webhook

**Тіло запиту:**
```json
{
  "config": {
    "enabled": true,
    "notifications": {
      "userStarted": true,
      "userReady": false,
      "contactProvided": true,
      "taskSent": true,
      "taskCompleted": true,
      "deadlineWarning": true,
      "deadlineToday": true
    }
  }
}
```

**Запит:**
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

**Відповідь:**
```json
{
  "success": true,
  "message": "Конфігурація webhook оновлена",
  "config": {
    "enabled": true,
    "notifications": {
      "userStarted": true,
      "userReady": false
    }
  }
}
```

## Коди відповідей

### Успішні відповіді
- **200 OK** - успішний запит
- **201 Created** - ресурс створено

### Помилки клієнта
- **400 Bad Request** - невірні параметри запиту
- **404 Not Found** - ресурс не знайдено
- **422 Unprocessable Entity** - помилка валідації

### Помилки сервера
- **500 Internal Server Error** - внутрішня помилка сервера
- **503 Service Unavailable** - сервіс недоступний

## Валідація даних

### Телефонні номери
- Формат: українські номери (10 цифр, починається з 0)
- Приклад: `0501234567`

### Email адреси
- Стандартний формат email
- Опціональний параметр

### Професії
- `qa` - QA Engineer
- `ba` - Business Analyst

### Джерела контактів
- `telegram` - з Telegram бота
- `manual` - введено вручну

## Приклади використання

### Повний цикл створення заявки
```bash
# 1. Перевірка користувача
curl http://localhost:3001/api/check-user/316149980

# 2. Створення заявки
curl -X POST http://localhost:3001/api/test-task-request \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Roman",
    "phone": "+380501234567",
    "profession": "qa",
    "telegram_id": "316149980"
  }'

# 3. Оновлення статусу
curl -X POST http://localhost:3001/api/update-test-task-status \
  -H "Content-Type: application/json" \
  -d '{
    "telegram_id": "316149980",
    "profession": "qa",
    "status": "sent"
  }'
```

### Управління webhook
```bash
# 1. Перевірка статусу
curl http://localhost:3001/api/webhook/status

# 2. Увімкнення webhook
curl -X POST http://localhost:3001/api/webhook/toggle \
  -H "Content-Type: application/json" \
  -d '{"enabled": true}'

# 3. Вимкнення конкретного типу повідомлень
curl -X POST http://localhost:3001/api/webhook/notification \
  -H "Content-Type: application/json" \
  -d '{"type": "userStarted", "enabled": false}'
```

### Отримання статистики
```bash
# Загальна статистика
curl http://localhost:3001/api/admin/stats

# Всі заявки
curl http://localhost:3001/api/admin/requests
```

## Моніторинг

### Health Check
```bash
# Перевірка стану сервера
curl http://localhost:3001/api/health
```

### Логування
```bash
# Логи сервера
docker logs skillklan-server

# Фільтрація API запитів
docker logs skillklan-server | grep "POST\|GET"
```

## Безпека

### Рекомендації
1. **Додайте аутентифікацію** для продакшн використання
2. **Обмежте доступ** до адміністративних ендпоінтів
3. **Валідуйте всі вхідні дані**
4. **Використовуйте HTTPS** для захисту трафіку
5. **Моніторьте використання API**

### Rate Limiting
Рекомендується додати обмеження швидкості:
- 100 запитів на хвилину на IP
- 1000 запитів на годину на IP
- Блокування при перевищенні лімітів
