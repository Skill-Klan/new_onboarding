# 🐳 ГІД ПО МІГРАЦІЇ НА DOCKER (СЕРВЕР)

## 📋 ОПИС

Цей гід описує покроковий процес міграції SkillKlan Mini App з PM2 на Docker на сервері `37.57.209.201`.

## ⚠️ ВАЖЛИВО ПЕРЕД ПОЧАТКОМ

1. **Зробіть резервну копію** поточного стану сервера
2. **Переконайтеся**, що у вас є SSH доступ до сервера
3. **Не виконуйте** команди без розуміння їх дії
4. **Тестуйте** кожен крок окремо

## 🚀 КРОК 1: ПІДГОТОВКА СЕРВЕРА

### **1.1 Підключення до сервера:**
```bash
ssh -p 2222 roman@37.57.209.201
```

### **1.2 Перевірка поточного стану:**
```bash
# Перевірка PM2 процесів
pm2 status

# Перевірка системних сервісів
sudo systemctl status nginx
sudo systemctl status postgresql

# Перевірка поточних портів
sudo netstat -tlnp | grep -E ":(80|443|3000|5432)"
```

### **1.3 Створення резервної копії:**
```bash
cd /var/www/skillklan

# Створення резервної копії
sudo mkdir -p backup_pm2_$(date +%Y%m%d_%H%M%S)
sudo cp -r server backup_pm2_$(date +%Y%m%d_%H%M%S)/
sudo cp -r public backup_pm2_$(date +%Y%m%d_%H%M%S)/ 2>/dev/null || echo "No public directory"
sudo cp ecosystem.config.js backup_pm2_$(date +%Y%m%d_%H%M%S)/ 2>/dev/null || echo "No ecosystem.config.js"
```

## 🐳 КРОК 2: ВСТАНОВЛЕННЯ DOCKER

### **2.1 Встановлення Docker:**
```bash
# Оновлення пакетів
sudo apt update

# Встановлення необхідних пакетів
sudo apt install -y apt-transport-https ca-certificates curl gnupg lsb-release

# Додавання Docker GPG ключа
curl -fsSL https://download.docker.com/linux/ubuntu/gpg | sudo gpg --dearmor -o /usr/share/keyrings/docker-archive-keyring.gpg

# Додавання Docker репозиторію
echo "deb [arch=amd64 signed-by=/usr/share/keyrings/docker-archive-keyring.gpg] https://download.docker.com/linux/ubuntu $(lsb_release -cs) stable" | sudo tee /etc/apt/sources.list.d/docker.list > /dev/null

# Встановлення Docker
sudo apt update
sudo apt install -y docker-ce docker-ce-cli containerd.io docker-compose-plugin

# Додавання користувача в групу docker
sudo usermod -aG docker $USER

# Запуск Docker сервісу
sudo systemctl start docker
sudo systemctl enable docker

# Перевірка встановлення
docker --version
docker-compose --version
```

### **2.2 Перезавантаження сесії:**
```bash
# Вихід з SSH
exit

# Повторне підключення
ssh -p 2222 roman@37.57.209.201

# Перевірка груп
groups
```

## 📦 КРОК 3: ПІДГОТОВКА ПРОЕКТУ

### **3.1 Створення структури папок:**
```bash
cd /var/www/skillklan

# Створення директорій для Docker
mkdir -p docker/nginx/conf.d docker/nginx/ssl logs backups

# Створення директорії для frontend
mkdir -p public
```

### **3.2 Копіювання файлів проекту:**
```bash
# Якщо файли вже є в репозиторії
git pull origin main

# Або копіювання з локальної машини (виконати на локальній машині):
# scp -r -P 2222 docker/ roman@37.57.209.201:/var/www/skillklan/
# scp -r -P 2222 docker-compose.yml roman@37.57.209.201:/var/www/skillklan/
# scp -r -P 2222 docker-*.sh roman@37.57.209.201:/var/www/skillklan/
```

### **3.3 Налаштування прав доступу:**
```bash
# Встановлення правильних прав
sudo chown -R roman:roman /var/www/skillklan
chmod +x docker-*.sh

# Створення директорій для логів
mkdir -p logs
```

## 🔐 КРОК 4: НАЛАШТУВАННЯ SSL

### **4.1 Генерація SSL сертифікатів:**
```bash
cd /var/www/skillklan/docker/nginx/ssl

# Генерація самопідписаних сертифікатів
./generate-ssl.sh

# Перевірка створених файлів
ls -la
```

