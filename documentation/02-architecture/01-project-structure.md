# 📁 Структура проекту

## Загальна структура

```
new_onboarding/
├── documentation/          # 📚 Консолідована документація
│   ├── 01-overview/       # Огляд проекту
│   ├── 02-architecture/   # Архітектура
│   ├── 03-deployment/     # Розгортання
│   ├── 04-development/    # Розробка
│   ├── 05-api/           # API та інтеграції
│   ├── 06-troubleshooting/ # Усунення проблем
│   └── 07-scripts/       # Скрипти та автоматизація
├── server/                # 🤖 Backend (Telegram Bot + API)
├── miniapp/              # 📱 Frontend (FAQ Mini App)
├── .github/              # 🔄 GitHub Actions
├── scripts/              # 🛠️ Допоміжні скрипти
└── README.md             # 📖 Головний README
```

## Server (Backend)

### Основна структура
```
server/
├── bot/                   # Telegram Bot
│   ├── handlers/         # Обробники команд
│   │   ├── BaseHandler.js
│   │   ├── StartHandler.js
│   │   ├── ProfessionHandler.js
│   │   ├── ReadyToTryHandler.js
│   │   ├── ContactHandler.js
│   │   ├── TaskHandler.js
│   │   ├── TaskSubmissionHandler.js
│   │   ├── RestartHandler.js
│   │   └── UnknownHandler.js
│   ├── services/         # Бізнес-логіка
│   │   ├── UserStateService.js
│   │   ├── ContactService.js
│   │   ├── TaskService.js
│   │   ├── ReminderService.js
│   │   └── WebhookService.js
│   ├── templates/        # Шаблони повідомлень
│   │   ├── messages.js
│   │   └── keyboards.js
│   ├── types/           # Типи даних
│   │   └── index.js
│   └── bot.js           # Основний клас бота
├── shared/              # Спільні компоненти
│   ├── database/        # Робота з БД
│   │   └── DatabaseService.js
│   └── utils/          # Утиліти
├── config/             # Конфігурація
│   ├── webhook.config.js
│   └── README.md
├── docs/               # Документація сервера
│   ├── WEBHOOK_ARCHITECTURE.md
│   ├── WEBHOOK_TOGGLE_IMPLEMENTATION.md
│   └── WEBHOOK_API_EXAMPLES.md
├── scripts/            # Скрипти сервера
│   ├── demo-webhook-toggle.js
│   └── test-webhook-api.js
├── assets/             # Ресурси
│   └── tasks/         # PDF завдання
├── database/          # SQL скрипти
├── server.js          # Точка входу
├── package.json       # Залежності
├── Dockerfile         # Docker образ
└── .env              # Змінні середовища
```

### Bot Handlers

#### BaseHandler.js
- **Призначення:** Базовий клас для всіх обробників
- **Методи:** `handle()`, `validateState()`, `logAction()`
- **Особливості:** Загальна логіка для всіх обробників

#### StartHandler.js
- **Призначення:** Обробка команди `/start`
- **Функції:** Привітання, вибір професії, webhook сповіщення
- **Кроки:** `start` → `profession_selection`

#### ProfessionHandler.js
- **Призначення:** Обробка вибору професії (QA/BA)
- **Функції:** Збереження вибору, перехід до наступного кроку
- **Кроки:** `profession_selection` → `profession_selection`

#### ReadyToTryHandler.js
- **Призначення:** Обробка кнопки "Я готовий спробувати"
- **Функції:** Перевірка контакту, відправка завдання або запит контакту
- **Кроки:** `profession_selection` → `task_delivery` або `contact_request`

#### ContactHandler.js
- **Призначення:** Обробка контактних даних
- **Функції:** Валідація номера, збереження в БД, webhook сповіщення
- **Кроки:** `contact_request` → `task_delivery`

#### TaskHandler.js
- **Призначення:** Відправка PDF завдань
- **Функції:** Відправка PDF, розрахунок дедлайну, webhook сповіщення
- **Кроки:** `task_delivery` → `task_delivery`

#### TaskSubmissionHandler.js
- **Призначення:** Обробка здачі завдання
- **Функції:** Розрахунок часу виконання, webhook сповіщення
- **Кроки:** `task_delivery` → `completed`

### Bot Services

#### UserStateService.js
- **Призначення:** Управління станом користувача
- **Методи:** `getState()`, `updateState()`, `markTaskSent()`
- **Особливості:** Без кешування, кожен запит в БД

#### ContactService.js
- **Призначення:** Робота з контактними даними
- **Методи:** `validatePhone()`, `saveContact()`, `getContact()`
- **Особливості:** Валідація українських номерів

#### TaskService.js
- **Призначення:** Робота з PDF завданнями
- **Методи:** `getTaskPath()`, `getTaskInfo()`, `generateTask()`
- **Особливості:** Автоматична генерація PDF

#### ReminderService.js
- **Призначення:** Система нагадувань
- **Методи:** `startReminderCron()`, `sendReminder()`, `checkAndSendReminders()`
- **Особливості:** Cron job, розрахунок дедлайну

#### WebhookService.js
- **Призначення:** Discord webhook інтеграція
- **Методи:** `sendMessage()`, `notifyUserStarted()`, `notifyTaskCompleted()`
- **Особливості:** Кольорове кодування, структуровані повідомлення

## MiniApp (Frontend)

