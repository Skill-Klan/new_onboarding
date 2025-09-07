# SkillKlan FAQ - GitHub Pages

## 🚀 Деплой на GitHub Pages

### Автоматичний деплой
1. Push в `main` гілку
2. GitHub Actions автоматично збудує та задеплоїть проект
3. Сайт буде доступний за адресою: `https://your-username.github.io/new_onboarding/`

### Ручний деплой
1. Перейти в Settings → Pages
2. Встановити Source: "GitHub Actions"
3. Запустити workflow "Deploy to GitHub Pages"

## 📁 Структура проекту

```
├── miniapp/           # Vue.js додаток
│   ├── src/          # Вихідний код
│   ├── dist/         # Збірка для продакшену
│   └── package.json  # Залежності
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
https://your-username.github.io/new_onboarding/faq
```
