# 📚 SkillKlan Onboarding Bot - Повна документація

## 🎯 Огляд проекту

**SkillKlan Onboarding Bot** - це комплексна система для автоматизації онбордингу нових користувачів в IT школу SkillKlan. Система включає Telegram бота, веб-додаток FAQ та автоматизовані процеси розгортання.

### ✨ Основні компоненти
- 🤖 **Telegram Bot** - основний інтерфейс взаємодії з користувачами
- 📱 **FAQ Mini App** - Vue.js додаток з часто задаваними питаннями
- 🗄️ **PostgreSQL Database** - зберігання даних користувачів та їх прогресу
- 🔗 **Discord Webhook** - інтеграція для сповіщень менеджерів
- 🚀 **Automated Deployment** - повністю автоматизована система розгортання з Git hooks та GitHub Actions

## 📖 Структура документації

### 01. [Огляд проекту](./01-overview/)
- [Загальний огляд](./01-overview/01-project-overview.md) - основні функції та можливості
- [Технологічний стек](./01-overview/02-tech-stack.md) - використані технології
- [Архітектура системи](./01-overview/03-system-architecture.md) - високорівнева архітектура

### 02. [Архітектура](./02-architecture/)
- [Структура проекту](./02-architecture/01-project-structure.md) - організація файлів та папок
- [База даних](./02-architecture/02-database.md) - схема БД та таблиці
- [Компоненти бота](./02-architecture/03-bot-components.md) - обробники, сервіси, шаблони
- [API Reference](./02-architecture/04-api-reference.md) - повний опис API

### 03. [Розгортання](./03-deployment/)
- [Швидкий старт](./03-deployment/01-quick-start.md) - мінімальні кроки для запуску
- [Автоматичний деплой](./03-deployment/02-automatic-deployment.md) - система автоматичного розгортання
- [Гід налаштування](./03-deployment/03-setup-guide.md) - покрокове налаштування
- [Docker розгортання](./03-deployment/04-docker-deployment.md) - контейнеризація
- [Production налаштування](./03-deployment/05-production-setup.md) - продакшн конфігурація
- [Моніторинг](./03-deployment/06-monitoring.md) - відстеження стану системи

### 04. [Розробка](./04-development/)
- [Налаштування середовища](./04-development/01-environment-setup.md) - локальна розробка
- [Структура коду](./04-development/02-code-structure.md) - організація коду
- [Додавання нових функцій](./04-development/03-adding-features.md) - розширення функціоналу
- [Тестування](./04-development/04-testing.md) - стратегія тестування

### 05. [API та інтеграції](./05-api/)
- [Telegram Bot API](./05-api/01-telegram-bot-api.md) - робота з Telegram
- [Discord Webhook](./05-api/02-discord-webhook.md) - інтеграція з Discord
- [REST API](./05-api/03-rest-api.md) - HTTP ендпоінти
- [Database API](./05-api/04-database-api.md) - робота з БД

### 06. [Усунення проблем](./06-troubleshooting/)
- [Поширені проблеми](./06-troubleshooting/01-common-issues.md) - типові помилки та рішення
- [Логування](./06-troubleshooting/02-logging.md) - система логування
- [Діагностика](./06-troubleshooting/03-diagnostics.md) - інструменти діагностики
- [FAQ](./06-troubleshooting/04-faq.md) - часто задавані питання

### 07. [Скрипти та автоматизація](./07-scripts/)
- [Скрипти розгортання](./07-scripts/01-deployment-scripts.md) - автоматичне розгортання
- [GitHub Actions](./07-scripts/02-github-actions.md) - CI/CD налаштування
- [Утиліти](./07-scripts/03-utilities.md) - допоміжні скрипти
- [Моніторинг скрипти](./07-scripts/04-monitoring-scripts.md) - автоматичний моніторинг

## 🚀 Швидкий старт

### 1. Клонування репозиторію
```bash
git clone https://github.com/your-username/new_onboarding.git
cd new_onboarding
```

### 2. Запуск через Docker (рекомендовано)
```bash
cd server
docker compose up -d
```

### 3. Перевірка роботи
```bash
# Перевірка API
curl http://localhost:3001/api/health

# Перевірка бота
# Відправте /start боту в Telegram
```

## 📊 Поточний стан проекту

### ✅ Реалізовано
- [x] Telegram бот з повним флоу онбордингу
- [x] Система нагадувань (3-й, 7-й, 9-й день)
- [x] Discord webhook інтеграція
- [x] FAQ Mini App на GitHub Pages
- [x] Автоматизовані скрипти розгортання
- [x] Docker контейнеризація
- [x] PostgreSQL база даних

### 🔄 В розробці
- [ ] Адмін-панель для менеджерів
- [ ] Аналітика та звіти
- [ ] Розширена система нагадувань
- [ ] Мобільний додаток

### 📈 Статистика
- **28 файлів** змінено
- **812 рядків** коду додано
- **7 webhook тригерів** реалізовано
- **3 типи нагадувань** налаштовано
- **100% покриття** основних сценаріїв

## 🔧 Налаштування

### Змінні середовища
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

# Discord Webhook
DISCORD_WEBHOOK_URL=your_discord_webhook_url

# Приклад реального webhook (НЕ комітити в git!)
# DISCORD_WEBHOOK_URL=https://discord.com/api/webhooks/1414587701704790136/bbJ3gjSix-sttE1Q2cLnpMtvFt44Pxmv7xVxKl-QAoQuuH_npRv8pU5sSugtY7vz9BXM
```

### Системні вимоги
- **Node.js:** 16.0.0+
- **PostgreSQL:** 12.0+
- **Docker:** 20.0+ (опціонально)
- **RAM:** 512MB+ (рекомендовано 1GB+)

## 📞 Підтримка

### Корисні ресурси
- **GitHub Issues:** [Створити issue](https://github.com/your-username/new_onboarding/issues)
- **Документація:** `documentation/`
- **Логи:** `server.log`
- **Конфігурація:** `.env`

### Корисні команди
```bash
# Моніторинг логів
tail -f server.log

# Перевірка статусу
curl http://localhost:3001/api/health

# Backup БД
pg_dump -h localhost -U skillklan_user skillklan_db > backup.sql

# Перезапуск сервісів
docker compose restart
```

## 🔄 Оновлення документації

Документація оновлюється автоматично при змінах у проекті. Для ручного оновлення:

1. Внесіть зміни в відповідні файли документації
2. Перевірте актуальність інформації
3. Оновіть індексний файл при необхідності
4. Зробіть commit з описом змін

---

**Версія документації:** 3.0.0  
**Останнє оновлення:** 2025-09-08  
**Автор:** SkillKlan Development Team
