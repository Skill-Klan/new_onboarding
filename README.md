# 🚀 SkillKlan Mini App - Docker Edition

## 📋 ОПИС

SkillKlan Mini App - це Telegram Mini App для управління навичками та талантами. Проект повністю мігровано на Docker для кращої масштабованості та управління.

## 🐳 DOCKER АРХІТЕКТУРА

### **Сервіси:**
- **postgres**: PostgreSQL база даних (порт 5432)
- **server**: Node.js API сервер (порт 3000)
- **nginx**: Nginx веб-сервер (порти 80, 443)

### **Томи:**
- **postgres_data**: Дані бази даних
- **server_logs**: Логи API сервера
- **server_data**: Дані API сервера
- **nginx_logs**: Логи Nginx

## 🚀 ШВИДКИЙ СТАРТ

### **1. Клонування репозиторію:**
```bash
git clone <repository-url>
cd new_onboarding
```

### **2. Копіювання на сервер:**
```bash
# Автоматичне копіювання всіх файлів
./copy-to-server.sh

# Або ручне копіювання
scp -r -P 2222 . roman@37.57.209.201:/var/www/skillklan/
```

### **3. Запуск на сервері:**
```bash
# Підключення до сервера
ssh -p 2222 roman@37.57.209.201

# Перехід в папку проекту
cd /var/www/skillklan

# Запуск всіх сервісів
./docker-deploy.sh deploy
```

## 📁 СТРУКТУРА ПРОЕКТУ

```
new_onboarding/
├── .github/workflows/          # GitHub Actions для CI/CD
│   ├── smart-deploy.yml       # Автоматичний Docker деплой
│   ├── manual-deploy.yml      # Ручний Docker деплой
│   └── test-and-validate.yml  # Тестування та валідація
├── server/                     # Backend API сервер
│   ├── Dockerfile             # Docker образ для сервера
│   ├── .dockerignore          # Docker ігнорування
│   ├── healthcheck.js         # Health check для Docker
│   ├── server.js              # Основна логіка API
│   ├── package.json           # Залежності сервера
│   └── config.env             # Конфігурація середовища
├── miniapp/                    # Frontend Mini App
│   ├── src/                   # Vue.js компоненти
│   ├── package.json           # Залежності frontend
│   └── vite.config.ts         # Vite конфігурація
├── docker/                     # Docker конфігурація
│   ├── nginx/                 # Nginx налаштування
│   │   ├── nginx.conf         # Основна конфігурація
│   │   ├── conf.d/            # Конфігурації сайтів
│   │   └── ssl/               # SSL сертифікати
│   └── README.md              # Docker документація
├── docker-compose.yml          # Оркестрація контейнерів
├── docker-deploy.sh            # Скрипт деплою
├── docker-backup.sh            # Скрипт резервного копіювання
├── docker-monitor.sh           # Скрипт моніторингу
├── copy-to-server.sh           # Скрипт копіювання на сервер
├── DOCKER_MIGRATION_GUIDE.md   # Гід по міграції
└── README.md                   # Цей файл
```

## 🔧 НАЛАШТУВАННЯ

### **Локальна розробка:**
```bash
# Backend
cd server
npm install
npm run dev

# Frontend
cd miniapp
npm install
npm run dev
```

### **Docker розробка:**
```bash
# Запуск всіх сервісів
docker-compose up -d

# Перегляд логів
docker-compose logs -f

# Зупинка
docker-compose down
```

## 🚀 ДЕПЛОЙ

### **Автоматичний деплой (GitHub Actions):**
- Push в `main` або `develop` гілки автоматично запускає деплой
- Розумна аналіза змін для часткового деплою
- Автоматичні health checks та відкат при невдачі

### **Ручний деплой:**
```bash
# На сервері
cd /var/www/skillklan
./docker-deploy.sh deploy

# Або через GitHub Actions
# Actions -> Manual Deploy -> Run workflow
```

