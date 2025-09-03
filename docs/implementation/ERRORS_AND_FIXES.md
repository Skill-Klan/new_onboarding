# Помилки та виправлення - SkillKlan Bot

## 📋 Зміст

1. [Проблеми з імпортами](#проблеми-з-імпортами)
2. [Проблеми з кешуванням](#проблеми-з-кешуванням)
3. [Проблеми з базою даних](#проблеми-з-базою-даних)
4. [Проблеми з JSON парсингом](#проблеми-з-json-парсингом)
5. [Проблеми з валідацією](#проблеми-з-валідацією)
6. [Проблеми з Docker](#проблеми-з-docker)
7. [Проблеми з файлами](#проблеми-з-файлами)

## 🔧 Проблеми з імпортами

### Помилка 1: Неправильне деструктурування
**Помилка:**
```
TypeError: Cannot read properties of undefined (reading 'getErrorMessage')
```

**Причина:**
```javascript
// ❌ Неправильно
const { MessageTemplates } = require('../templates/messages');
```

**Виправлення:**
```javascript
// ✅ Правильно
const MessageTemplates = require('../templates/messages');
```

**Файли, що потребували виправлення:**
- `bot/handlers/BaseHandler.js`
- `bot/handlers/StartHandler.js`
- `bot/handlers/ProfessionHandler.js`
- `bot/handlers/ContactHandler.js`

### Помилка 2: Дублювання імпортів
**Помилка:**
```
SyntaxError: Identifier 'MessageTemplates' has already been declared
```

**Причина:** Імпорт в одному файлі двічі
**Виправлення:** Видалити дублікати, залишити один імпорт на початку файлу

### Помилка 3: Неправильний шлях до модулів
**Помилка:**
```
MODULE_NOT_FOUND: Cannot find module '../../bot/types'
```

**Причина:** Неправильний відносний шлях
**Виправлення:** Виправити шлях або видалити непотрібний імпорт

## 💾 Проблеми з кешуванням

### Проблема: Конфлікт між кешем і БД
**Симптоми:**
- Стан користувача не оновлювався
- Повторні запити повертали старі дані
- Неконсистентність даних

**Причина:**
```javascript
// Кеш не оновлювався після збереження в БД
this.memoryCache.set(telegramId, currentState);
const savedState = await this.databaseService.saveUserState(currentState);
// Кеш залишався зі старими даними
```

**Виправлення:**
```javascript
// Видалили кешування повністю
class UserStateService {
  constructor(databaseService) {
    this.databaseService = databaseService;
    // Видалено: this.memoryCache = new Map();
  }
  
  async getState(telegramId) {
    // Завжди завантажуємо з БД
    const userData = await this.databaseService.getUserByTelegramId(telegramId);
    // ...
  }
}
```

**Результат:** Кожен запит йде безпосередньо в БД, гарантує консистентність

## 🗄️ Проблеми з базою даних

### Помилка 1: Неправильна назва таблиці
**Помилка:**
```
error: relation "users" does not exist
```

**Причина:** Код очікував таблицю `users`, але створена `bot_users`
**Виправлення:**
```javascript
// ❌ Було
SELECT * FROM users WHERE telegram_id = $1

// ✅ Стало
SELECT * FROM bot_users WHERE telegram_id = $1
```

### Помилка 2: Неправильна колонка
**Помилка:**
```
error: column "username" of relation "users" does not exist
```

**Причина:** Таблиця `users` не мала колонки `username`
**Виправлення:** Використовувати правильні колонки або створити таблицю з потрібними колонками

### Помилка 3: Неправильна структура таблиці
**Помилка:**
```
error: column "current_step" of relation "users" does not exist
```

**Причина:** `current_step` належить до `user_states`, а не `users`
**Виправлення:** Об'єднати таблиці в `bot_users`

### Помилка 4: Порушення обмежень
**Помилка:**
```
error: null value in column "telegram_id" violates not-null constraint
```

**Причина:** `telegramId` був `undefined` при створенні `UserState`
**Виправлення:**
```javascript
// Додати перевірку
if (!telegramId) {
  throw new Error('telegramId is required');
}
```

## 📄 Проблеми з JSON парсингом

### Помилка: Парсинг об'єкта як JSON
**Помилка:**
```
SyntaxError: "[object Object]" is not valid JSON
```

**Причина:**
```javascript
// contact_data в БД вже об'єкт, але код намагався парсити
state.contactData = data.contact_data ? JSON.parse(data.contact_data) : null;
```

**Виправлення:**
```javascript
// Додати перевірку типу
if (data.contact_data) {
  if (typeof data.contact_data === 'string') {
    state.contactData = JSON.parse(data.contact_data);
  } else {
    state.contactData = data.contact_data;
  }
} else {
  state.contactData = null;
}
```

## ✅ Проблеми з валідацією

### Помилка: Неправильна валідація стану
**Помилка:**
```
Кнопка "Я готовий здати тестове завдання" не працювала
```

**Причина:**
```javascript
// TaskSubmissionHandler.validateState() очікував
userState.currentStep === BotStep.COMPLETED
// Але після відправки завдання крок залишався 'contact_request'
```

**Виправлення:**
```javascript
// Видалити перевірку кроку, залишити тільки taskSent
validateState(userState) {
  return super.validateState(userState) && 
         userState.taskSent === true;
}
```

### Помилка: Подвійне оновлення стану
**Проблема:** `ProfessionHandler` оновлював стан двічі
**Виправлення:**
```javascript
// В ProfessionHandler.getNextStep()
getNextStep() {
  // Не оновлюємо крок автоматично
  return null;
}
```

## 🐳 Проблеми з Docker

### Помилка 1: Команда не знайдена
**Помилка:**
```
zsh: command not found: docker-compose
```

**Виправлення:**
```bash
# Використовувати новий синтаксис
docker compose up --build
# Замість
docker-compose up --build
```

### Помилка 2: Docker daemon не запущений
**Помилка:**
```
Cannot connect to the Docker daemon at unix:///var/run/docker.sock
```

**Виправлення:**
```bash
# Запустити Docker Desktop або
sudo systemctl start docker
```

### Помилка 3: Кешування Docker
**Проблема:** Зміни не застосовувались через кеш
**Виправлення:**
```bash
# Повне перебудовування
docker compose down -v
docker compose up --build --force-recreate
```

## 📁 Проблеми з файлами

### Помилка 1: Файл не знайдено
**Помилка:**
```
Error: Cannot find module '/path/to/server.js'
```

**Причина:** Неправильна робоча директорія
**Виправлення:**
```bash
# Переконатися, що знаходитесь в правильній директорії
cd /path/to/server
node server.js
```

### Помилка 2: Права доступу
**Помилка:**
```
EACCES: permission denied, open 'server.log'
```

**Виправлення:**
```bash
# Змінити права доступу
chmod 644 server.log
# Або запустити з правильними правами
sudo node server.js
```

### Помилка 3: Корупція файлів через sed
**Помилка:**
```
SyntaxError: Unexpected identifier
```

**Причина:** Команди `sed` пошкодили файл
**Виправлення:** Відновити файл з git або переписати вручну

## 🔍 Діагностика помилок

### 1. Перевірка логів
```bash
# Подивитися останні логи
tail -f server.log

# Пошук помилок
grep -i error server.log
```

### 2. Перевірка стану БД
```bash
# Підключення до БД
psql -h localhost -U skillklan_user -d skillklan_db

# Перевірка таблиць
\dt

# Перевірка даних
SELECT * FROM bot_users LIMIT 5;
```

### 3. Перевірка змінних середовища
```bash
# Перевірка .env файлу
cat server/.env

# Перевірка в runtime
node -e "console.log(process.env.TELEGRAM_BOT_TOKEN)"
```

### 4. Перевірка залежностей
```bash
# Перевірка встановлених пакетів
npm list

# Перевірка версій
node --version
npm --version
```

## 🛠️ Інструменти для дебагу

### 1. Детальне логування
```javascript
console.log('🔍🔍🔍 Component.method: ПОЧАТОК');
console.log('🔍🔍🔍 Component.method: data =', data);
console.log('🔍🔍🔍 Component.method: результат =', result);
```

### 2. Перевірка стану
```javascript
// В BaseHandler
console.log('🔍 BaseHandler: userState =', userState);
console.log('🔍 BaseHandler: validateState =', this.validateState(userState));
```

### 3. Перевірка БД
```javascript
// В DatabaseService
console.log('🔍🔍🔍 DatabaseService.query: SQL =', query);
console.log('🔍🔍🔍 DatabaseService.query: values =', values);
console.log('🔍🔍🔍 DatabaseService.query: result =', result.rows);
```

## 📚 Найкращі практики

### 1. Обробка помилок
```javascript
try {
  // Код
} catch (error) {
  console.error('🔍🔍🔍 Component.method: ПОМИЛКА =', error);
  // Graceful degradation
  return fallbackValue;
}
```

### 2. Валідація даних
```javascript
if (!requiredParam) {
  throw new Error('requiredParam is required');
}
```

### 3. Логування
```javascript
// Завжди логувати критичні операції
console.log('🔍🔍🔍 Operation: START');
console.log('🔍🔍🔍 Operation: END');
```

### 4. Тестування
```javascript
// Тестувати кожен сценарій
// Перевіряти edge cases
// Валідувати вхідні дані
```