### Структура
```
miniapp/
├── src/                 # Вихідний код
│   ├── components/     # Vue компоненти
│   │   └── BackArrow.vue
│   ├── pages/         # Сторінки
│   │   └── FAQPage.vue
│   ├── router/        # Маршрутизація
│   │   └── index.ts
│   ├── store/         # State management
│   │   └── pageState.ts
│   ├── data/          # Дані
│   │   └── faq.json
│   ├── styles/        # Стилі
│   │   ├── index.css
│   │   ├── buttons.css
│   │   ├── forms.css
│   │   ├── layout.css
│   │   └── variables.css
│   ├── assets/        # Ресурси
│   │   └── vue.svg
│   ├── App.vue        # Головний компонент
│   ├── main.ts        # Точка входу
│   └── vue-shims.d.ts # TypeScript типи
├── public/            # Статичні файли
│   └── vite.svg
├── dist/              # Збірка
├── package.json       # Залежності
├── vite.config.ts     # Vite конфігурація
├── tsconfig.json      # TypeScript конфігурація
└── README.md          # Документація
```

### Компоненти

#### FAQPage.vue
- **Призначення:** Головна сторінка з FAQ
- **Функції:** Відображення питань та відповідей, навігація
- **Особливості:** Responsive дизайн, анімації

#### BackArrow.vue
- **Призначення:** Кнопка повернення
- **Функції:** Навігація назад, стилізація
- **Особливості:** Перевикористовуваний компонент

### Стилі

#### index.css
- **Призначення:** Глобальні стилі
- **Функції:** Reset, базові стилі, шрифти

#### buttons.css
- **Призначення:** Стилі кнопок
- **Функції:** Hover ефекти, анімації, кольори

#### forms.css
- **Призначення:** Стилі форм
- **Функції:** Input поля, валідація, фокус

#### layout.css
- **Призначення:** Макет сторінки
- **Функції:** Grid, Flexbox, responsive

#### variables.css
- **Призначення:** CSS змінні
- **Функції:** Кольори, розміри, шрифти

## GitHub Actions

### Структура
```
.github/
└── workflows/
    ├── deploy.yml          # Деплой на сервер
    ├── deploy-miniapp.yml  # Деплой Mini App
    └── test.yml           # Тестування
```

### Workflows

#### deploy.yml
- **Призначення:** Деплой сервера
- **Тригери:** Push в main
- **Дії:** Тестування, збірка, деплой

#### deploy-miniapp.yml
- **Призначення:** Деплой Mini App на GitHub Pages
- **Тригери:** Push в main
- **Дії:** Збірка Vue.js, деплой на Pages

## Скрипти

### Структура
```
scripts/
├── deploy.sh              # Автоматичний деплой
├── fix-bot-conflict.sh    # Вирішення конфлікту бота
├── setup-webhook.sh       # Налаштування webhook
└── setup-github-actions.sh # Налаштування GitHub Actions
```

### Призначення скриптів

#### deploy.sh
- **Функції:** Клонування репозиторію, збірка, деплой
- **Параметри:** branch, server_ip, server_user
- **Особливості:** Автоматичне оновлення, перевірка статусу

#### fix-bot-conflict.sh
- **Функції:** Вирішення конфлікту 409, очищення webhook
- **Параметри:** server_ip, server_user
- **Особливості:** Автоматичне вирішення проблем

#### setup-webhook.sh
- **Функції:** Налаштування webhook режиму
- **Параметри:** server_ip, server_user, webhook_url
- **Особливості:** Перехід з polling на webhook

## Конфігураційні файли

### package.json (Server)
```json
{
  "name": "new_onboarding-server",
  "version": "1.0.0",
  "dependencies": {
    "telegraf": "^4.15.0",
    "pg": "^8.11.0",
    "pdfkit": "^0.14.0",
    "axios": "^1.6.0",
    "node-cron": "^3.0.3",
    "express": "^4.18.0"
  }
}
```

### package.json (MiniApp)
```json
{
  "name": "skillklan-faq",
  "version": "1.0.0",
  "dependencies": {
    "vue": "^3.3.0",
    "vue-router": "^4.2.0",
    "pinia": "^2.1.0"
  }
}
```

### docker-compose.yml
```yaml
version: '3.8'
services:
  postgres:
    image: postgres:16-alpine
    environment:
      POSTGRES_DB: skillklan_db
      POSTGRES_USER: skillklan_user
      POSTGRES_PASSWORD: SkillKlan2024
    ports:
      - "5432:5432"
    volumes:
      - postgres_data:/var/lib/postgresql/data

  server:
    build: ./server
    ports:
      - "3001:3001"
    environment:
      - NODE_ENV=production
    depends_on:
      - postgres
    volumes:
      - ./server:/app
      - /app/node_modules

  nginx:
    image: nginx:alpine
    ports:
      - "80:80"
      - "443:443"
    volumes:
      - ./nginx.conf:/etc/nginx/nginx.conf
    depends_on:
      - server

volumes:
  postgres_data:
```

## Принципи організації

### Модульність
- **Кожен компонент** має чітке призначення
- **Мінімальні залежності** між модулями
- **Легка заміна** компонентів

### Масштабованість
- **Горизонтальне масштабування** через Docker
- **Вертикальне масштабування** через ресурси
- **Автоматичне масштабування** через оркестратори

### Підтримка
- **Детальна документація** для кожного компонента
- **Логування** для діагностики
- **Тестування** для стабільності
