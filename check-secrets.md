# 🔍 Чек-лист перевірки GitHub Secrets

## 📋 Необхідні Secrets для SkillKlan

### **✅ Обов'язкові Secrets (мають бути додані):**

| Secret Name | Value | Статус |
|-------------|-------|---------|
| `SSH_PRIVATE_KEY` | Вміст `~/.ssh/id_ed25519_skillklan_local` | ⏳ Перевірити |
| `SERVER_HOST` | `37.57.209.201` | ⏳ Перевірити |
| `SERVER_USER` | `roman` | ⏳ Перевірити |
| `SSH_PORT` | `2222` | ⏳ Перевірити |
| `API_URL_STAGING` | `https://37.57.209.201/api` | ⏳ Перевірити |
| `API_URL_PRODUCTION` | `https://37.57.209.201/api` | ⏳ Перевірити |

## 🚀 Як перевірити

### **1. Перейдіть в GitHub репозиторій:**
```
Settings → Secrets and variables → Actions
```

### **2. Перевірте наявність всіх Secrets:**
- ✅ `SSH_PRIVATE_KEY` - має бути додано
- ✅ `SERVER_HOST` - має бути `37.57.209.201`
- ✅ `SERVER_USER` - має бути `roman`
- ✅ `SSH_PORT` - має бути `2222`
- ✅ `API_URL_STAGING` - має бути `https://37.57.209.201/api`
- ✅ `API_URL_PRODUCTION` - має бути `https://37.57.209.201/api`

### **3. Запустіть тестовий workflow:**
```
Actions → Test GitHub Secrets → Run workflow
Test Type: all
```

## 🧪 Тестування після налаштування

### **Крок 1: Запуск тестового workflow**
1. Перейдіть в `Actions` вкладку
2. Знайдіть `🧪 Test GitHub Secrets`
3. Натисніть `Run workflow`
4. Виберіть `test_type: all`
5. Натисніть `Run workflow`

### **Крок 2: Перевірка результатів**
- ✅ SSH Connection: має бути успішним
- ✅ Health Check: має пройти всі тести
- ✅ Server Status: має показати статус сервера

### **Крок 3: Перевірка логів**
- Якщо є помилки → перевірте назви секретів
- Якщо є проблеми з SSH → перевірте SSH_PRIVATE_KEY
- Якщо є проблеми з підключенням → перевірте SERVER_HOST та SERVER_USER

## 🚨 Поширені проблеми

### **1. "Secret not found"**
- Перевірте назви секретів (мають точно співпадати)
- Переконайтеся, що секрети додані в правильний репозиторій

### **2. "Permission denied (publickey)"**
- Перевірте SSH_PRIVATE_KEY (має включати BEGIN та END рядки)
- Переконайтеся, що ключ додано в authorized_keys на сервері

### **3. "Connection refused"**
- Перевірте SERVER_HOST та SSH_PORT
- Переконайтеся, що сервер доступний

## 🎯 Наступні кроки після успішного тестування

1. **Запуск Manual Deploy workflow**
2. **Тестування Smart Deploy**
3. **Налаштування автоматичного деплою**
4. **Моніторинг та алерти**

---

**💡 Порада**: Перевірте всі секрети перед запуском основних workflows!
