# SkillKlan Onboarding Bot

## 🏗️ Архітектура

### **Сервер (192.168.88.121):**
- 🤖 **Telegram Bot** - основний функціонал
- 🗄️ **PostgreSQL** - база даних
- 🔌 **Node.js API** - тільки для бота
- 🐳 **Docker** - контейнеризація

### **GitHub Pages:**
- 📱 **FAQ Mini App** - Vue.js додаток
- 🚀 **GitHub Actions** - автоматичний деплой
- 🔗 **URL:** https://skill-klan.github.io/new_onboarding/faq

## 🚀 Запуск

### Сервер:
```bash
cd server
docker compose up -d
```

### FAQ (автоматично):
- Push в main → GitHub Actions деплой

## 📁 Структура

```
├── server/           # Bot + API
├── miniapp/          # FAQ (GitHub Pages)
├── .github/workflows/ # GitHub Actions
└── README.md
```

## 🔧 Налаштування

1. **Сервер:** Налаштувати змінні середовища
2. **GitHub Pages:** Увімкнути в налаштуваннях репозиторію
3. **Bot:** URL вказує на GitHub Pages

## ✅ Переваги

- ✅ **Простота** - мінімальний стек
- ✅ **Надійність** - GitHub Pages для FAQ
- ✅ **Масштабованість** - окремі сервіси
- ✅ **Безпека** - HTTPS для FAQ
