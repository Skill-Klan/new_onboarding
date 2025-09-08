# 🐛 Поширені проблеми та рішення

## Проблеми з ботом

### 1. Конфлікт 409 - "terminated by setWebhook request"

**Симптоми:**
```
❌ Помилка запуску бота: TelegramError: 409: Conflict: terminated by setWebhook request
```

**Причина:** Десь є інший екземпляр бота, який використовує polling режим

**Рішення:**
```bash
# Автоматичне вирішення
./fix-bot-conflict.sh

# Або вручну:
# 1. Очистити webhook
curl -s -X POST 'https://api.telegram.org/bot<TOKEN>/deleteWebhook'

# 2. Перезапустити контейнери
docker compose restart

# 3. Перевірити статус
curl -s 'https://api.telegram.org/bot<TOKEN>/getWebhookInfo'
```

### 2. Бот не відповідає на команди

**Симптоми:**
- Користувач натискає `/start`, але нічого не відбувається
- Логи показують помилки підключення

**Діагностика:**
```bash
# Перевірка логів
docker logs skillklan-server --tail 50

# Перевірка токена
curl -s 'https://api.telegram.org/bot<TOKEN>/getMe'

# Перевірка підключення до БД
docker exec -it skillklan-postgres psql -U skillklan_user -d skillklan_db -c "SELECT NOW();"
```

**Рішення:**
1. Перевірити токен бота в `.env`
2. Перевірити підключення до БД
3. Перезапустити сервіси
4. Перевірити мережеві налаштування

### 3. Бот зависає на певному кроці

**Симптоми:**
- Користувач не може перейти далі після вибору професії
- Кнопки не працюють

**Діагностика:**
```bash
# Перевірка стану користувача в БД
docker exec -it skillklan-postgres psql -U skillklan_user -d skillklan_db -c "SELECT * FROM bot_users WHERE telegram_id = 'USER_ID';"

# Перевірка логів
docker logs skillklan-server | grep "USER_ID"
```

**Рішення:**
1. Скинути стан користувача в БД
2. Перезапустити бота
3. Перевірити обробники команд

## Проблеми з базою даних

### 1. Помилка підключення до БД

**Симптоми:**
```
❌ Database connection error: connect ECONNREFUSED 127.0.0.1:5432
```

**Рішення:**
```bash
# Перевірка статусу контейнера
docker compose ps

# Перезапуск БД
docker compose restart postgres

# Перевірка логів
docker logs skillklan-postgres

# Тестування підключення
docker exec -it skillklan-postgres psql -U skillklan_user -d skillklan_db -c "SELECT NOW();"
```

### 2. Таблиці не існують

**Симптоми:**
```
❌ relation "bot_users" does not exist
```

**Рішення:**
```bash
# Виконання SQL скриптів
docker exec -i skillklan-postgres psql -U skillklan_user -d skillklan_db < database/bot_tables.sql
docker exec -i skillklan-postgres psql -U skillklan_user -d skillklan_db < database/add_reminder_columns.sql

# Перевірка таблиць
docker exec -it skillklan-postgres psql -U skillklan_user -d skillklan_db -c "\dt"
```

### 3. Помилки з JSON полями

**Симптоми:**
```
❌ SyntaxError: Unexpected end of JSON input
```

**Рішення:**
```bash
# Очищення JSON полів
docker exec -it skillklan-postgres psql -U skillklan_user -d skillklan_db -c "UPDATE bot_users SET reminders_sent = '[]' WHERE reminders_sent IS NULL;"
```

## Проблеми з webhook

### 1. Webhook не відправляє повідомлення

**Симптоми:**
- Discord не отримує сповіщення
- Логи показують помилки webhook

**Діагностика:**
```bash
# Перевірка статусу webhook
curl http://localhost:3001/api/webhook/status

# Тестування webhook
curl -X POST http://localhost:3001/api/webhook/toggle -H "Content-Type: application/json" -d '{"enabled": true}'
```

**Рішення:**
1. Перевірити URL webhook в Discord
2. Перевірити налаштування в `.env`
3. Перевірити мережеве підключення
4. Перезапустити сервіси

### 2. Webhook повертає 404

**Симптоми:**
```
❌ 404 Not Found при виклику webhook API
```

**Рішення:**
```bash
# Перевірка маршрутів
curl http://localhost:3001/api/health

# Перевірка webhook ендпоінту
curl http://localhost:3001/webhook

# Перезапуск сервера
docker compose restart server
```

## Проблеми з Docker