### **Копіювання файлів на сервер:**
```bash
# Автоматичне копіювання
./copy-to-server.sh

# Перевірка файлів
./copy-to-server.sh --check

# Перевірка на сервері
./copy-to-server.sh --verify
```

## 📊 МОНІТОРИНГ

### **Перегляд статусу:**
```bash
# Статус контейнерів
./docker-monitor.sh status

# Моніторинг ресурсів
./docker-monitor.sh resources

# Повний моніторинг
./docker-monitor.sh monitor

# Створення звіту
./docker-monitor.sh report
```

### **Управління сервісами:**
```bash
# Перезапуск
docker-compose restart

# Оновлення
docker-compose pull && docker-compose up -d

# Зупинка
docker-compose down

# Логи
docker-compose logs -f [service_name]
```

## 💾 РЕЗЕРВНЕ КОПІЮВАННЯ

### **Автоматичне резервне копіювання:**
```bash
# Створення резервної копії
./docker-backup.sh backup

# Перегляд статистики
./docker-backup.sh stats

# Відновлення
./docker-backup.sh restore [filename]

# Очищення старих файлів
./docker-backup.sh cleanup
```

## 🔐 SSL/HTTPS

### **Генерація сертифікатів:**
```bash
cd docker/nginx/ssl
./generate-ssl.sh
```

### **Активація HTTPS:**
1. Розкоментувати HTTPS блок в `docker/nginx/conf.d/skillklan.conf`
2. Перезапустити Nginx: `docker-compose restart nginx`

## 🆘 ВИРІШЕННЯ ПРОБЛЕМ

### **Поширені проблеми:**

#### **Контейнер не запускається:**
```bash
# Перевірка логів
docker-compose logs [service_name]

# Перевірка конфігурації
docker-compose config

# Перезапуск
docker-compose restart [service_name]
```

#### **Проблеми з базою даних:**
```bash
# Перевірка підключення
docker-compose exec postgres pg_isready -U skillklan_user

# Вхід в базу
docker-compose exec postgres psql -U skillklan_user -d skillklan_db
```

#### **Проблеми з Nginx:**
```bash
# Перевірка конфігурації
docker-compose exec nginx nginx -t

# Перезапуск
docker-compose restart nginx
```

### **Відкат до PM2:**
```bash
# Зупинка Docker
docker-compose down

# Відновлення PM2
cd server
pm2 start ecosystem.config.js --env production

# Запуск системних сервісів
sudo systemctl start nginx
sudo systemctl start postgresql
```

## 📋 КОНТРОЛЬНИЙ СПИСОК ДЕПЛОЮ

- [ ] Файли скопійовано на сервер
- [ ] Docker встановлено на сервері
- [ ] Конфігурація налаштована
- [ ] SSL сертифікати згенеровано
- [ ] Docker сервіси запущено
- [ ] Health checks пройдені
- [ ] Зовнішній доступ працює
- [ ] Моніторинг налаштовано

## 🎯 НАСТУПНІ КРОКИ

Після успішного деплою:
1. Налаштуйте регулярні резервні копії
2. Налаштуйте моніторинг та алерти
3. Оптимізуйте Docker образи
4. Налаштуйте CI/CD для автоматичного деплою

## 📞 ПІДТРИМКА

При проблемах:
1. Перевірте логи: `docker-compose logs`
2. Перевірте статус: `docker-compose ps`
3. Використайте моніторинг: `./docker-monitor.sh`
4. Зверніться до документації Docker
5. Перегляньте `DOCKER_MIGRATION_GUIDE.md`

## 🔗 КОРИСНІ ПОСИЛАННЯ

- [Docker Documentation](https://docs.docker.com/)
- [Docker Compose](https://docs.docker.com/compose/)
- [Nginx Documentation](https://nginx.org/en/docs/)
- [PostgreSQL Documentation](https://www.postgresql.org/docs/)
- [Vue.js Documentation](https://vuejs.org/guide/)

---

**SkillKlan Mini App - Тепер з Docker! 🐳🚀**


