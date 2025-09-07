# Архітектура SkillKlan Telegram Bot

## 📋 Зміст

1. [Загальна архітектура](#загальна-архітектура)
2. [Компоненти системи](#компоненти-системи)
3. [Потік даних](#потік-даних)
4. [Інтеграції](#інтеграції)
5. [Безпека](#безпека)
6. [Масштабування](#масштабування)

## 🏗️ Загальна архітектура

### Високорівнева схема
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

### Архітектурні принципи
- **Модульність:** Кожен компонент має чітку відповідальність
- **Розділення відповідальностей:** Handlers, Services, Database
- **Без кешування:** Кожен запит йде безпосередньо в БД
- **Обробка помилок:** Graceful degradation
- **Логування:** Детальне логування всіх операцій

## 🧩 Компоненти системи

### 1. Bot Core (`bot/bot.js`)
**Відповідальність:** Основний клас бота, координація компонентів

```javascript
class SkillKlanBot {
  constructor() {
    this.bot = new Telegraf(process.env.TELEGRAM_BOT_TOKEN);
    this.databaseService = new DatabaseService();
    this.userStateService = new UserStateService(this.databaseService);
    this.contactService = new ContactService(this.databaseService);
    this.taskService = new TaskService(this.databaseService);
    this.webhookService = new WebhookService();
    this.reminderService = new ReminderService(this.databaseService, this.bot, this.webhookService);
  }
}
```

**Функції:**
- Ініціалізація всіх сервісів
- Налаштування middleware
- Реєстрація обробників
- Запуск cron jobs

### 2. Handlers (`bot/handlers/`)
**Відповідальність:** Обробка команд та дій користувачів

#### Ієрархія обробників
```
BaseHandler (абстрактний)
├── StartHandler
├── ProfessionHandler
├── ReadyToTryHandler
├── ContactHandler
├── TaskHandler
├── TaskSubmissionHandler
├── RestartHandler
└── UnknownHandler
```

#### Паттерн обробки
```javascript
class BaseHandler {
  async handle(ctx, userState) {
    // 1. Логування
    this.logRequest(ctx, userState);
    
    // 2. Валідація стану
    if (!this.validateState(userState)) {
      await this.handleInvalidState(ctx, userState);
      return;
    }
    
    // 3. Виконання логіки
    await this.execute(ctx, userState);
    
    // 4. Оновлення стану
    await this.updateUserState(ctx, userState);
  }
}
```

### 3. Services (`bot/services/`)
**Відповідальність:** Бізнес-логіка та інтеграції

#### UserStateService
- Управління станом користувача
- Без кешування (кожен запит в БД)
- Валідація та трансформація даних

#### ContactService
- Валідація контактних даних
- Збереження в БД
- Маскування для логів

#### TaskService
- Робота з PDF файлами
- Генерація завдань
- Валідація існування файлів

#### ReminderService
- Планування нагадувань
- Cron job управління
- Інтеграція з webhook

#### WebhookService
- Відправка повідомлень в Discord
- Форматування embed повідомлень
- Обробка помилок HTTP

### 4. Database Layer (`shared/database/`)
**Відповідальність:** Абстракція роботи з БД

```javascript
class DatabaseService {
  constructor() {
    this.pool = new Pool({
      host: process.env.DB_HOST,
      port: process.env.DB_PORT,
      database: process.env.DB_NAME,
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
    });
  }
}
```

**Функції:**
- Підключення до PostgreSQL
- Виконання SQL запитів
- Транзакції
- Обробка помилок БД

### 5. Templates (`bot/templates/`)
**Відповідальність:** Управління текстами та клавіатурами

#### MessageTemplates
- Централізоване управління текстами
- Підтримка локалізації
- Динамічне формування повідомлень

#### KeyboardTemplates
- Генерація inline клавіатур
- Кнопки з callback даними
- WebApp інтеграція

## 🔄 Потік даних

### 1. Початок взаємодії
```
User → /start → StartHandler → UserStateService → DatabaseService → PostgreSQL
                                    ↓
                              WebhookService → Discord
```

### 2. Вибір професії
```
User → profession_QA → ProfessionHandler → UserStateService → DatabaseService → PostgreSQL
```

### 3. Надання контакту
```
User → Contact → ContactHandler → ContactService → DatabaseService → PostgreSQL
                                      ↓
                                WebhookService → Discord
```

### 4. Відправка завдання
```
User → "Готовий" → TaskHandler → TaskService → PDF File
                              ↓
                        UserStateService → DatabaseService → PostgreSQL
                              ↓
                        WebhookService → Discord
```

### 5. Завершення завдання
```
User → "Здати" → TaskSubmissionHandler → WebhookService → Discord
```

### 6. Нагадування
```
Cron Job → ReminderService → Bot → User
                    ↓
              WebhookService → Discord
```

## 🔗 Інтеграції

### 1. Telegram Bot API
**Бібліотека:** Telegraf 4.15.0
**Функції:**
- Обробка команд та callback'ів
- Відправка повідомлень та файлів
- Робота з клавіатурами
- WebApp інтеграція

### 2. PostgreSQL
**Бібліотека:** pg 8.11.0
**Функції:**
- Збереження стану користувачів
- Контактні дані
- Історія дій
- Нагадування

### 3. Discord Webhook
**Бібліотека:** axios 1.6.0
**Функції:**
- Відправка embed повідомлень
- Кольорове кодування
- Timestamp форматування
- Обробка помилок

### 4. Cron Jobs
**Бібліотека:** node-cron 3.0.3
**Функції:**
- Планування нагадувань
- Автоматична перевірка дедлайнів
- Timezone підтримка

## 🔒 Безпека

### 1. Валідація даних
```javascript
// Валідація телефонних номерів
const cleanPhone = phone.replace(/[^\d]/g, '');
if (cleanPhone.length !== 10 || !cleanPhone.startsWith('0')) {
  throw new Error('Невірний формат номера телефону');
}

// Валідація професій
if (!['qa', 'ba'].includes(profession)) {
  throw new Error('Невірна професія');
}
```

### 2. SQL Injection Protection
```javascript
// Використання параметризованих запитів
const query = 'SELECT * FROM bot_users WHERE telegram_id = $1';
const result = await this.pool.query(query, [telegramId]);
```

### 3. Error Handling
```javascript
try {
  await this.webhookService.sendMessage(embed);
} catch (webhookError) {
  console.error('❌ Webhook помилка:', webhookError);
  // Не зупиняємо роботу бота
}
```

### 4. Environment Variables
```javascript
// Чутливі дані в .env
TELEGRAM_BOT_TOKEN=your_bot_token
DB_PASSWORD=your_password
```

## 📈 Масштабування

### 1. Горизонтальне масштабування
- **Load Balancer:** Nginx для розподілу навантаження
- **Multiple Instances:** Кілька екземплярів бота
- **Database Replication:** Master-Slave конфігурація

### 2. Вертикальне масштабування
- **Connection Pooling:** pg Pool для оптимізації з'єднань
- **Memory Management:** Обмеження розміру кешу
- **CPU Optimization:** Асинхронні операції

### 3. Моніторинг
```javascript
// Health check endpoint
app.get("/api/health", (req, res) => {
  res.json({ 
    status: "ok", 
    timestamp: new Date().toISOString(),
    uptime: process.uptime()
  });
});
```

### 4. Логування
```javascript
// Структуроване логування
console.log('🔍🔍🔍 ServiceName: Операція:', {
  userId: telegramId,
  action: 'task_sent',
  timestamp: new Date().toISOString()
});
```

## 🚀 Deployment Architecture

### Docker Compose
```yaml
version: '3.8'
services:
  bot:
    build: ./server
    environment:
      - DB_HOST=postgres
      - DB_PASSWORD=${DB_PASSWORD}
    depends_on:
      - postgres
  
  postgres:
    image: postgres:13
    environment:
      - POSTGRES_DB=skillklan_db
      - POSTGRES_USER=skillklan_user
      - POSTGRES_PASSWORD=${DB_PASSWORD}
    volumes:
      - postgres_data:/var/lib/postgresql/data
  
  nginx:
    image: nginx:alpine
    ports:
      - "80:80"
      - "443:443"
    volumes:
      - ./docker/nginx/conf.d:/etc/nginx/conf.d
```

### Production Considerations
1. **SSL/TLS:** HTTPS для webhook
2. **Backup:** Автоматичне резервне копіювання БД
3. **Monitoring:** Prometheus + Grafana
4. **Logging:** ELK Stack або аналог
5. **CI/CD:** GitHub Actions для автоматичного деплою

## 📊 Performance Metrics

### Ключові показники
- **Response Time:** < 200ms для більшості операцій
- **Database Queries:** Оптимізовані з індексами
- **Memory Usage:** < 100MB на екземпляр
- **Uptime:** 99.9% доступність

### Оптимізації
- **Connection Pooling:** Перевикористання з'єднань БД
- **Async/Await:** Неблокуючі операції
- **Error Recovery:** Graceful degradation
- **Resource Cleanup:** Автоматичне звільнення ресурсів

## 🔄 Data Flow Patterns

### 1. Request-Response Pattern
```
User Request → Handler → Service → Database → Response
```

### 2. Event-Driven Pattern
```
User Action → Handler → Webhook → Discord Notification
```

### 3. Scheduled Pattern
```
Cron Job → ReminderService → User Notification + Webhook
```

### 4. State Machine Pattern
```
User State → Validation → Transition → New State
```

## 🎯 Future Architecture Considerations

### 1. Microservices
- Розділення на окремі сервіси
- API Gateway для маршрутизації
- Service Discovery

### 2. Event Sourcing
- Збереження всіх подій
- Відновлення стану з подій
- Аудит та аналітика

### 3. CQRS
- Розділення команд та запитів
- Оптимізація для читання/запису
- Eventual consistency

### 4. Message Queues
- Асинхронна обробка
- Retry механізми
- Dead letter queues