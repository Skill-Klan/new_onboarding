# 🧪 Тестування GitHub Actions для SkillKlan

## 🚀 Швидка інструкція

### **1. Перейдіть в GitHub репозиторій:**
```
https://github.com/Skill-Klan/new_onboarding
```

### **2. Запустіть тестовий workflow:**
1. **Actions** вкладка
2. Знайдіть **🧪 Test GitHub Secrets**
3. **Run workflow**
4. **test_type**: `all`
5. **Run workflow**

### **3. Очікувані результати:**
- ✅ **SSH Connection**: Підключення до сервера
- ✅ **Health Check**: API та фронтенд працюють
- ✅ **Server Status**: Статус сервера показано

### **4. Якщо є помилки:**
- Перевірте **GitHub Secrets** в `Settings → Secrets and variables → Actions`
- Переконайтеся, що всі секрети додані
- Перевірте логи workflow для деталей

---

## 📋 Необхідні GitHub Secrets

| Secret | Value |
|--------|-------|
| `SSH_PRIVATE_KEY` | SSH ключ з `~/.ssh/id_ed25519_skillklan_local` |
| `SERVER_HOST` | `37.57.209.201` |
| `SERVER_USER` | `roman` |
| `SSH_PORT` | `2222` |
| `API_URL_STAGING` | `https://37.57.209.201/api` |
| `API_URL_PRODUCTION` | `https://37.57.209.201/api` |

---

## 🎯 Після успішного тестування

1. **Запустіть Manual Deploy** для тестування деплою
2. **Протестуйте Smart Deploy** для автоматичного деплою
3. **Налаштуйте автоматичні деплої** при push в main

---

**💡 Порада**: Запустіть тестовий workflow зараз для перевірки!
