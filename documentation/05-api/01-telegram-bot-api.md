# 🤖 Telegram Bot API

## Огляд

Telegram Bot API використовується для взаємодії з користувачами через бота. Проект використовує Telegraf фреймворк для спрощення роботи з API.

## Основні компоненти

### Bot Class
```javascript
const { Telegraf } = require('telegraf');
const bot = new Telegraf(process.env.TELEGRAM_BOT_TOKEN);
```

### Handlers
- **StartHandler** - обробка команди `/start`
- **ProfessionHandler** - вибір професії
- **ContactHandler** - обробка контактів
- **TaskHandler** - відправка завдань
- **TaskSubmissionHandler** - здача завдань

## Команди бота

### /start
**Призначення:** Початкова команда для запуску бота

**Обробник:** `StartHandler`

**Функції:**
- Привітання користувача
- Відображення кнопок вибору професії
- Відправка webhook сповіщення

**Код:**
```javascript
this.bot.start(async (ctx) => {
  const userState = await this.userStateService.getState(ctx.from.id);
  await startHandler.handle(ctx, userState);
});
```

### Callback обробники

#### profession_QA / profession_BA
**Призначення:** Обробка вибору професії

**Обробник:** `ProfessionHandler`

**Функції:**
- Збереження вибору професії
- Перехід до наступного кроку
- Відправка webhook сповіщення

#### ready_to_try
**Призначення:** Кнопка "Я готовий спробувати"

**Обробник:** `ReadyToTryHandler`

**Функції:**
- Перевірка наявності контакту
- Відправка завдання або запит контакту
- Відправка webhook сповіщення

#### submit_task
**Призначення:** Кнопка "Я готовий здати"

**Обробник:** `TaskSubmissionHandler`

**Функції:**
- Розрахунок часу виконання
- Відправка webhook сповіщення
- Завершення флоу

## Обробка повідомлень

### Контакти
```javascript
this.bot.on('contact', async (ctx) => {
  const userState = await this.userStateService.getState(ctx.from.id);
  await contactHandler.handle(ctx, userState);
});
```

### Текстові повідомлення
```javascript
this.bot.on('text', async (ctx) => {
  const userState = await this.userStateService.getState(ctx.from.id);
  
  if (userState.currentStep === BotStep.TASK_DELIVERY && 
      userState.contactData && 
      !userState.taskSent) {
    await taskHandler.handle(ctx, userState);
  } else {
    await unknownHandler.handle(ctx, userState);
  }
});
```

## Клавіатури

### Вибір професії
```javascript
const professionKeyboard = {
  reply_markup: {
    inline_keyboard: [
      [
        { text: 'QA Engineer', callback_data: 'profession_QA' },
        { text: 'Business Analyst', callback_data: 'profession_BA' }
      ]
    ]
  }
};
```

### Готовність спробувати
```javascript
const readyKeyboard = {
  reply_markup: {
    inline_keyboard: [
      [
        { text: 'Так, хочу спробувати', callback_data: 'ready_to_try' }
      ]
    ]
  }
};
```

### Поділитися контактом
```javascript
const contactKeyboard = {
  reply_markup: {
    keyboard: [
      [
        { text: '📞 Поділитися контактом', request_contact: true }
      ]
    ],
    resize_keyboard: true,
    one_time_keyboard: true
  }
};
```

## Webhook режим

### Налаштування webhook
```javascript
// Встановлення webhook
await bot.telegram.setWebhook('https://your-domain.com/webhook');

// Видалення webhook
await bot.telegram.deleteWebhook();
```

### Обробка webhook запитів
```javascript
app.post('/webhook', (req, res) => {
  console.log('📨 Отримано webhook від Telegram:', req.body);
  
  if (botInstance) {
    botInstance.handleUpdate(req.body);
  }
  
  res.status(200).send('OK');
});
```

## Обробка помилок

### Глобальний обробник помилок
```javascript
this.bot.catch((err, ctx) => {
  console.error('❌ Помилка в боті:', err);
  
  const { MessageTemplates } = require('./templates/messages');
  ctx.reply(MessageTemplates.getErrorMessage()).catch(console.error);
});
```

### Логування
```javascript
this.bot.use(async (ctx, next) => {
  const start = Date.now();
  console.log(`📨 Вхідний запит: ${ctx.updateType} від ${ctx.from?.id}`);
  
  await next();
  
  const duration = Date.now() - start;
  console.log(`⏱️ Обробка зайняла: ${duration}ms`);
});
```

## Тестування

### Тестування підключення
```javascript
// Перевірка токена
const testUrl = `https://api.telegram.org/bot${process.env.TELEGRAM_BOT_TOKEN}/getMe`;
const response = await fetch(testUrl);
const data = await response.json();

if (!data.ok) {
  throw new Error(`Telegram API error: ${data.description}`);
}
```

### Тестування webhook
```bash
# Перевірка webhook статусу
curl -s 'https://api.telegram.org/bot<TOKEN>/getWebhookInfo'

# Тестування webhook
curl -X POST 'https://api.telegram.org/bot<TOKEN>/setWebhook' \
  -H 'Content-Type: application/json' \
  -d '{"url": "https://your-domain.com/webhook"}'
```

## Безпека

### Валідація даних
```javascript
// Валідація telegram_id
if (!ctx.from || !ctx.from.id) {
  throw new Error('Invalid user data');
}

// Валідація контакту
if (!ctx.message.contact) {
  throw new Error('Contact data required');
}
```

### Обмеження швидкості
```javascript
// Rate limiting
const rateLimit = new Map();

this.bot.use(async (ctx, next) => {
  const userId = ctx.from.id;
  const now = Date.now();
  
  if (rateLimit.has(userId)) {
    const lastRequest = rateLimit.get(userId);
    if (now - lastRequest < 1000) { // 1 секунда
      return;
    }
  }
  
  rateLimit.set(userId, now);
  await next();
});
```

## Моніторинг

### Метрики
- Кількість активних користувачів
- Кількість повідомлень на хвилину
- Час відповіді бота
- Кількість помилок

### Логування
```javascript
// Логування всіх дій
console.log(`📨 ${ctx.updateType} від ${ctx.from.id}: ${ctx.message?.text || 'callback'}`);

// Логування помилок
console.error('❌ Помилка в боті:', error);
```

## Оптимізація

### Кешування
```javascript
// Кешування стану користувача
const userStateCache = new Map();

async getState(telegramId) {
  if (userStateCache.has(telegramId)) {
    return userStateCache.get(telegramId);
  }
  
  const state = await this.databaseService.getState(telegramId);
  userStateCache.set(telegramId, state);
  return state;
}
```

### Асинхронна обробка
```javascript
// Асинхронна обробка webhook
app.post('/webhook', async (req, res) => {
  res.status(200).send('OK');
  
  // Обробка в фоновому режимі
  setImmediate(() => {
    botInstance.handleUpdate(req.body);
  });
});
```
