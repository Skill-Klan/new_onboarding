# SkillKlan FAQ - GitHub Pages

## 🚀 Деплой на GitHub Pages

### Автоматичний деплой
1. Push в `main` гілку (тільки зміни в `miniapp/`)
2. GitHub Actions автоматично збудує та задеплоїть FAQ сторінку
3. Сайт буде доступний за адресою: `https://skill-klan.github.io/new_onboarding/faq`

### Ручний деплой
1. Перейти в Settings → Pages
2. Встановити Source: "GitHub Actions"
3. Запустити workflow "Deploy to GitHub Pages"

## 📁 Структура проекту

```
├── miniapp/           # Vue.js FAQ додаток (деплоїться)
│   ├── src/          # Вихідний код
│   ├── dist/         # Збірка для продакшену
│   └── package.json  # Залежності
├── server/            # Node.js бот (НЕ деплоїться)
│   ├── bot/          # Telegram bot код
│   └── ...
├── .github/workflows/ # GitHub Actions
├── 404.html          # SPA fallback
└── README.md         # Документація
```

## 🔧 Локальна розробка

```bash
cd miniapp
npm install
npm run dev
```

## 📱 Telegram Mini App

FAQ сторінка налаштована для роботи як Telegram Mini App:
- Підключений Telegram Web App SDK
- Адаптивний дизайн для мобільних пристроїв
- Підтримка темної/світлої теми Telegram

## 🌐 URL для BotFather

Використовуйте цей URL в налаштуваннях BotFather:
```
https://skill-klan.github.io/new_onboarding/faq
```

## ⚠️ Важливо

- **Тільки `miniapp/` деплоїться** на GitHub Pages
- **`server/` залишається** в репозиторії для історії
- **Зміни в `server/`** не запускають деплой
- **Зміни в `miniapp/`** автоматично деплоїть FAQ
