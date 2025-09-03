#!/bin/bash

# ========================================
# СКРИПТ КОПІЮВАННЯ ФАЙЛІВ НА СЕРВЕР
# ========================================
# Автоматичне копіювання всіх необхідних файлів для Docker на сервер

set -e

# Конфігурація
SERVER_HOST="37.57.209.201"
SERVER_USER="roman"
SSH_PORT="2222"
SERVER_PATH="/var/www/skillklan"
LOCAL_PATH="."

# Кольори для виводу
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Функція логування
log() {
    echo -e "${BLUE}[$(date '+%Y-%m-%d %H:%M:%S')]${NC} $1"
}

# Функція помилки
error() {
    echo -e "${RED}❌ $1${NC}"
    exit 1
}

# Функція успіху
success() {
    echo -e "${GREEN}✅ $1${NC}"
}

# Функція попередження
warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

# Перевірка наявності необхідних файлів
check_files() {
    log "🔍 Перевірка наявності необхідних файлів..."
    
    local missing_files=()
    
    # Перевірка Docker файлів
    if [ ! -f "docker-compose.yml" ]; then
        missing_files+=("docker-compose.yml")
    fi
    
    if [ ! -f "docker-deploy.sh" ]; then
        missing_files+=("docker-deploy.sh")
    fi
    
    if [ ! -f "docker-backup.sh" ]; then
        missing_files+=("docker-backup.sh")
    fi
    
    if [ ! -f "docker-monitor.sh" ]; then
        missing_files+=("docker-monitor.sh")
    fi
    
    if [ ! -d "docker" ]; then
        missing_files+=("docker/")
    fi
    
    if [ ! -d "server" ]; then
        missing_files+=("server/")
    fi
    
    # Перевірка наявності відсутніх файлів
    if [ ${#missing_files[@]} -ne 0 ]; then
        error "Відсутні необхідні файли: ${missing_files[*]}"
    fi
    
    success "Всі необхідні файли знайдено"
}

# Перевірка з'єднання з сервером
check_connection() {
    log "🔌 Перевірка з'єднання з сервером..."
    
    if ! ping -c 1 "$SERVER_HOST" > /dev/null 2>&1; then
        error "Не вдається досягти сервера $SERVER_HOST"
    fi
    
    success "З'єднання з сервером встановлено"
}

# Створення архіву для копіювання
create_archive() {
    log "📦 Створення архіву для копіювання..."
    
    local archive_name="skillklan-docker-$(date +%Y%m%d_%H%M%S).tar.gz"
    
    # Створення архіву з усіма необхідними файлами
    tar -czf "$archive_name" \
        --exclude="node_modules" \
        --exclude="*.log" \
        --exclude=".git" \
        --exclude="backups" \
        --exclude="*.tar.gz" \
        docker/ \
        server/ \
        docker-compose.yml \
        docker-*.sh \
        DOCKER_MIGRATION_GUIDE.md
    
    if [ ! -f "$archive_name" ]; then
        error "Не вдалося створити архів"
    fi
    
    success "Архів створено: $archive_name"
    echo "$archive_name"
}

# Копіювання архіву на сервер
copy_to_server() {
    local archive_name="$1"
    
    log "📤 Копіювання архіву на сервер..."
    
    # Копіювання архіву
    if scp -P "$SSH_PORT" -o StrictHostKeyChecking=no "$archive_name" "$SERVER_USER@$SERVER_HOST:/tmp/"; then
        success "Архів скопійовано на сервер"
    else
        error "Не вдалося скопіювати архів на сервер"
    fi
}

# Розпакування на сервері
extract_on_server() {
    local archive_name="$1"
    
    log "📦 Розпакування архіву на сервері..."
    
    # Виконання команд на сервері
    ssh -p "$SSH_PORT" -o StrictHostKeyChecking=no "$SERVER_USER@$SERVER_HOST" << EOF
        set -e
        
        echo "🔄 Розпакування архіву на сервері..."
        cd $SERVER_PATH
        
        # Створення резервної копії поточного стану
        if [ -d "backup" ]; then
            rm -rf backup
        fi
        mkdir backup
        
        if [ -d "server" ]; then
            echo "💾 Резервна копія server..."
            mv server backup/
        fi
        
        if [ -d "docker" ]; then
            echo "💾 Резервна копія docker..."
            mv docker backup/
        fi
        
        if [ -f "docker-compose.yml" ]; then
            echo "💾 Резервна копія docker-compose.yml..."
            mv docker-compose.yml backup/
        fi
        
        if [ -f "docker-deploy.sh" ]; then
            echo "💾 Резервна копія docker-deploy.sh..."
            mv docker-deploy.sh backup/
        fi
        
        if [ -f "docker-backup.sh" ]; then
            echo "💾 Резервна копія docker-backup.sh..."
            mv docker-backup.sh backup/
        fi
        
        if [ -f "docker-monitor.sh" ]; then
            echo "💾 Резервна копія docker-monitor.sh..."
            mv docker-monitor.sh backup/
        fi
        
        # Розпакування нового архіву
        echo "📦 Розпакування архіву..."
        cd /tmp
        tar -xzf "$archive_name" -C "$SERVER_PATH"
        
        # Встановлення правильних прав доступу
        echo "🔧 Встановлення прав доступу..."
        cd "$SERVER_PATH"
        chmod +x docker-*.sh
        
        # Створення необхідних директорій
        mkdir -p logs backups
        
        # Очищення
        rm /tmp/"$archive_name"
        
        echo "✅ Розпакування завершено успішно!"
        
        # Показ структури
        echo "📁 Структура проекту:"
        ls -la
        echo ""
        echo "📁 Docker конфігурація:"
        ls -la docker/
EOF
    
    success "Архів розпаковано на сервері"
}

# Перевірка результату на сервері
verify_server_files() {
    log "🔍 Перевірка файлів на сервері..."
    
    ssh -p "$SSH_PORT" -o StrictHostKeyChecking=no "$SERVER_USER@$SERVER_HOST" << 'EOF'
        echo "🔍 Перевірка наявності файлів на сервері..."
        cd /var/www/skillklan
        
        # Перевірка основних файлів
        echo "📋 Основні файли:"
        ls -la docker-compose.yml docker-*.sh 2>/dev/null || echo "❌ Основні файли відсутні"
        
        echo ""
        echo "📁 Docker директорія:"
        ls -la docker/ 2>/dev/null || echo "❌ Docker директорія відсутня"
        
        echo ""
        echo "📁 Server директорія:"
        ls -la server/ 2>/dev/null || echo "❌ Server директорія відсутня"
        
        echo ""
        echo "🔧 Права доступу:"
        ls -la docker-*.sh 2>/dev/null || echo "❌ Скрипти відсутні"
        
        echo ""
        echo "📁 Структура проекту:"
        tree -L 2 . 2>/dev/null || ls -la
EOF
    
    success "Перевірка завершена"
}

# Основна функція
main() {
    log "🚀 Початок копіювання файлів на сервер..."
    
    # Перевірки
    check_files
    check_connection
    
    # Створення архіву
    local archive_name=$(create_archive)
    
    # Копіювання на сервер
    copy_to_server "$archive_name"
    
    # Розпакування на сервері
    extract_on_server "$archive_name"
    
    # Перевірка результату
    verify_server_files
    
    # Очищення локального архіву
    rm -f "$archive_name"
    
    success "🎉 Копіювання файлів на сервер завершено!"
    
    echo ""
    echo "📋 Наступні кроки:"
    echo "1. Підключіться до сервера: ssh -p 2222 roman@37.57.209.201"
    echo "2. Перейдіть в папку: cd /var/www/skillklan"
    echo "3. Виконайте міграцію згідно DOCKER_MIGRATION_GUIDE.md"
    echo "4. Запустіть Docker: ./docker-deploy.sh deploy"
}

# Функція допомоги
show_help() {
    echo "📤 Скрипт копіювання файлів на сервер"
    echo ""
    echo "Використання: $0 [опції]"
    echo ""
    echo "Опції:"
    echo "  --help, -h     Показати цю допомогу"
    echo "  --check        Тільки перевірка файлів"
    echo "  --verify       Тільки перевірка на сервері"
    echo ""
    echo "Приклад:"
    echo "  $0              # Повне копіювання"
    echo "  $0 --check      # Перевірка файлів"
    echo "  $0 --verify     # Перевірка на сервері"
}

# Обробка аргументів командного рядка
case "${1:-}" in
    "--help"|"-h")
        show_help
        exit 0
        ;;
    "--check")
        check_files
        exit 0
        ;;
    "--verify")
        check_connection
        verify_server_files
        exit 0
        ;;
    "")
        main
        ;;
    *)
        echo "Невідома опція: $1"
        show_help
        exit 1
        ;;
esac






