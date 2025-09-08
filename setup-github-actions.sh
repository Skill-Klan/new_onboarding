#!/bin/bash

# Скрипт для налаштування GitHub Actions секретів
# Використання: ./setup-github-actions.sh [repository] [server_ip] [server_user]

set -e

# Параметри
REPOSITORY=${1:-"your-username/new_onboarding"}
SERVER_IP=${2:-"192.168.88.121"}
SERVER_USER=${3:-"roman"}

echo "🔧 Налаштування GitHub Actions секретів..."
echo "📋 Параметри:"
echo "   - Репозиторій: $REPOSITORY"
echo "   - Сервер: $SERVER_USER@$SERVER_IP"
echo ""

# Перевірка наявності GitHub CLI
if ! command -v gh &> /dev/null; then
    echo "❌ GitHub CLI не встановлено. Встановіть його:"
    echo "   brew install gh"
    echo "   або"
    echo "   curl -fsSL https://cli.github.com/packages/githubcli-archive-keyring.gpg | sudo dd of=/usr/share/keyrings/githubcli-archive-keyring.gpg"
    echo "   echo \"deb [arch=\$(dpkg --print-architecture) signed-by=/usr/share/keyrings/githubcli-archive-keyring.gpg] https://cli.github.com/packages stable main\" | sudo tee /etc/apt/sources.list.d/github-cli.list > /dev/null"
    echo "   sudo apt update"
    echo "   sudo apt install gh"
    exit 1
fi

# Перевірка авторизації в GitHub
if ! gh auth status &> /dev/null; then
    echo "🔑 Авторизація в GitHub..."
    gh auth login
fi

echo "✅ GitHub CLI готовий"

# Встановлення секретів
echo "🔐 Встановлення секретів..."

# SERVER_IP
echo "📡 Встановлення SERVER_IP..."
gh secret set SERVER_IP --body "$SERVER_IP" --repo "$REPOSITORY"

# SERVER_USER
echo "👤 Встановлення SERVER_USER..."
gh secret set SERVER_USER --body "$SERVER_USER" --repo "$REPOSITORY"

echo "✅ Секрети встановлено успішно!"
echo ""
echo "📋 Встановлені секрети:"
echo "   - SERVER_IP: $SERVER_IP"
echo "   - SERVER_USER: $SERVER_USER"
echo ""
echo "🎯 Тепер GitHub Actions буде автоматично розгортати проект при push в main гілку"
echo ""
echo "📝 Додаткові кроки:"
echo "   1. Переконайтеся, що SSH ключі налаштовані на сервері"
echo "   2. Перевірте, чи працює webhook URL з інтернету"
echo "   3. Налаштуйте SSL сертифікат для HTTPS webhook"
echo ""
echo "🔍 Перевірка секретів:"
gh secret list --repo "$REPOSITORY"
