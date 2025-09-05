# Quick Start Guide - SkillKlan Telegram Bot

## 🚀 Швидкий старт

### 1. Передумови
- Node.js 16+ встановлений
- PostgreSQL 12+ встановлений
- Telegram Bot Token
- Discord Webhook URL (опціонально)

### 2. Клонування та встановлення
```bash
# Клонування репозиторію
git clone https://github.com/Skill-Klan/new_onboarding.git
cd new_onboarding/server

# Встановлення залежностей
npm install
```

### 3. Налаштування бази даних
```bash
# Створення бази даних
createdb skillklan_db

# Створення користувача
sudo -u postgres createuser skillklan_user
sudo -u postgres psql -c "ALTER USER skillklan_user PASSWORD 'your_password';"
sudo -u postgres psql -c "GRANT ALL PRIVILEGES ON DATABASE skillklan_db TO skillklan_user;"

# Виконання SQL скриптів
psql -d skillklan_db -f database/bot_tables.sql
psql -d skillklan_db -f database/add_reminder_columns.sql
```

### 4. Налаштування змінних середовища
```bash
# Копіювання прикладу конфігурації
cp env.example .env

# Редагування .env файлу
nano .env
```

**Вміст .env:**
```bash
TELEGRAM_BOT_TOKEN=your_bot_token_here
DB_HOST=localhost
DB_PORT=5432
DB_NAME=skillklan_db
DB_USER=skillklan_user
DB_PASSWORD=your_secure_password
PORT=3000
NODE_ENV=development
```

### 5. Генерація PDF завдань
```bash
node generate-pdfs.js
```

### 6. Запуск бота
```bash
# Локальний запуск
node server.js

# Або з автоматичним перезапуском
npx nodemon server.js
```

## 🧪 Тестування

### 1. Базове тестування
1. Відкрийте Telegram
2. Знайдіть свого бота
3. Натисніть `/start`
4. Пройдіть повний флоу:
   - Виберіть професію (QA або BA)
   - Натисніть "Я готовий спробувати"
   - Надайте контакт
   - Отримайте PDF завдання
   - Натисніть "Я готовий здати тестове завдання"

### 2. Перевірка логів
```bash
# Моніторинг логів в реальному часі
tail -f server.log

# Перевірка останніх логів
tail -20 server.log
```

### 3. Перевірка бази даних
```bash
# Підключення до БД
psql -d skillklan_db -U skillklan_user

# Перевірка користувачів
SELECT * FROM bot_users ORDER BY created_at DESC LIMIT 5;

# Перевірка контактів
SELECT * FROM bot_contacts ORDER BY created_at DESC LIMIT 5;
```

## 🔧 Налаштування Discord Webhook

### 1. Створення webhook
1. Відкрийте Discord сервер
2. Перейдіть в налаштування каналу
3. Виберіть "Integrations" → "Webhooks"
4. Натисніть "Create Webhook"
5. Скопіюйте URL webhook

### 2. Оновлення коду
Відкрийте `server/bot/services/WebhookService.js` та оновіть URL:
```javascript
this.webhookUrl = 'https://discord.com/api/webhooks/YOUR_WEBHOOK_URL_HERE';
```

### 3. Тестування webhook
```bash
# Запуск тестового скрипта
node -e "
const WebhookService = require('./bot/services/WebhookService');
const webhook = new WebhookService();
webhook.notifyUserStarted({
  telegramId: '123456789',
  username: 'testuser',
  firstName: 'Test',
  lastName: 'User'
});
"
```

## 🐳 Docker Deployment

### 1. Використання Docker Compose
```bash
# Запуск всіх сервісів
docker-compose up --build

# Запуск в фоновому режимі
docker-compose up -d --build

# Перевірка статусу
docker-compose ps

# Перегляд логів
docker-compose logs -f bot
```

### 2. Окремі контейнери
```bash
# Запуск PostgreSQL
docker run -d \
  --name postgres \
  -e POSTGRES_DB=skillklan_db \
  -e POSTGRES_USER=skillklan_user \
  -e POSTGRES_PASSWORD=your_password \
  -p 5432:5432 \
  postgres:13

# Запуск бота
docker build -t skillklan-bot .
docker run -d \
  --name bot \
  --link postgres:postgres \
  -e DB_HOST=postgres \
  -e TELEGRAM_BOT_TOKEN=your_token \
  skillklan-bot
```

## 📊 Моніторинг

### 1. Health Check
```bash
# Перевірка статусу API
curl http://localhost:3000/api/health

# Очікувана відповідь
{
  "status": "ok",
  "timestamp": "2025-09-03T21:00:00.000Z"
}
```

### 2. Перевірка процесів
```bash
# Перевірка запущених процесів
ps aux | grep "node server.js"

# Перевірка використання портів
netstat -tlnp | grep :3000
netstat -tlnp | grep :5432
```

### 3. Перевірка логів
```bash
# Системні логи
journalctl -u your-service-name -f

# Логи додатку
tail -f server.log

# Логи Docker
docker logs -f container-name
```

## 🚨 Troubleshooting

### Поширені проблеми

#### 1. Бот не відповідає
**Можливі причини:**
- Неправильний токен
- Бот заблокований
- Сервер не запущений

