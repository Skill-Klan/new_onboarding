# Швидкий гід налаштування автоматичного деплою

## Передумови

- Сервер з Docker та Docker Compose
- SSH доступ до сервера
- GitHub репозиторій з кодом
- Git налаштований на сервері

## Крок 1: Налаштування сервера

### 1.1 Клонування репозиторію
```bash
ssh roman@192.168.88.121
cd /home/roman
git clone git@github.com:Skill-Klan/new_onboarding.git
cd new_onboarding
```

### 1.2 Налаштування SSH ключів
```bash
# Генерація SSH ключа
ssh-keygen -t ed25519 -C "roman@skillklan.com"

# Додавання в GitHub
cat ~/.ssh/id_ed25519.pub
# Скопіювати та додати в GitHub Deploy Keys
```

### 1.3 Налаштування Git
```bash
git config user.name "Roman"
git config user.email "roman@skillklan.com"
git remote set-url origin git@github.com:Skill-Klan/new_onboarding.git
```

## Крок 2: Встановлення Docker

### 2.1 Docker Compose
```bash
# Перевірити наявність
docker compose version

# Якщо немає - встановити
sudo apt update
sudo apt install docker-compose-plugin
```

### 2.2 Створення .env файлу
```bash
# На сервері
cd /home/roman/new_onboarding
cp server/.env.example .env
nano .env
```

## Крок 3: Встановлення Git Hooks

### 3.1 Локально
```bash
# Копіювання hook файлів
cp server-post-receive-hook .git/hooks/post-merge
chmod +x .git/hooks/post-merge
```

### 3.2 На сервері
```bash
# Встановлення hook
./setup-server-hooks.sh
```

## Крок 4: Налаштування GitHub Actions

### 4.1 GitHub Secrets
Додати в GitHub Repository Settings → Secrets:
- `SERVER_IP`: `192.168.88.121`
- `SERVER_USER`: `roman`
- `SSH_PRIVATE_KEY`: (приватний ключ з сервера)

### 4.2 Отримання SSH ключа
```bash
ssh roman@192.168.88.121 "cat ~/.ssh/id_ed25519"
```

## Крок 5: Тестування

### 5.1 Тест локального hook
```bash
# Зміна в server/
echo "test" >> server/test.txt
git add server/test.txt
git commit -m "test"
git merge --no-ff -m "test merge" HEAD~1
```

### 5.2 Тест серверного hook
```bash
# Push зміни
git push origin main

# Pull на сервері
ssh roman@192.168.88.121 "cd /home/roman/new_onboarding && git pull origin main"
```

### 5.3 Перевірка API
```bash
curl http://192.168.88.121:3001/api/health
```

## Крок 6: Моніторинг

### 6.1 Статус контейнерів
```bash
ssh roman@192.168.88.121 "cd /home/roman/new_onboarding && docker compose ps"
```

### 6.2 Логи
```bash
ssh roman@192.168.88.121 "cd /home/roman/new_onboarding && docker logs skillklan-server"
```

## Швидкі команди

### Деплой
```bash
# Автоматичний (через hook)
git push origin main

# Ручний
./deploy.sh main 192.168.88.121 roman
```

### Перезапуск
```bash
ssh roman@192.168.88.121 "cd /home/roman/new_onboarding && docker compose restart"
```

### Зупинка
```bash
ssh roman@192.168.88.121 "cd /home/roman/new_onboarding && docker compose down"
```

### Очищення
```bash
ssh roman@192.168.88.121 "cd /home/roman/new_onboarding && docker system prune -f"
```

## Troubleshooting

### Hook не працює
```bash
# Перевірити права
ls -la .git/hooks/post-merge
chmod +x .git/hooks/post-merge
```

### Контейнери не запускаються
```bash
# Перевірити конфігурацію
docker compose config
# Перевірити логи
docker compose logs
```

### API не відповідає
```bash
# Перевірити змінні середовища
cat .env
# Перевірити підключення
curl -v http://192.168.88.121:3001/api/health
```
