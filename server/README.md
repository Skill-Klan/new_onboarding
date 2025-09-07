# SkillKlan Telegram Bot

## 📱 Опис
Telegram бот для SkillKlan, який допомагає користувачам з навичками та талантами.

## 🚀 Функції
- **Професійний вибір** - допомога з вибором професії
- **Тестові завдання** - BA та QA тести
- **Контакти** - зворотний зв'язок
- **FAQ** - відкриває MiniApp на GitHub Pages

## 🔧 Налаштування

### 1. Встановлення залежностей
```bash
npm install
```

### 2. Налаштування змінних середовища
```bash
cp env.example .env
# Відредагуйте .env файл
```

### 3. Запуск
```bash
npm start
```

## 📋 Змінні середовища

```env
# Telegram Bot
TELEGRAM_BOT_TOKEN=your_bot_token
WEBAPP_URL=https://skill-klan.github.io/new_onboarding/faq

# Database
DB_HOST=localhost
DB_PORT=5432
DB_NAME=skillklan_db
DB_USER=skillklan_user
DB_PASSWORD=your_password
```

## 🌐 FAQ
FAQ тепер розміщений на GitHub Pages:
- **URL:** https://skill-klan.github.io/new_onboarding/faq
- **Деплой:** Автоматичний при змінах в `miniapp/`
- **Код:** В корені проекту в папці `miniapp/`

## 📁 Структура
```
server/
├── bot/              # Telegram bot код
│   ├── handlers/     # Обробники команд
│   ├── services/     # Сервіси
│   └── templates/    # Шаблони повідомлень
├── shared/           # Спільні утиліти
├── server.js         # Основний сервер
└── package.json      # Залежності
```

## 🔄 Оновлення FAQ
FAQ оновлюється автоматично при змінах в `miniapp/` папці.
Сервер тільки відкриває посилання на GitHub Pages.