**Рішення:**
```bash
# Перевірка токена
echo $TELEGRAM_BOT_TOKEN

# Перевірка статусу сервера
curl http://localhost:3000/api/health

# Перезапуск сервера
pkill -f "node server.js"
node server.js
```

#### 2. Помилка підключення до БД
**Можливі причини:**
- PostgreSQL не запущений
- Неправильні налаштування
- Немає прав доступу

**Рішення:**
```bash
# Запуск PostgreSQL
sudo systemctl start postgresql

# Перевірка підключення
psql -h localhost -U skillklan_user -d skillklan_db

# Перевірка налаштувань
cat .env | grep DB_
```

#### 3. PDF файли не знайдені
**Можливі причини:**
- Файли не згенеровані
- Неправильний шлях
- Немає прав доступу

**Рішення:**
```bash
# Генерація PDF
node generate-pdfs.js

# Перевірка файлів
ls -la assets/tasks/

# Перевірка прав
chmod 644 assets/tasks/*.pdf
```

#### 4. Втрата SSH доступу до сервера
**Можливі причини:**
- SSH ключі видалені з `~/.ssh/authorized_keys`
- Змінені паролі користувачів
- Проблеми з мережею

**Швидке рішення через MikroTik RouterOS:**
```bash
# 1. Підключення до маршрутизатора
ssh -o KexAlgorithms=+diffie-hellman-group1-sha1 -o HostKeyAlgorithms=+ssh-dss admin@192.168.88.1

# 2. Підключення до сервера через маршрутизатор
/system ssh address=192.168.88.121 user=roman

# 3. Відновлення SSH ключів на сервері
mkdir -p ~/.ssh && chmod 700 ~/.ssh
echo "ssh-ed25519 AAAAC3NzaC1lZDI1NTE5AAAAIMmQ4GzK4AxoNxYH3txDJDZ2xANnDioJtqC4OC9gLX71 server_192.168.88.121" >> ~/.ssh/authorized_keys
chmod 600 ~/.ssh/authorized_keys

# 4. Тестування підключення
exit  # з сервера
exit  # з маршрутизатора
ssh -i ~/.ssh/id_ed25519_server_192 roman@192.168.88.121
```

**Детальна інструкція:** [ERRORS_AND_FIXES.md#відновлення-ssh-доступу](ERRORS_AND_FIXES.md#відновлення-ssh-доступу)

#### 5. Webhook не працює
**Можливі причини:**
- Неправильний URL
- Webhook видалений
- Немає прав до каналу

**Рішення:**
```bash
# Тестування webhook
curl -X POST "YOUR_WEBHOOK_URL" \
  -H "Content-Type: application/json" \
  -d '{"content": "Test message"}'

# Перевірка коду
grep -n "webhookUrl" bot/services/WebhookService.js
```

## 📈 Production Deployment

### 1. Налаштування production
```bash
# Оновлення .env для production
NODE_ENV=production
DB_HOST=your-production-db-host
DB_PASSWORD=your-secure-production-password
```

### 2. Використання PM2
```bash
# Встановлення PM2
npm install -g pm2

# Запуск з PM2
pm2 start server.js --name "skillklan-bot"

# Налаштування автозапуску
pm2 startup
pm2 save

# Моніторинг
pm2 status
pm2 logs skillklan-bot
```

### 3. Nginx конфігурація
```nginx
server {
    listen 80;
    server_name your-domain.com;
    
    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

### 4. SSL сертифікат
```bash
# Використання Let's Encrypt
sudo apt install certbot python3-certbot-nginx
sudo certbot --nginx -d your-domain.com
```

## 🔄 Backup та Recovery

### 1. Backup бази даних
```bash
# Створення backup
pg_dump -h localhost -U skillklan_user skillklan_db > backup_$(date +%Y%m%d_%H%M%S).sql

# Автоматичний backup (cron)
0 2 * * * pg_dump -h localhost -U skillklan_user skillklan_db > /backups/backup_$(date +\%Y\%m\%d_\%H\%M\%S).sql
```

### 2. Відновлення з backup
```bash
# Відновлення БД
psql -h localhost -U skillklan_user -d skillklan_db < backup_file.sql
```

### 3. Backup коду
```bash
# Створення архіву
tar -czf skillklan-bot-backup-$(date +%Y%m%d).tar.gz server/

# Відновлення
tar -xzf skillklan-bot-backup-YYYYMMDD.tar.gz
```

## 📚 Додаткові ресурси

### Корисні команди
```bash
# Перевірка версій
node --version
npm --version
psql --version

# Очищення npm кешу
npm cache clean --force

# Перевірка залежностей
npm audit
npm outdated

# Оновлення залежностей
npm update
```

### Корисні файли
- `package.json` - Залежності та скрипти
- `bot_flows.json` - Тексти та флоу
- `server.log` - Логи додатку
- `.env` - Змінні середовища
- `docker-compose.yml` - Docker конфігурація

### Підтримка
- GitHub Issues: [Створити issue](https://github.com/Skill-Klan/new_onboarding/issues)
- Документація: `docs/implementation/`
- Логи: `server.log`