# 🚀 SkillKlan Server - Інструкція по розгортанню

## 📋 Передумови

- Сервер з Ubuntu 20.04+ або CentOS 8+
- Домен (для продакшну)
- SSH доступ до сервера
- Git репозиторій з кодом

## 🔧 Швидке налаштування

### 1. Клонування репозиторію
```bash
git clone git@github-other:Skill-Klan/new_onboarding.git
cd new_onboarding/server
```

### 2. Налаштування бази даних
```bash
chmod +x setup-database.sh
./setup-database.sh
```

### 3. Налаштування змінних середовища
```bash
cp config.env.example config.env
nano config.env
```

**Змініть в config.env:**
- `DB_PASSWORD` - безпечний пароль для бази даних
- `your-domain.com` - ваш домен
- `JWT_SECRET` - випадковий секретний ключ

### 4. Встановлення залежностей
```bash
npm install
```

### 5. Запуск сервера
```bash
npm start
```

## 🗄️ Налаштування бази даних

### Автоматичне налаштування
```bash
./setup-database.sh
```

### Ручне налаштування
```bash
# Встановлення PostgreSQL
sudo apt update
sudo apt install postgresql postgresql-contrib

# Створення користувача та бази
sudo -u postgres psql
CREATE USER skillklan_user WITH PASSWORD 'your_password';
CREATE DATABASE skillklan_db OWNER skillklan_user;
GRANT ALL PRIVILEGES ON DATABASE skillklan_db TO skillklan_user;
\q

# Створення таблиць
psql -h localhost -U skillklan_user -d skillklan_db -f database.sql
```

## 🌐 Налаштування Nginx

### 1. Встановлення Nginx
```bash
sudo apt install nginx
```

### 2. Копіювання конфігурації
```bash
sudo cp nginx.conf /etc/nginx/sites-available/skillklan
sudo ln -s /etc/nginx/sites-available/skillklan /etc/nginx/sites-enabled/
```

### 3. Налаштування SSL (Let's Encrypt)
```bash
sudo apt install certbot python3-certbot-nginx
sudo certbot --nginx -d your-domain.com
```

### 4. Перезапуск Nginx
```bash
sudo nginx -t
sudo systemctl restart nginx
```

## 📦 Управління процесами з PM2

### 1. Встановлення PM2
```bash
npm install -g pm2
```

### 2. Запуск з PM2
```bash
pm2 start ecosystem.config.js --env production
pm2 save
pm2 startup
```

### 3. Корисні команди PM2
```bash
pm2 list                    # Список процесів
pm2 logs skillklan-server   # Логи
pm2 restart skillklan-server # Перезапуск
pm2 stop skillklan-server   # Зупинка
```

## 🔍 Перевірка роботи

### Тест API
```bash
# Health check
curl http://localhost:3000/api/health

# Тест бази даних
curl http://localhost:3000/api/db-test
```

### Перевірка логів
```bash
# Логи сервера
tail -f logs/server.log

# Логи Nginx
sudo tail -f /var/log/nginx/skillklan_access.log
sudo tail -f /var/log/nginx/skillklan_error.log
```

## 🚀 Розгортання на продакшн

### 1. Автоматичне розгортання
```bash
pm2 deploy production setup
pm2 deploy production
```

### 2. Ручне розгортання
```bash
git pull origin main
npm install --production
pm2 reload ecosystem.config.js --env production
```

## 🔐 Безпека

### Firewall
```bash
sudo ufw allow 22    # SSH
sudo ufw allow 80    # HTTP
sudo ufw allow 443   # HTTPS
sudo ufw enable
```

### SSL/TLS
- Використовуйте Let's Encrypt для безкоштовних сертифікатів
- Налаштуйте автоматичне оновлення сертифікатів
- Використовуйте HSTS заголовки

### База даних
- Змініть стандартний пароль PostgreSQL
- Обмежте доступ до бази даних тільки з localhost
- Регулярно створюйте резервні копії

## 📊 Моніторинг

### Логи
- Логи сервера: `logs/`
- Логи Nginx: `/var/log/nginx/`
- Логи PM2: `pm2 logs`

### Метрики
```bash
pm2 monit          # Моніторинг PM2
htop               # Системні ресурси
df -h              # Дисковий простір
free -h            # Пам'ять
```

## 🆘 Вирішення проблем

### Сервер не запускається
```bash
# Перевірка логів
pm2 logs skillklan-server

# Перевірка конфігурації
node -c server.js

# Перевірка змінних середовища
cat config.env
```

### Проблеми з базою даних
```bash
# Перевірка підключення
psql -h localhost -U skillklan_user -d skillklan_db

# Перевірка статусу PostgreSQL
sudo systemctl status postgresql
```

### Проблеми з Nginx
```bash
# Перевірка конфігурації
sudo nginx -t

# Перезапуск
sudo systemctl restart nginx
```

## 📞 Підтримка

При проблемах:
1. Перевірте логи
2. Перевірте статус сервісів
3. Перевірте конфігурацію
4. Зверніться до документації

## 🔄 Оновлення

### Оновлення коду
```bash
git pull origin main
npm install
pm2 reload skillklan-server
```

### Оновлення залежностей
```bash
npm update
pm2 restart skillklan-server
```
