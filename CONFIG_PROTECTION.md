# 🔒 Захист конфігураційних файлів

## ⚠️ ВАЖЛИВО: НЕ РЕДАГУЙТЕ ЦІ ФАЙЛИ!

### 🚫 Заблоковані файли:

1. **`server/.env`** - Змінні середовища (токени, паролі)
2. **`server/config/webhook.config.js`** - Конфігурація webhook
3. **`server/config/production.config.js`** - Продакшн конфігурація

### 🛡️ Захист:

- ✅ Файли додані в `.gitignore`
- ✅ Автоматичне відновлення при деплої
- ✅ Резервні копії на сервері

### 🔧 Якщо потрібно змінити конфігурацію:

1. **Змінні середовища:**
   ```bash
   # На сервері
   ssh roman@192.168.88.121 "cd /home/roman/new_onboarding && nano .env"
   ```

2. **Webhook конфігурація:**
   ```bash
   # На сервері
   ssh roman@192.168.88.121 "cd /home/roman/new_onboarding && nano server/config/webhook.config.js"
   ```

3. **Перезапуск після змін:**
   ```bash
   ssh roman@192.168.88.121 "cd /home/roman/new_onboarding && docker compose restart"
   ```

### 📋 Список захищених файлів:

- `server/.env` - Токени та паролі
- `server/config/webhook.config.js` - Discord webhook
- `server/config/production.config.js` - Продакшн налаштування
- `docker-compose.yml` - Docker конфігурація
- `deploy.sh` - Скрипт деплою

### ⚡ Швидкий доступ:

```bash
# Переглянути конфігурацію
ssh roman@192.168.88.121 "cd /home/roman/new_onboarding && cat .env"

# Редагувати конфігурацію
ssh roman@192.168.88.121 "cd /home/roman/new_onboarding && nano .env"

# Перезапустити сервіси
ssh roman@192.168.88.121 "cd /home/roman/new_onboarding && docker compose restart"
```

---
**Дата створення:** 2025-09-09  
**Статус:** Активний захист  
**Версія:** 1.0
