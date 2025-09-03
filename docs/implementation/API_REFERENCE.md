# API Reference - SkillKlan Bot

## 📋 Зміст

1. [Bot Commands](#bot-commands)
2. [Handlers](#handlers)
3. [Services](#services)
4. [Database Schema](#database-schema)
5. [Message Templates](#message-templates)
6. [Keyboard Templates](#keyboard-templates)
7. [Types](#types)

## 🤖 Bot Commands

### /start
**Призначення:** Початкове привітання та запуск онбордингу
**Обробник:** `StartHandler`
**Крок:** `start` → `profession_selection`

**Повідомлення:**
```
Привіт! 👋

Я бот SkillKlan — допоможу тобі знайти роботу мрії в IT.

Обери напрямок, який тебе цікавить:
```

**Клавіатура:** Вибір професії (QA/BA) + FAQ

### /help
**Призначення:** Допомога користувачу
**Обробник:** `UnknownHandler`
**Повідомлення:** Стандартне повідомлення про помилку

## 🎮 Handlers

### BaseHandler
**Базовий клас для всіх обробників**

#### Методи:
```javascript
async handle(ctx, userState)
async execute(ctx, userState)
validateState(userState)
getNextStep()
async updateUserState(ctx, userState)
async safeReply(ctx, message, keyboard)
async handleInvalidState(ctx, userState)
async handleError(ctx, error)
logRequest(ctx, userState)
```

#### Параметри:
- `ctx` - Telegraf контекст
- `userState` - Стан користувача

### StartHandler
**Обробник команди /start**

#### Валідація:
```javascript
validateState(userState) {
  return super.validateState(userState) && 
         userState.currentStep === BotStep.START;
}
```

#### Наступний крок:
```javascript
getNextStep() {
  return BotStep.PROFESSION_SELECTION;
}
```

### ProfessionHandler
**Обробник вибору професії**

#### Callback дані:
- `profession_QA` - Вибір QA
- `profession_BA` - Вибір BA

#### Валідація:
```javascript
validateState(userState) {
  return super.validateState(userState) && 
         userState.currentStep === BotStep.PROFESSION_SELECTION;
}
```

#### Наступний крок:
```javascript
getNextStep() {
  return null; // Не оновлюємо автоматично
}
```

### ReadyToTryHandler
**Обробник кнопки "Я готовий спробувати"**

#### Логіка:
1. Перевіряє наявність контакту
2. Якщо є → одразу відправляє завдання
3. Якщо немає → просить контакт

#### Валідація:
```javascript
validateState(userState) {
  return super.validateState(userState) && 
         userState.currentStep === BotStep.PROFESSION_SELECTION &&
         !!userState.selectedProfession;
}
```

### ContactHandler
**Обробник контактних даних**

#### Валідація:
```javascript
validateState(userState) {
  return super.validateState(userState) && 
         userState.currentStep === BotStep.CONTACT_REQUEST &&
         userState.selectedProfession;
}
```

#### Наступний крок:
```javascript
getNextStep() {
  return BotStep.TASK_DELIVERY;
}
```

### TaskHandler
**Обробник відправки PDF завдань**

#### Функції:
- Відправка відповідного PDF (QA/BA)
- Автоматична кнопка через 10 секунд

#### Валідація:
```javascript
validateState(userState) {
  return super.validateState(userState) && 
         userState.currentStep === BotStep.TASK_DELIVERY &&
         !!userState.selectedProfession;
}
```

### TaskSubmissionHandler
**Обробник здачі завдання**

#### Callback дані:
- `submit_task` - Готовність здати завдання

#### Валідація:
```javascript
validateState(userState) {
  return super.validateState(userState) && 
         userState.taskSent === true;
}
```

## 🔧 Services

### UserStateService
**Управління станом користувача**

#### Методи:
```javascript
async getState(telegramId)
async updateState(telegramId, updates)
async updateStep(telegramId, step)
async setProfession(telegramId, profession)
async setContactData(telegramId, contactData)
async markTaskSent(telegramId)
async resetState(telegramId)
async cleanupOldStates()
```

#### Особливості:
- Без кешування
- Кожен запит йде в БД
- Автоматичне оновлення `lastActivity`

### ContactService
**Робота з контактами**

#### Методи:
```javascript
validateContact(contact)
convertTelegramContact(telegramContact)
async saveContact(userId, contactData)
async getContactByUserId(userId)
async hasContact(userId)
formatPhoneNumber(phoneNumber)
maskPhoneNumber(phoneNumber)
```

#### Валідація контакту:
- Наявність номера телефону
- Наявність імені
- Формат номера телефону

### TaskService
**Робота з PDF завданнями**

#### Методи:
```javascript
getTaskFilePath(profession)
async taskFileExists(profession)
getTaskInfo(profession)
```

#### Підтримувані професії:
- `QA` - Тестове завдання для QA
- `BA` - Тестове завдання для BA

## 🗄️ Database Schema

### bot_users
**Основна таблиця користувачів**

```sql
CREATE TABLE bot_users (
  id SERIAL PRIMARY KEY,
  telegram_id VARCHAR(50) UNIQUE NOT NULL,
  username VARCHAR(100),
  current_step VARCHAR(50) DEFAULT 'start',
  selected_profession VARCHAR(20),
  contact_data JSONB,
  task_sent BOOLEAN DEFAULT FALSE,
  last_activity TIMESTAMP DEFAULT NOW(),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

#### Колонки:
- `id` - Унікальний ідентифікатор
- `telegram_id` - Telegram ID користувача
- `username` - Telegram username
- `current_step` - Поточний крок в онбордингу
- `selected_profession` - Вибрана професія (QA/BA)
- `contact_data` - Контактні дані (JSON)
- `task_sent` - Чи відправлено завдання
- `last_activity` - Остання активність
- `created_at` - Дата створення
- `updated_at` - Дата оновлення

### bot_contacts
**Контактні дані користувачів**

```sql
CREATE TABLE bot_contacts (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES bot_users(id),
  phone_number VARCHAR(20) NOT NULL,
  first_name VARCHAR(100) NOT NULL,
  last_name VARCHAR(100),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

#### Колонки:
- `id` - Унікальний ідентифікатор
- `user_id` - Посилання на bot_users
- `phone_number` - Номер телефону
- `first_name` - Ім'я
- `last_name` - Прізвище
- `created_at` - Дата створення
- `updated_at` - Дата оновлення

## 💬 Message Templates

### MessageTemplates
**Шаблони повідомлень**

#### Методи:
```javascript
static getWelcomeMessage()
static getProfessionSelectionMessage()
static getProfessionDescription(profession)
static getContactRequestMessage()
static getContactRequestRepeatMessage()
static getContactConfirmationMessage()
static getTaskDeliveryMessage()
static getTaskSubmissionPromptMessage()
static getTaskSubmissionMessage()
static getCompletionMessage()
static getErrorMessage()
static getFAQMessage()
static getRestartMessage()
```

#### Приклади повідомлень:

**Привітання:**
```
Привіт! 👋

Я бот SkillKlan — допоможу тобі знайти роботу мрії в IT.

Обери напрямок, який тебе цікавить:
```

**Запит контакту:**
```
Супер! 🎯

Щоб отримати тестове завдання, поділись своїм номером телефону.

Це потрібно для зв'язку з ментором, який перевірятиме твоє завдання.

Без цього кроку завдання не відкриється.
```

**Кнопка здачі завдання:**
```
Готовий здати тестове завдання? 📝

Натисни кнопку нижче, коли будеш готовий надіслати результат.
```

## ⌨️ Keyboard Templates

### KeyboardTemplates
**Шаблони клавіатур**

#### Методи:
```javascript
static getProfessionKeyboard()
static getReadyToTryKeyboard()
static getContactKeyboard()
static getTaskCompletionKeyboard()
static getMainMenuKeyboard()
static removeKeyboard()
```

#### Приклади клавіатур:

**Вибір професії:**
```javascript
[
  [
    { text: "1️⃣ QA (тестувальник)", callback_data: "profession_QA" },
    { text: "2️⃣ Business Analyst", callback_data: "profession_BA" }
  ],
  [
    { text: "📚 Дізнатися більше (FAQ)", callback_data: "show_faq" }
  ]
]
```

**Кнопка здачі завдання:**
```javascript
[
  [
    { text: "Я готовий здати тестове завдання", callback_data: "submit_task" }
  ]
]
```

## 📊 Types

### BotStep
**Кроки онбордингу**

```javascript
const BotStep = {
  START: 'start',
  PROFESSION_SELECTION: 'profession_selection',
  CONTACT_REQUEST: 'contact_request',
  TASK_DELIVERY: 'task_delivery',
  COMPLETED: 'completed'
};
```

### Profession
**Професії**

```javascript
const Profession = {
  QA: 'QA',
  BA: 'BA'
};
```

### UserState
**Стан користувача**

```javascript
class UserState {
  constructor(userId, telegramId, username) {
    this.userId = userId;
    this.telegramId = telegramId;
    this.username = username;
    this.currentStep = BotStep.START;
    this.selectedProfession = null;
    this.contactData = null;
    this.taskSent = false;
    this.lastActivity = new Date();
    this.createdAt = new Date();
  }
}
```

### ContactData
**Контактні дані**

```javascript
class ContactData {
  constructor(phoneNumber, firstName, lastName) {
    this.phoneNumber = phoneNumber;
    this.firstName = firstName;
    this.lastName = lastName;
    this.createdAt = new Date();
  }
}
```

## 🔄 Callback Data

### Список callback'ів:
- `profession_QA` - Вибір QA
- `profession_BA` - Вибір BA
- `ready_to_try` - Готовий спробувати
- `submit_task` - Здати завдання
- `show_faq` - Показати FAQ
- `restart` - Перезапустити

### Обробка callback'ів:
```javascript
// В bot.js
this.bot.action('profession_QA', async (ctx) => {
  const userState = await this.userStateService.getState(ctx.from.id);
  await professionHandler.handle(ctx, userState);
});
```

## 📁 File Structure

### PDF файли:
- `assets/tasks/qa-test-task.pdf` - Завдання для QA
- `assets/tasks/ba-test-task.pdf` - Завдання для BA

### Генерація PDF:
```bash
node generate-pdfs.js
```

### Вміст PDF:
- **QA:** Тестування веб-додатку, тест-кейси, баг-репорти (3 дні)
- **BA:** Аналіз бізнес-процесів, збір вимог, ТЗ (5 днів)

## 🔍 Logging

### Формат логів:
```
🔍🔍🔍 Component.method: ПОЧАТОК
🔍🔍🔍 Component.method: data = { ... }
🔍🔍🔍 Component.method: результат = { ... }
```

### Критичні операції:
- Всі handler'и
- Database операції
- Валідація стану
- Обробка помилок

### Файл логів:
- `server.log` - Основні логи
- `debug_logs.txt` - Додаткові логи (опціонально)