### 1. Контейнери не запускаються

**Симптоми:**
```
❌ Container failed to start
```

**Діагностика:**
```bash
# Перевірка логів
docker compose logs

# Перевірка конфігурації
docker compose config

# Перевірка ресурсів
docker system df
```

**Рішення:**
1. Очистити Docker ресурси
2. Перебудувати образи
3. Перевірити конфігурацію
4. Перезапустити Docker daemon

### 2. Помилки з портами

**Симптоми:**
```
❌ Port 3001 is already in use
```

**Рішення:**
```bash
# Знайти процес, який використовує порт
lsof -i :3001

# Зупинити процес
kill -9 <PID>

# Або змінити порт в docker-compose.yml
```

### 3. Проблеми з volumes

**Симптоми:**
```
❌ Permission denied при доступі до volumes
```

**Рішення:**
```bash
# Змінити права доступу
sudo chown -R $USER:$USER ./server

# Або використати sudo для Docker
sudo docker compose up -d
```

## Проблеми з API

### 1. API не відповідає

**Симптоми:**
```
❌ curl: (7) Failed to connect to localhost port 3001: Connection refused
```

**Діагностика:**
```bash
# Перевірка статусу контейнерів
docker compose ps

# Перевірка логів сервера
docker logs skillklan-server

# Перевірка мережевих налаштувань
docker network ls
```

**Рішення:**
1. Перезапустити сервіси
2. Перевірити конфігурацію портів
3. Перевірити firewall налаштування

### 2. Помилки 500 Internal Server Error

**Симптоми:**
```
❌ 500 Internal Server Error при виклику API
```

**Діагностика:**
```bash
# Перевірка логів
docker logs skillklan-server --tail 100

# Перевірка змінних середовища
docker exec -it skillklan-server env | grep -E "(DB_|TELEGRAM_)"
```

**Рішення:**
1. Перевірити змінні середовища
2. Перевірити підключення до БД
3. Перевірити токен бота
4. Перезапустити сервіси

## Проблеми з FAQ Mini App

### 1. FAQ не відкривається

**Симптоми:**
- Користувач натискає кнопку FAQ, але нічого не відбувається
- Помилка в логах бота

**Діагностика:**
```bash
# Перевірка URL в налаштуваннях бота
grep WEBAPP_URL server/.env

# Тестування URL
curl -I https://skill-klan.github.io/new_onboarding/faq
```

**Рішення:**
1. Перевірити URL в `.env`
2. Перевірити налаштування GitHub Pages
3. Перевірити збірку Mini App

### 2. GitHub Pages не оновлюється

**Симптоми:**
- Зміни в коді не відображаються на сайті
- GitHub Actions не запускаються

**Рішення:**
1. Перевірити налаштування GitHub Pages
2. Перевірити GitHub Actions
3. Перевірити права доступу до репозиторію

## Проблеми з нагадуваннями

### 1. Нагадування не відправляються

**Симптоми:**
- Користувачі не отримують нагадування
- Cron job не працює

**Діагностика:**
```bash
# Перевірка cron job
docker exec -it skillklan-server ps aux | grep cron

# Перевірка нагадувань в БД
docker exec -it skillklan-postgres psql -U skillklan_user -d skillklan_db -c "SELECT * FROM bot_users WHERE task_sent = true;"
```

**Рішення:**
1. Перевірити налаштування cron
2. Перевірити часовий пояс
3. Перевірити логіку нагадувань

### 2. Неправильний розрахунок дедлайну

**Симптоми:**
- Нагадування відправляються в неправильний час
- Дедлайн розраховується невірно

**Рішення:**
1. Перевірити логіку розрахунку дедлайну
2. Перевірити часовий пояс
3. Перевірити дані в БД

## Загальні рекомендації

### Діагностика
1. **Завжди перевіряйте логи** - це найкращий спосіб діагностики
2. **Використовуйте health checks** - для перевірки стану сервісів
3. **Моніторьте ресурси** - CPU, RAM, диск
4. **Перевіряйте мережу** - підключення, порти, DNS

### Профілактика
1. **Регулярні backup** - бази даних та конфігурації
2. **Оновлення залежностей** - безпека та стабільність
3. **Моніторинг** - автоматичні алерти
4. **Тестування** - перед деплоєм на продакшн

### Відновлення
1. **Rollback план** - швидкий відкат при проблемах
2. **Backup стратегія** - регулярні знімки
3. **Документація** - покрокові інструкції
4. **Команда підтримки** - хто і коли може допомогти
