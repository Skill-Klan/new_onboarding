# 🔒 Безпека та захист чутливої інформації

## ⚠️ Важливо!

**НІКОЛИ не зберігайте чутливу інформацію в коді або документації!**

## 🚨 Що НЕ можна публікувати

### Заборонено в репозиторії:
- **API ключі** (Telegram Bot Token, Discord Webhook URL)
- **Паролі** (база даних, адміністраторські)
- **Приватні ключі** (SSH, SSL сертифікати)
- **Токени доступу** (OAuth, JWT)
- **URL з секретами** (webhook з токенами)
- **Конфігураційні файли** з реальними даними

### Приклади НЕПРАВИЛЬНОГО:
```javascript
// ❌ НІКОЛИ не робіть так!
const botToken = '7239298348:AAG3XbhNRGRzRR7IsQorlDOnyIngCDWKJRU';
const webhookUrl = 'https://discord.com/api/webhooks/1412903925694332998/XDyrZ3asQ80y_NAdv_3lErNylvFUTru2pjZyzpjAm38XLs102DQ-LnUEZXNiPtmUuPWm';
```

### Приклади ПРАВИЛЬНОГО:
```javascript
// ✅ Правильно - використовуйте змінні середовища
const botToken = process.env.TELEGRAM_BOT_TOKEN;
const webhookUrl = process.env.DISCORD_WEBHOOK_URL || 'https://discord.com/api/webhooks/YOUR_WEBHOOK_ID/YOUR_WEBHOOK_TOKEN';
```

## 🛡️ Як захистити чутливу інформацію

### 1. Використовуйте змінні середовища
```bash
# .env файл (НЕ комітити в git!)
TELEGRAM_BOT_TOKEN=your_real_token_here
DISCORD_WEBHOOK_URL=your_real_webhook_url_here
DB_PASSWORD=your_real_password_here
```

### 2. Додайте в .gitignore
```gitignore
# Environment variables
.env
.env.local
.env.production

# Sensitive files
config/secrets.js
**/private/
**/secrets/
```

### 3. Використовуйте placeholder'и в коді
```javascript
// Замість реальних даних
const config = {
  webhookUrl: process.env.DISCORD_WEBHOOK_URL || 'https://discord.com/api/webhooks/YOUR_WEBHOOK_ID/YOUR_WEBHOOK_TOKEN',
  botToken: process.env.TELEGRAM_BOT_TOKEN || 'YOUR_BOT_TOKEN_HERE'
};
```

### 4. Документація з прикладами
```markdown
<!-- В документації використовуйте placeholder'и -->
```env
TELEGRAM_BOT_TOKEN=your_bot_token_here
DISCORD_WEBHOOK_URL=your_discord_webhook_url_here
```
```

## 🔍 Як перевірити безпеку

### 1. Пошук чутливої інформації
```bash
# Пошук токенів (20+ символів)
grep -r "[A-Za-z0-9]\{20,\}" . --exclude-dir=node_modules

# Пошук паролів
grep -r "password.*=" . --exclude-dir=node_modules

# Пошук URL з токенами
grep -r "webhooks/[A-Za-z0-9]" . --exclude-dir=node_modules
```

### 2. Перевірка .gitignore
```bash
# Перевірте, чи .env файли ігноруються
git check-ignore .env
git check-ignore server/.env
```

### 3. Перевірка історії git
```bash
# Пошук в історії комітів
git log --all --full-history -- "**/.env"
git log --all --full-history -- "**/secrets"
```

## 🚨 Що робити, якщо випадково опублікували секрети

### 1. Негайно змініть секрети
- Змініть всі паролі та токени
- Створіть нові API ключі
- Оновіть webhook URL

### 2. Видаліть з історії git
```bash
# Видалення файлу з історії
git filter-branch --force --index-filter \
  'git rm --cached --ignore-unmatch server/.env' \
  --prune-empty --tag-name-filter cat -- --all

# Примусовий push (ОБЕРЕЖНО!)
git push origin --force --all
```

### 3. Використовуйте git-secrets
```bash
# Встановлення git-secrets
git secrets --install
git secrets --register-aws
git secrets --add '.*[A-Za-z0-9]{20,}.*'
```

## 📋 Чек-лист безпеки

### Перед кожним комітом:
- [ ] Перевірити, чи немає реальних токенів
- [ ] Перевірити, чи .env файли в .gitignore
- [ ] Перевірити, чи немає паролів в коді
- [ ] Перевірити, чи немає URL з секретами

### Перед публікацією:
- [ ] Запустити пошук чутливої інформації
- [ ] Перевірити .gitignore
- [ ] Перевірити документацію на placeholder'и
- [ ] Перевірити конфігураційні файли

### Регулярно:
- [ ] Оновлювати секрети
- [ ] Перевіряти доступ до репозиторію
- [ ] Моніторити використання API ключів
- [ ] Оновлювати .gitignore

## 🔧 Інструменти для безпеки

### 1. git-secrets
```bash
# Встановлення
git secrets --install

# Додавання правил
git secrets --add '.*[A-Za-z0-9]{20,}.*'
git secrets --add 'password.*=.*[^=]'
```

### 2. pre-commit hooks
```bash
# .git/hooks/pre-commit
#!/bin/bash
if grep -r "[A-Za-z0-9]\{20,\}" . --exclude-dir=node_modules; then
  echo "❌ Знайдено можливі секрети!"
  exit 1
fi
```

### 3. GitHub Secrets
- Використовуйте GitHub Secrets для CI/CD
- Не зберігайте секрети в коді
- Використовуйте змінні середовища

## 📚 Додаткові ресурси

- [GitHub Security Best Practices](https://docs.github.com/en/code-security)
- [OWASP Secrets Management](https://owasp.org/www-project-secrets-management/)
- [Git Secrets Management](https://git-scm.com/book/en/v2/Git-Tools-Signing-Your-Work)

## ⚠️ Пам'ятайте

**Безпека - це не одноразова дія, а постійний процес!**

- Регулярно перевіряйте репозиторій
- Оновлюйте секрети
- Навчайте команду правилам безпеки
- Використовуйте автоматизацію для перевірок
