# API Reference - SkillKlan Telegram Bot

## 📋 Зміст

1. [WebhookService API](#webhookservice-api)
2. [ReminderService API](#reminderservice-api)
3. [UserStateService API](#userstateservice-api)
4. [ContactService API](#contactservice-api)
5. [TaskService API](#taskservice-api)
6. [DatabaseService API](#databaseservice-api)
7. [Discord Webhook Format](#discord-webhook-format)

## 🔗 WebhookService API

### Конструктор
```javascript
const webhookService = new WebhookService();
```

### Методи

#### `sendMessage(embed)`
Відправляє повідомлення в Discord через webhook.

**Параметри:**
- `embed` (Object) - Discord embed об'єкт

**Повертає:** `Promise<boolean>`

**Приклад:**
```javascript
const embed = {
  title: 'Тестове повідомлення',
  color: 0x3498db,
  fields: [...]
};
await webhookService.sendMessage(embed);
```

#### `notifyUserStarted(userData)`
Відправляє повідомлення про початок взаємодії з ботом.

**Параметри:**
- `userData` (Object) - Дані користувача
  - `telegramId` (string) - Telegram ID
  - `username` (string) - Username
  - `firstName` (string) - Ім'я
  - `lastName` (string) - Прізвище

**Повертає:** `Promise<boolean>`

#### `notifyUserReady(userData)`
Відправляє повідомлення про готовність користувача спробувати (кнопка "Так хочу спробувати").

**Параметри:**
- `userData` (Object) - Дані користувача
  - `telegramId` (string) - Telegram ID
  - `username` (string) - Username
  - `firstName` (string) - Ім'я
  - `lastName` (string) - Прізвище
  - `selectedProfession` (string) - Вибрана професія (QA/BA)

**Повертає:** `Promise<boolean>`

#### `notifyContactProvided(userData, contactData)`
Відправляє повідомлення про надання контакту.

**Параметри:**
- `userData` (Object) - Дані користувача
- `contactData` (Object) - Контактні дані
  - `phoneNumber` (string) - Номер телефону
  - `firstName` (string) - Ім'я
  - `lastName` (string) - Прізвище

**Повертає:** `Promise<boolean>`

#### `notifyTaskSent(userData, taskData)`
Відправляє повідомлення про відправку завдання.

**Параметри:**
- `userData` (Object) - Дані користувача з `taskSentAt` та `taskDeadline`
- `taskData` (Object) - Дані завдання
  - `profession` (string) - Професія
  - `title` (string) - Назва завдання
  - `deadline` (string) - Термін виконання

**Повертає:** `Promise<boolean>`

#### `notifyTaskCompleted(userData)`
Відправляє повідомлення про завершення завдання з розрахунком часу виконання.

**Параметри:**
- `userData` (Object) - Дані користувача з `taskSentAt`

**Повертає:** `Promise<boolean>`

#### `notifyDeadlineWarning(userData)`
Відправляє повідомлення про попередження дедлайну (7-й день).

**Параметри:**
- `userData` (Object) - Дані користувача

**Повертає:** `Promise<boolean>`

#### `notifyDeadlineToday(userData)`
Відправляє критичне повідомлення про останній день дедлайну.

**Параметри:**
- `userData` (Object) - Дані користувача

**Повертає:** `Promise<boolean>`

### Кольори
```javascript
this.colors = {
  info: 0x3498db,      // Синій - інформаційні повідомлення
  success: 0x2ecc71,   // Зелений - успішні дії
  warning: 0xf39c12,   // Помаранчевий - попередження
  danger: 0xe74c3c,    // Червоний - критичні події
  primary: 0x9b59b6    // Фіолетовий - основні події
};
```

## ⏰ ReminderService API

### Конструктор
```javascript
const reminderService = new ReminderService(databaseService, bot, webhookService);
```

**Параметри:**
- `databaseService` (DatabaseService) - Сервіс БД
- `bot` (Telegraf) - Екземпляр бота
- `webhookService` (WebhookService) - Сервіс webhook (опціонально)

### Методи

#### `startReminderCron()`
Запускає cron job для автоматичної перевірки нагадувань.

**Повертає:** `void`

**Cron розклад:** `0 10 * * 1-5` (щодня о 12:00 за Києвом, з понеділка по п'ятницю)

#### `checkAndSendReminders()`
Перевіряє та відправляє нагадування користувачам.

**Повертає:** `Promise<void>`

#### `sendReminder(telegramId, reminderType)`
Відправляє нагадування конкретному користувачу.

**Параметри:**
- `telegramId` (string) - Telegram ID користувача
- `reminderType` (string) - Тип нагадування (`day_3`, `day_7`, `day_9`)

**Повертає:** `Promise<boolean>`

#### `getReminderMessage(reminderType)`
Отримує текст нагадування за типом.

**Параметри:**
- `reminderType` (string) - Тип нагадування

**Повертає:** `string`

#### `updateUserReminders(telegramId, reminderType)`
Оновлює список відправлених нагадувань для користувача.

**Параметри:**
- `telegramId` (string) - Telegram ID користувача
- `reminderType` (string) - Тип нагадування

**Повертає:** `Promise<boolean>`

### Типи нагадувань
```javascript
this.reminderTypes = {
  DAY_3: 'day_3',  // 3-й день - мотиваційне
  DAY_7: 'day_7',  // 7-й день - попередження
  DAY_9: 'day_9'   // 9-й день - критичне
};
```

## 👤 UserStateService API

### Конструктор
```javascript
const userStateService = new UserStateService(databaseService);
```

### Методи

#### `getState(telegramId)`
Отримує поточний стан користувача.

**Параметри:**
- `telegramId` (string) - Telegram ID

**Повертає:** `Promise<UserState>`

#### `updateState(telegramId, updates)`
Оновлює стан користувача.

**Параметри:**
- `telegramId` (string) - Telegram ID
- `updates` (Object) - Об'єкт з оновленнями

**Повертає:** `Promise<UserState>`

#### `setContactData(telegramId, contactData)`
Встановлює контактні дані користувача.

**Параметри:**
- `telegramId` (string) - Telegram ID
- `contactData` (Object) - Контактні дані

**Повертає:** `Promise<UserState>`

#### `markTaskSent(telegramId)`
Позначає завдання як відправлене та встановлює дедлайн.

**Параметри:**
- `telegramId` (string) - Telegram ID

**Повертає:** `Promise<UserState>`

#### `calculateDeadline(sentDate)`
Розраховує дедлайн (9 робочих днів).

**Параметри:**
- `sentDate` (Date) - Дата відправки

**Повертає:** `Date`

## 📞 ContactService API

### Конструктор
```javascript
const contactService = new ContactService(databaseService);
```

### Методи

#### `saveContact(telegramId, contact)`
Зберігає контакт користувача.

**Параметри:**
- `telegramId` (string) - Telegram ID
- `contact` (Object) - Telegram contact об'єкт

**Повертає:** `Promise<ContactData>`

#### `getContactByUserId(userId)`
Отримує контакт за ID користувача.

**Параметри:**
- `userId` (string) - ID користувача

**Повертає:** `Promise<ContactData|null>`

#### `maskPhoneNumber(phoneNumber)`
Маскує номер телефону для логів.

**Параметри:**
- `phoneNumber` (string) - Номер телефону

**Повертає:** `string`

## 📋 TaskService API

### Конструктор
```javascript
const taskService = new TaskService(databaseService);
```

### Методи

#### `getTaskInfo(profession)`
Отримує інформацію про завдання для професії.

**Параметри:**
- `profession` (string) - Професія (`QA` або `BA`)

**Повертає:** `Object|null`

#### `getTaskFilePath(profession)`
Отримує шлях до PDF файлу завдання.

**Параметри:**
- `profession` (string) - Професія

**Повертає:** `string`

#### `taskFileExists(profession)`
Перевіряє існування PDF файлу.

**Параметри:**
- `profession` (string) - Професія

**Повертає:** `Promise<boolean>`

## 🗄️ DatabaseService API

### Конструктор
```javascript
const databaseService = new DatabaseService();
```

### Методи

#### `getUserByTelegramId(telegramId)`
Отримує користувача за Telegram ID.

**Параметри:**
- `telegramId` (string) - Telegram ID

**Повертає:** `Promise<Object|null>`

#### `getUserState(telegramId)`
Отримує стан користувача.

**Параметри:**
- `telegramId` (string) - Telegram ID

**Повертає:** `Promise<UserState|null>`

#### `saveUserState(userState)`
Зберігає стан користувача.

**Параметри:**
- `userState` (UserState) - Стан користувача

**Повертає:** `Promise<Object>`

#### `saveContact(userId, contactData)`
Зберігає контакт користувача.

**Параметри:**
- `userId` (string) - ID користувача
- `contactData` (Object) - Контактні дані

**Повертає:** `Promise<Object>`

#### `getUsersWithTasks()`
Отримує користувачів з відправленими завданнями.

**Повертає:** `Promise<Array>`

## 🔗 Discord Webhook Format

### Базовий формат
```javascript
{
  "embeds": [{
    "title": "Заголовок повідомлення",
    "color": 3447003, // HEX колір
    "fields": [
      {
        "name": "Назва поля",
        "value": "Значення поля",
        "inline": true
      }
    ],
    "footer": {
      "text": "Підпис"
    },
    "timestamp": "2025-09-03T21:01:25.166Z"
  }]
}
```

### Discord Timestamp форматування
```javascript
// Повна дата та час
"<t:1756933285:F>"

// Відносний час
"<t:1756933285:R>"

// Тільки дата
"<t:1756933285:D>"

// Тільки час
"<t:1756933285:T>"
```

### Приклад повного webhook
```javascript
{
  "embeds": [{
    "title": "✅ Користувач завершив тестове завдання",
    "color": 3066993, // Зелений
    "fields": [
      {
        "name": "👤 Користувач",
        "value": "**Ім'я:** Roman\n**Username:** @Num1221\n**Telegram ID:** `316149980`",
        "inline": true
      },
      {
        "name": "🎯 Завдання",
        "value": "**Напрямок:** QA Engineer\n**Телефон:** `380671607348`",
        "inline": true
      },
      {
        "name": "⏰ Час виконання",
        "value": "**Завершено:** <t:1756933285:F>\n**Виконано за:** 2 дн. 5 год.",
        "inline": true
      }
    ],
    "footer": {
      "text": "SkillKlan Onboarding Bot • Готово до перевірки"
    },
    "timestamp": "2025-09-03T21:01:25.166Z"
  }]
}
```

## 🚨 Обробка помилок

### WebhookService
- Всі методи повертають `boolean`
- Помилки логуються, але не зупиняють роботу бота
- Таймаут 10 секунд для HTTP запитів

### ReminderService
- Cron job працює незалежно від помилок
- Помилки відправки нагадувань логуються
- Webhook помилки не впливають на нагадування

### DatabaseService
- Всі методи мають try-catch обробку
- Повертають `null` або порожні масиви при помилках
- Детальне логування помилок

## 📊 Логування

### Формати логів
```javascript
// Успішні операції
console.log('✅ ServiceName: Операція виконана успішно');

// Помилки
console.error('❌ ServiceName: Помилка операції:', error);

// Детальне логування
console.log('🔍🔍🔍 ServiceName: Детальна інформація:', data);
```

### Webhook логи
```javascript
// Відправка
console.log('🔍🔍🔍 WebhookService.sendMessage: відправляємо в Discord:', payload);

// Успіх
console.log('✅ WebhookService.sendMessage: повідомлення відправлено в Discord, статус:', status);

// Помилка
console.error('❌ WebhookService.sendMessage: помилка відправки в Discord:', error);
```