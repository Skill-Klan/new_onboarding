# SkillKlan Telegram Bot

> Повнофункціональний Telegram бот для онбордингу нових користувачів в IT школу SkillKlan

[![Node.js](https://img.shields.io/badge/Node.js-16+-green.svg)](https://nodejs.org/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-12+-blue.svg)](https://postgresql.org/)
[![Docker](https://img.shields.io/badge/Docker-Ready-blue.svg)](https://docker.com/)
[![License](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)

## 🎯 Огляд

**SkillKlan Telegram Bot** - це інтелектуальний бот для автоматизації процесу онбордингу нових студентів. Бот проводить користувачів через повний цикл від вибору професії до здачі тестового завдання, забезпечуючи плавний та ефективний досвід.

### ✨ Основні функції

- 🎯 **Вибір професії** - QA Engineer або Business Analyst
- 📞 **Збір контактних даних** з валідацією та збереженням
- 📋 **Відправка PDF завдань** з автоматичними кнопками
- ⏰ **Система нагадувань** - автоматичні нагадування на 3-й, 7-й та 9-й день
- 🔗 **Discord webhook інтеграція** для менеджерів
- 📊 **Розрахунок часу виконання** завдань
- 🗄️ **Надійне збереження даних** в PostgreSQL
- 🎨 **Сучасний UI/UX** з інтуїтивними кнопками

## 🚀 Швидкий старт

### Передумови

- Node.js 16+ 
- PostgreSQL 12+
- Telegram Bot Token
- Discord Webhook URL (опціонально)

### Встановлення

```bash
# Клонування репозиторію
git clone https://github.com/Skill-Klan/new_onboarding.git
cd new_onboarding/server

# Встановлення залежностей
npm install

# Налаштування бази даних
createdb skillklan_db
psql -d skillklan_db -f database/bot_tables.sql
psql -d skillklan_db -f database/add_reminder_columns.sql

# Налаштування змінних середовища
cp env.example .env
# Відредагуйте .env файл з вашими налаштуваннями

# Генерація PDF завдань
node generate-pdfs.js

# Запуск бота
node server.js
```

### Docker Deployment

```bash
# Запуск всіх сервісів
docker-compose up --build

# Запуск в фоновому режимі
docker-compose up -d --build
```

## 🏗️ Архітектура

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Telegram      │    │   Node.js Bot   │    │   PostgreSQL    │
│   Users         │◄──►│   Server        │◄──►│   Database      │
└─────────────────┘    └─────────────────┘    └─────────────────┘
                              │
                              ▼
                       ┌─────────────────┐
                       │   Discord       │
                       │   Webhook       │
                       └─────────────────┘
```

### Компоненти

- **Handlers** - Обробка команд та дій користувачів
- **Services** - Бізнес-логіка та інтеграції
- **Database** - Збереження стану та даних
- **Webhooks** - Сповіщення менеджерів в Discord
- **Reminders** - Автоматичні нагадування

## 📚 Документація

### Повна документація
- 📖 [Повна документація](docs/implementation/README.md)
- 🚀 [Швидкий старт](docs/implementation/QUICK_START.md)
- 🏗️ [Архітектура](docs/implementation/ARCHITECTURE.md)
- 📚 [API Reference](docs/implementation/API_REFERENCE.md)
- 📦 [Залежності](docs/implementation/DEPENDENCIES.md)
- 🐛 [Помилки та виправлення](docs/implementation/ERRORS_AND_FIXES.md)

### Розгортання
- 🐳 [Docker Guide](docs/deployment/DOCKER_MIGRATION_GUIDE.md)
- 🚀 [Simple Deployment](docs/deployment/SIMPLE_DEPLOYMENT.md)
- 📊 [Deployment Status](docs/deployment/DEPLOYMENT_STATUS_REPORT.md)

## 🔄 Флоу користувача

1. **Початок** - Користувач натискає `/start` + webhook
2. **Вибір професії** - QA Engineer або Business Analyst
3. **Готовність** - "Я готовий спробувати" + webhook
4. **Контакт** - Надання номера телефону + webhook
5. **Завдання** - Отримання PDF завдання + webhook
6. **Здача** - "Я готовий здати тестове завдання" + webhook
7. **Завершення** - Повідомлення про зв'язок з менеджером

## ⏰ Система нагадувань

- **3-й день** - Мотиваційне повідомлення
- **7-й день** - Попередження + webhook для менеджерів
- **9-й день** - Критичне повідомлення + webhook

## 🔗 Discord Webhook

Менеджери отримують автоматичні сповіщення про:
- 🚀 Початок взаємодії з ботом
- 🚀 Готовність користувача спробувати
- 📞 Надання контактних даних
- 📋 Відправку тестового завдання
- ✅ Завершення завдання з часом виконання
- ⚠️ Попередження про дедлайн
- 🚨 Критичні сповіщення

## 🛠️ Технологічний стек

- **Backend:** Node.js + Telegraf
- **База даних:** PostgreSQL
- **PDF генерація:** PDFKit
- **Планувальник:** node-cron
- **HTTP клієнт:** axios
- **Контейнеризація:** Docker
- **Frontend:** Vue.js (MiniApp)

## 📊 Статистика

- **28 файлів** змінено
- **812 рядків** додано
- **2 нові сервіси** створено
- **7 webhook тригерів** реалізовано
- **3 типи нагадувань** налаштовано
- **100% покриття** основних сценаріїв

## 🧪 Тестування

```bash
# Локальне тестування
node server.js

# Моніторинг логів
tail -f server.log

# Перевірка статусу
curl http://localhost:3000/api/health
```

## 🚨 Troubleshooting

### Поширені проблеми

1. **Бот не відповідає**
   - Перевірте токен в `.env`
   - Переконайтеся, що сервер запущений

2. **Помилка підключення до БД**
   - Запустіть PostgreSQL
   - Перевірте налаштування в `.env`

3. **PDF файли не знайдені**
   - Запустіть `node generate-pdfs.js`
   - Перевірте права доступу

## 🤝 Внесок у проект

1. Fork репозиторій
2. Створіть feature branch (`git checkout -b feature/amazing-feature`)
3. Commit зміни (`git commit -m 'Add amazing feature'`)
4. Push в branch (`git push origin feature/amazing-feature`)
5. Відкрийте Pull Request

## 📄 Ліцензія

Цей проект ліцензовано під MIT License - дивіться [LICENSE](LICENSE) файл для деталей.

## 📞 Підтримка

- **GitHub Issues:** [Створити issue](https://github.com/Skill-Klan/new_onboarding/issues)
- **Документація:** `docs/implementation/`
- **Логи:** `server.log`

## 🎯 Roadmap

### ✅ Завершено
- [x] Основний флоу бота
- [x] Система нагадувань
- [x] Discord webhook інтеграція
- [x] Розрахунок часу виконання
- [x] Централізоване управління текстами
- [x] Детальна документація

### 🔄 В планах
- [ ] Адмін-панель для менеджерів
- [ ] Аналітика використання
- [ ] Оптимізація продуктивності
- [ ] Автоматичні тести
- [ ] Моніторинг webhook повідомлень
- [ ] Багатомовність

---

**Розроблено з ❤️ командою SkillKlan**

*Версія: 2.0.0 | Останнє оновлення: 2025-09-03*

