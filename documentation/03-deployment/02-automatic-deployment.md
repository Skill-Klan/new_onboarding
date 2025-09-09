# Автоматичний деплой

## Огляд

Система автоматичного деплою забезпечує безшовне розгортання змін з GitHub репозиторію на продакшн сервер з автоматичним перезапуском Docker контейнерів.

## Архітектура

```
GitHub Repository → Git Pull → Post-Merge Hook → Docker Restart → API Test
```

### Компоненти:

1. **GitHub Repository** - центральне сховище коду
2. **Git Hooks** - автоматичні скрипти при Git операціях
3. **Docker Compose** - контейнеризація додатку
4. **API Testing** - автоматична перевірка роботи після деплою

## Налаштування

### 1. Git Hooks

#### Локальний post-merge hook (`.git/hooks/post-merge`)
```bash
#!/bin/bash
# Автоматично перезапускає контейнери при merge з змінами в server/
```

#### Серверний post-merge hook (`.git/hooks/post-merge`)
```bash
#!/bin/bash
# Автоматично оновлює код та перезапускає контейнери при git pull
```

### 2. Docker Compose

Файл `docker-compose.yml` містить конфігурацію для:
- **PostgreSQL** - база даних
- **Server** - Node.js додаток
- **Nginx** - веб-сервер

### 3. GitHub Actions

Workflow `.github/workflows/deploy.yml` налаштований для:
- Автоматичного деплою при push в main
- SSH підключення до сервера
- Виконання скриптів деплою

## Процес деплою

### Автоматичний деплой

1. **Push в репозиторій**
   ```bash
   git add .
   git commit -m "Опис змін"
   git push origin main
   ```

2. **Git pull на сервері**
   ```bash
   ssh roman@192.168.88.121 "cd /home/roman/new_onboarding && git pull origin main"
   ```

3. **Автоматичне виконання hook**
   - Виявлення змін в `server/` або `docker-compose.yml`
   - Зупинка поточних контейнерів
   - Запуск нових контейнерів
   - Тестування API

### Ручний деплой

```bash
# Локально
./deploy.sh main 192.168.88.121 roman

# На сервері
cd /home/roman/new_onboarding
docker compose down
docker compose up -d
```

## Моніторинг

### Перевірка статусу

```bash
# Статус контейнерів
ssh roman@192.168.88.121 "cd /home/roman/new_onboarding && docker compose ps"

# Логи сервера
ssh roman@192.168.88.121 "cd /home/roman/new_onboarding && docker logs skillklan-server"

# Тест API
curl http://192.168.88.121:3001/api/health
```

### URL для тестування

- **API Health**: http://192.168.88.121:3001/api/health
- **Webhook Toggle**: http://192.168.88.121:3001/api/webhook/toggle
- **Frontend**: http://192.168.88.121:8080

## Troubleshooting

### Проблеми з деплоєм

1. **Hook не спрацьовує**
   ```bash
   # Перевірити права доступу
   ls -la .git/hooks/post-merge
   chmod +x .git/hooks/post-merge
   ```

2. **Контейнери не запускаються**
   ```bash
   # Перевірити логи
   docker logs skillklan-server
   docker logs skillklan-postgres
   ```

3. **API не відповідає**
   ```bash
   # Перевірити змінні середовища
   cat .env
   # Перевірити підключення до БД
   docker exec skillklan-postgres psql -U skillklan_user -d skillklan_db -c "SELECT 1;"
   ```

### Відновлення після помилок

```bash
# Повний перезапуск
ssh roman@192.168.88.121 "cd /home/roman/new_onboarding && docker compose down && docker compose up -d"

# Очищення Docker ресурсів
ssh roman@192.168.88.121 "cd /home/roman/new_onboarding && docker system prune -f"
```

## Безпека

### Змінні середовища

- `TELEGRAM_BOT_TOKEN` - токен Telegram бота
- `DISCORD_WEBHOOK_URL` - URL Discord webhook
- `DB_PASSWORD` - пароль бази даних

### SSH ключі

- Приватний ключ зберігається в GitHub Secrets
- Публічний ключ додано в GitHub Deploy Keys

## Логування

Всі операції деплою логуються з префіксами:
- 🔄 Початок операції
- ✅ Успішне виконання
- ❌ Помилка
- ⚠️ Попередження
- 🔍 Інформація

## Майбутні покращення

1. **Slack/Discord нотифікації** про статус деплою
2. **Rollback функціональність** для швидкого відкату
3. **Blue-Green деплой** для zero-downtime оновлень
4. **Автоматичне тестування** перед деплоєм
5. **Моніторинг здоров'я** додатку після деплою