### **4.2 Активація HTTPS (опціонально):**
```bash
# Розкоментувати HTTPS блок в nginx/conf.d/skillklan.conf
# Видалити # перед server блоком для порту 443
```

## 🚀 КРОК 5: ЗАПУСК DOCKER СЕРВІСІВ

### **5.1 Перший запуск:**
```bash
cd /var/www/skillklan

# Перевірка конфігурації
docker-compose config

# Зупинка поточних сервісів
sudo systemctl stop nginx
sudo systemctl stop postgresql
pm2 stop all

# Запуск Docker сервісів
./docker-deploy.sh deploy
```

### **5.2 Перевірка статусу:**
```bash
# Статус контейнерів
docker-compose ps

# Логи сервісів
docker-compose logs -f

# Перевірка портів
sudo netstat -tlnp | grep -E ":(80|443|3000|5432)"
```

## 🧪 КРОК 6: ТЕСТУВАННЯ

### **6.1 Тестування API:**
```bash
# Health check
curl http://localhost:3000/api/health

# Тест бази даних
curl http://localhost:3000/api/db-test
```

### **6.2 Тестування Frontend:**
```bash
# Перевірка головної сторінки
curl http://localhost/

# Перевірка статичних файлів
curl http://localhost/health
```

### **6.3 Тестування зовнішнього доступу:**
```bash
# З іншої машини
curl http://37.57.209.201/
curl http://37.57.209.201/api/health
```

## 🔄 КРОК 7: МІГРАЦІЯ ДАНИХ

### **7.1 Експорт поточної бази даних:**
```bash
# Створення резервної копії поточної БД
sudo -u postgres pg_dump skillklan_db > backup_db_$(date +%Y%m%d_%H%M%S).sql

# Стиснення
gzip backup_db_*.sql
```

### **7.2 Імпорт в Docker контейнер:**
```bash
# Копіювання SQL файлу в контейнер
docker cp backup_db_*.sql.gz skillklan-postgres:/tmp/

# Розпакування та імпорт
docker exec -it skillklan-postgres bash
gunzip /tmp/backup_db_*.sql.gz
psql -U skillklan_user -d skillklan_db < /tmp/backup_db_*.sql
exit
```

## 📊 КРОК 8: МОНІТОРИНГ ТА УПРАВЛІННЯ

### **8.1 Корисні команди:**
```bash
# Статус сервісів
./docker-monitor.sh status

# Моніторинг ресурсів
./docker-monitor.sh resources

# Повний моніторинг
./docker-monitor.sh monitor

# Створення звіту
./docker-monitor.sh report
```

### **8.2 Управління сервісами:**
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

## 🆘 КРОК 9: ВИРІШЕННЯ ПРОБЛЕМ

### **9.1 Поширені проблеми:**

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

### **9.2 Відкат до PM2:**
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

## ✅ КРОК 10: ЗАВЕРШЕННЯ МІГРАЦІЇ

### **10.1 Перевірка всіх сервісів:**
```bash
# Фінальна перевірка
./docker-monitor.sh monitor

# Тестування зовнішнього доступу
curl -I http://37.57.209.201/
curl -I http://37.57.209.201/api/health
```

### **10.2 Налаштування автозапуску:**
```bash
# Docker автозапуск вже налаштований
# Перевірка
sudo systemctl status docker
```

### **10.3 Очищення:**
```bash
# Видалення старих образів
docker image prune -f

# Видалення невикористовуваних томів
docker volume prune -f
```

## 📋 КОНТРОЛЬНИЙ СПИСОК

- [ ] Резервна копія створена
- [ ] Docker встановлено
- [ ] Файли проекту скопійовано
- [ ] SSL сертифікати згенеровано
- [ ] Docker сервіси запущено
- [ ] Тестування пройдено
- [ ] Дані мігровано
- [ ] Моніторинг налаштовано
- [ ] Зовнішній доступ працює

## 🆘 ПІДТРИМКА

При проблемах:
1. Перевірте логи: `docker-compose logs`
2. Перевірте статус: `docker-compose ps`
3. Використайте моніторинг: `./docker-monitor.sh`
4. Зверніться до документації Docker

## 🎯 НАСТУПНІ КРОКИ

Після успішної міграції:
1. Налаштуйте регулярні резервні копії
2. Налаштуйте моніторинг та алерти
3. Оптимізуйте Docker образи
4. Налаштуйте CI/CD для автоматичного деплою

---

**Успішної міграції! 🚀**



