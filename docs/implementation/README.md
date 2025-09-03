# SkillKlan Telegram Bot - Повна документація реалізації

## 📋 Зміст

1. [Загальний огляд](#загальний-огляд)
2. [Архітектура проекту](#архітектура-проекту)
3. [Залежності](#залежності)
4. [Структура файлів](#структура-файлів)
5. [База даних](#база-даних)
6. [Обробники команд](#обробники-команд)
7. [Сервіси](#сервіси)
8. [Шаблони повідомлень](#шаблони-повідомлень)
9. [Помилки та виправлення](#помилки-та-виправлення)
10. [Налаштування та запуск](#налаштування-та-запуск)
11. [Тестування](#тестування)

## 🎯 Загальний огляд

Telegram бот для SkillKlan, який:
- Проводить онбординг нових користувачів
- Дозволяє вибрати професію (QA або Business Analyst)
- Збирає контактні дані користувачів
- Відправляє тестові завдання у форматі PDF
- Керує процесом здачі завдань

### Основні функції:
- ✅ Вибір професії (QA/BA)
- ✅ Збір контактних даних
- ✅ Відправка PDF завдань
- ✅ Автоматична кнопка здачі завдання (через 10 сек)
- ✅ Перевірка наявності контакту (пропуск повторних запитів)
- ✅ Детальне логування для дебагу

## 🏗️ Архітектура проекту

```
server/
├── bot/                    # Telegram бот
│   ├── handlers/          # Обробники команд
│   ├── services/          # Бізнес-логіка
│   ├── templates/         # Шаблони повідомлень
│   └── types/            # Типи даних
├── shared/               # Спільні компоненти
│   ├── database/         # Робота з БД
│   └── utils/           # Утиліти
├── assets/              # Ресурси
│   └── tasks/          # PDF завдання
└── docs/               # Документація
```

## 📦 Залежності

### Основні пакети:
```json
{
  "telegraf": "^4.15.0",      // Telegram Bot API
  "pg": "^8.11.0",           // PostgreSQL драйвер
  "pdfkit": "^0.14.0"        // Генерація PDF
}
```

### Встановлення:
```bash
npm install telegraf pg pdfkit
```

### Системні вимоги:
- Node.js 16+
- PostgreSQL 12+
- Docker (опціонально)

## 📁 Структура файлів

### Основні файли:
- `server.js` - точка входу
- `bot/bot.js` - основний клас бота
- `bot/types/index.js` - визначення типів
- `shared/database/DatabaseService.js` - робота з БД

### Обробники (`bot/handlers/`):
- `BaseHandler.js` - базовий клас
- `StartHandler.js` - команда /start
- `ProfessionHandler.js` - вибір професії
- `ReadyToTryHandler.js` - кнопка "Я готовий спробувати"
- `ContactHandler.js` - обробка контактів
- `TaskHandler.js` - відправка PDF завдань
- `TaskSubmissionHandler.js` - здача завдання
- `FAQHandler.js` - FAQ
- `RestartHandler.js` - перезапуск
- `UnknownHandler.js` - невідомі команди

### Сервіси (`bot/services/`):
- `UserStateService.js` - управління станом користувача
- `ContactService.js` - робота з контактами
- `TaskService.js` - робота з PDF завданнями

### Шаблони (`bot/templates/`):
- `messages.js` - тексти повідомлень
- `keyboards.js` - клавіатури

## 🗄️ База даних

### Таблиці:

#### `bot_users` - основна таблиця користувачів:
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

#### `bot_contacts` - контактні дані:
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

### Підключення:
```javascript
// config.env
DB_HOST=localhost
DB_PORT=5432
DB_NAME=skillklan_db
DB_USER=skillklan_user
DB_PASSWORD=your_password
```

## 🎮 Обробники команд

### 1. StartHandler
**Мета:** Початкове привітання та вибір професії
**Крок:** `start` → `profession_selection`

### 2. ProfessionHandler
**Мета:** Обробка вибору професії (QA/BA)
**Крок:** `profession_selection` → `profession_selection`
**Особливості:** Дозволяє змінювати професію

### 3. ReadyToTryHandler
**Мета:** Перевірка контакту та відправка завдання
**Логіка:**
- Якщо контакт є → одразу відправляє завдання
- Якщо контакту немає → просить контакт

### 4. ContactHandler
**Мета:** Збір та збереження контактних даних
**Крок:** `contact_request` → `task_delivery`

### 5. TaskHandler
**Мета:** Відправка PDF завдання
**Функції:**
- Відправка відповідного PDF (QA/BA)
- Автоматична кнопка через 10 секунд

### 6. TaskSubmissionHandler
**Мета:** Обробка здачі завдання
**Результат:** Повідомлення про зв'язок з менеджером

## 🔧 Сервіси

### UserStateService
**Мета:** Управління станом користувача
**Особливості:** Без кешування - кожен запит йде в БД

### ContactService
**Мета:** Валідація та збереження контактів
**Функції:**
- Валідація телефонних номерів
- Маскування для логів
- Перевірка наявності контакту

### TaskService
**Мета:** Робота з PDF завданнями
**Функції:**
- Отримання шляху до PDF
- Перевірка існування файлу
- Інформація про завдання

## 💬 Шаблони повідомлень

### MessageTemplates
- `getWelcomeMessage()` - привітання
- `getProfessionSelectionMessage()` - вибір професії
- `getContactRequestMessage()` - запит контакту
- `getTaskSubmissionPromptMessage()` - кнопка здачі
- `getErrorMessage()` - помилка

### KeyboardTemplates
- `getProfessionKeyboard()` - вибір професії
- `getReadyToTryKeyboard()` - "Я готовий спробувати"
- `getContactKeyboard()` - поділитися контактом
- `getTaskCompletionKeyboard()` - здача завдання

## 🐛 Помилки та виправлення

### 1. Проблема з імпортами
**Помилка:** `Cannot read properties of undefined (reading 'getErrorMessage')`
**Причина:** Неправильне деструктурування імпортів
**Виправлення:**
```javascript
// ❌ Неправильно
const { MessageTemplates } = require('../templates/messages');

// ✅ Правильно
const MessageTemplates = require('../templates/messages');
```

### 2. Проблема з кешуванням
**Помилка:** Стан користувача не оновлювався
**Причина:** Конфлікт між кешем і БД
**Виправлення:** Видалено кешування, кожен запит йде в БД

### 3. Проблема з JSON парсингом
**Помилка:** `SyntaxError: "[object Object]" is not valid JSON`
**Причина:** `contact_data` в БД вже об'єкт, але код намагався парсити
**Виправлення:**
```javascript
// Додано перевірку типу
if (typeof data.contact_data === 'string') {
  state.contactData = JSON.parse(data.contact_data);
} else {
  state.contactData = data.contact_data;
}
```

### 4. Проблема з валідацією TaskSubmissionHandler
**Помилка:** Кнопка здачі завдання не працювала
**Причина:** Валідація очікувала `currentStep === 'completed'`, але крок залишався `contact_request`
**Виправлення:** Видалено перевірку кроку, залишено тільки `taskSent === true`

## ⚙️ Налаштування та запуск

### 1. Налаштування БД:
```bash
# Створення БД
createdb skillklan_db

# Виконання SQL скриптів
psql -d skillklan_db -f database/bot_tables.sql
```

### 2. Налаштування змінних:
```bash
# server/.env
TELEGRAM_BOT_TOKEN=your_bot_token
DB_HOST=localhost
DB_PORT=5432
DB_NAME=skillklan_db
DB_USER=skillklan_user
DB_PASSWORD=your_password
```

### 3. Генерація PDF:
```bash
node generate-pdfs.js
```

### 4. Запуск:
```bash
# Локально
node server.js

# Через Docker
docker-compose up --build
```

## 🧪 Тестування

### Тестовий флоу:
1. `/start` - привітання
2. Вибір професії (QA/BA)
3. "Я готовий спробувати"
4. Надання контакту
5. Отримання PDF завдання
6. Через 10 сек - кнопка здачі
7. Натискання кнопки - повідомлення про менеджера

### Перевірка повторного використання:
1. Повторний `/start`
2. Вибір професії
3. "Я готовий спробувати" - має одразу відправити завдання

### Логування:
- Всі дії логуються з префіксом `🔍🔍🔍`
- Логи зберігаються в `server.log`
- Моніторинг: `tail -f server.log`

## 📝 Важливі зауваження

1. **Без кешування:** Кожен запит йде безпосередньо в БД
2. **Детальне логування:** Всі критичні операції логуються
3. **Валідація стану:** Кожен обробник має свою валідацію
4. **PDF завдання:** Автоматично генеруються для QA/BA
5. **Автоматичні кнопки:** Через 10 секунд після PDF

## 🔄 Наступні кроки

1. Додати адмін-панель для менеджерів
2. Реалізувати систему сповіщень
3. Додати аналітику використання
4. Оптимізувати продуктивність
5. Додати тести
