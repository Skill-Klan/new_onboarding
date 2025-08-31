# 🐳 DOCKER КОНФІГУРАЦІЯ ДЛЯ SKILLKLAN

## 📋 ОПИС

Ця папка містить всю необхідну конфігурацію для запуску SkillKlan Mini App в Docker контейнерах.

## 🏗️ СТРУКТУРА

```
docker/
├── nginx/                    # Nginx конфігурація
│   ├── nginx.conf           # Основна конфігурація Nginx
│   ├── conf.d/              # Конфігурації сайтів
│   │   └── skillklan.conf   # Конфігурація для SkillKlan
│   └── ssl/                 # SSL сертифікати
│       └── generate-ssl.sh  # Скрипт генерації SSL
└── README.md                 # Цей файл
```

## 🚀 ШВИДКИЙ СТАРТ

### 1. **Підготовка (на локальній машині):**
```bash
# Клонування репозиторію
git clone <repository-url>
cd new_onboarding

# Створення SSL сертифікатів (опціонально)
cd docker/nginx/ssl
./generate-ssl.sh
cd ../../..
```

### 2. **Перенесення на сервер:**
```bash
# Копіювання на сервер
scp -r . user@37.57.209.201:/var/www/skillklan/
```

### 3. **Запуск на сервері:**
```bash
# Перехід в папку проекту
cd /var/www/skillklan

# Запуск всіх сервісів
docker-compose up -d

# Перевірка статусу
docker-compose ps
```

## 🔧 КОНФІГУРАЦІЯ

### **Сервіси:**
- **postgres**: PostgreSQL база даних
- **server**: Node.js API сервер
- **nginx**: Nginx веб-сервер

### **Порти:**
- **80**: HTTP (Nginx)
- **443**: HTTPS (Nginx, якщо SSL налаштовано)
- **3000**: API сервер (внутрішній)
- **5432**: PostgreSQL (внутрішній)

### **Томи:**
- **postgres_data**: Дані бази даних
- **server_logs**: Логи API сервера
- **server_data**: Дані API сервера
- **nginx_logs**: Логи Nginx

## 📝 КОРИСНІ КОМАНДИ

### **Управління сервісами:**
```bash
# Запуск
docker-compose up -d

# Зупинка
docker-compose down

# Перезапуск
docker-compose restart

# Оновлення
docker-compose pull && docker-compose up -d
```

### **Перегляд логів:**
```bash
# Всі сервіси
docker-compose logs -f

# Конкретний сервіс
docker-compose logs -f nginx
docker-compose logs -f server
docker-compose logs -f postgres
```

### **Вхід в контейнер:**
```bash
# Bash в контейнері
docker-compose exec server bash
docker-compose exec nginx sh
docker-compose exec postgres psql -U skillklan_user -d skillklan_db
```

## 🔐 SSL/HTTPS

### **Генерація сертифікатів:**
```bash
cd docker/nginx/ssl
./generate-ssl.sh
```

### **Активація HTTPS:**
1. Розкоментувати HTTPS блок в `nginx/conf.d/skillklan.conf`
2. Перезапустити Nginx: `docker-compose restart nginx`

## 🐛 ВИРІШЕННЯ ПРОБЛЕМ

### **Сервіс не запускається:**
```bash
# Перевірка логів
docker-compose logs <service-name>

# Перевірка статусу
docker-compose ps

# Перезапуск
docker-compose restart <service-name>
```

### **Проблеми з базою даних:**
```bash
# Перевірка підключення
docker-compose exec postgres pg_isready -U skillklan_user

# Вхід в базу
docker-compose exec postgres psql -U skillklan_user -d skillklan_db
```

### **Проблеми з Nginx:**
```bash
# Перевірка конфігурації
docker-compose exec nginx nginx -t

# Перезапуск
docker-compose restart nginx
```

## 📊 МОНІТОРИНГ

### **Health Checks:**
- **PostgreSQL**: `pg_isready`
- **Server**: `node healthcheck.js`
- **Nginx**: `wget` до `/health`

### **Логи:**
- **Nginx**: `/var/log/nginx/`
- **Server**: `/app/logs/`
- **PostgreSQL**: Docker logs

## 🔄 ОНОВЛЕННЯ

### **Код:**
```bash
git pull origin main
docker-compose build server
docker-compose up -d server
```

### **Конфігурація:**
```bash
# Оновлення Nginx конфігурації
docker-compose restart nginx

# Оновлення всіх сервісів
docker-compose down && docker-compose up -d
```

## ⚠️ ВАЖЛИВО

1. **НЕ ЗМІНЮВАТИ** конфігурацію без тестування
2. **ЗБЕРЕГТИ** резервні копії перед змінами
3. **ТЕСТУВАТИ** локально перед деплоєм
4. **МОНІТОРИТИ** логи після змін

## 📞 ПІДТРИМКА

При проблемах:
1. Перевірити логи: `docker-compose logs`
2. Перевірити статус: `docker-compose ps`
3. Перевірити конфігурацію
4. Звернутися до документації



