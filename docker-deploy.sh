#!/bin/bash

# ========================================
# DOCKER ДЕПЛОЙ СКРИПТ ДЛЯ SKILLKLAN
# ========================================
# Скрипт для деплою та управління Docker контейнерами

set -e

# Конфігурація
PROJECT_NAME="skillklan"
PROJECT_DIR="/var/www/skillklan"
DOCKER_COMPOSE_FILE="docker-compose.yml"
BACKUP_DIR="/var/www/skillklan/backups"
LOG_FILE="/var/www/skillklan/logs/deploy.log"

# Кольори для виводу
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Функція логування
log() {
    echo -e "${BLUE}[$(date '+%Y-%m-%d %H:%M:%S')]${NC} $1" | tee -a "$LOG_FILE"
}

# Функція помилки
error() {
    echo -e "${RED}❌ $1${NC}" | tee -a "$LOG_FILE"
    exit 1
}

# Функція успіху
success() {
    echo -e "${GREEN}✅ $1${NC}" | tee -a "$LOG_FILE"
}

# Функція попередження
warning() {
    echo -e "${YELLOW}⚠️  $1${NC}" | tee -a "$LOG_FILE"
}

# Перевірка наявності Docker
check_docker() {
    log "🔍 Перевірка наявності Docker..."
    
    if ! command -v docker &> /dev/null; then
        error "Docker не знайдено. Встановіть Docker спочатку."
    fi
    
    if ! command -v docker-compose &> /dev/null; then
        error "Docker Compose не знайдено. Встановіть Docker Compose спочатку."
    fi
    
    success "Docker та Docker Compose знайдено"
}

# Створення резервної копії
create_backup() {
    log "💾 Створення резервної копії..."
    
    mkdir -p "$BACKUP_DIR"
    BACKUP_NAME="backup_$(date +%Y%m%d_%H%M%S).tar.gz"
    
    # Створення архіву з поточними даними
    tar -czf "$BACKUP_DIR/$BACKUP_NAME" \
        --exclude="node_modules" \
        --exclude="*.log" \
        --exclude="backups" \
        -C "$PROJECT_DIR" .
    
    success "Резервна копія створена: $BACKUP_NAME"
}

# Зупинка поточних сервісів
stop_services() {
    log "⏹️  Зупинка поточних сервісів..."
    
    if [ -f "$PROJECT_DIR/$DOCKER_COMPOSE_FILE" ]; then
        cd "$PROJECT_DIR"
        docker-compose down --remove-orphans || warning "Не вдалося зупинити Docker сервіси"
    fi
    
    # Зупинка PM2 процесів (якщо є)
    if command -v pm2 &> /dev/null; then
        pm2 stop all || warning "Не вдалося зупинити PM2 процеси"
    fi
    
    # Зупинка системних сервісів
    sudo systemctl stop nginx || warning "Не вдалося зупинити Nginx"
    sudo systemctl stop postgresql || warning "Не вдалося зупинити PostgreSQL"
    
    success "Сервіси зупинено"
}

# Запуск Docker сервісів
start_docker_services() {
    log "🚀 Запуск Docker сервісів..."
    
    cd "$PROJECT_DIR"
    
    # Перевірка конфігурації
    log "🔍 Перевірка Docker Compose конфігурації..."
    docker-compose config
    
    # Збірка та запуск
    log "🏗️  Збірка та запуск контейнерів..."
    docker-compose up -d --build
    
    # Чекаємо поки сервіси запустяться
    log "⏳ Очікування запуску сервісів..."
    sleep 30
    
    success "Docker сервіси запущено"
}

# Перевірка здоров'я сервісів
health_check() {
    log "🏥 Перевірка здоров'я сервісів..."
    
    cd "$PROJECT_DIR"
    
    # Перевірка статусу контейнерів
    if ! docker-compose ps | grep -q "Up"; then
        error "Не всі контейнери запущені"
    fi
    
    # Перевірка health checks
    log "🔍 Перевірка health checks..."
    
    # PostgreSQL
    if ! docker-compose exec -T postgres pg_isready -U skillklan_user -d skillklan_db; then
        warning "PostgreSQL health check не пройшов"
    fi
    
    # Server
    if ! curl -f http://localhost:3000/api/health; then
        warning "Server health check не пройшов"
    fi
    
    # Nginx
    if ! curl -f http://localhost/health; then
        warning "Nginx health check не пройшов"
    fi
    
    success "Health checks пройдені"
}

# Очищення старих образів
cleanup_images() {
    log "🧹 Очищення старих Docker образів..."
    
    # Видалення невикористовуваних образів
    docker image prune -f
    
    # Видалення невикористовуваних контейнерів
    docker container prune -f
    
    # Видалення невикористовуваних томів
    docker volume prune -f
    
    success "Очищення завершено"
}

# Відображення статусу
show_status() {
    log "📊 Статус сервісів:"
    
    cd "$PROJECT_DIR"
    docker-compose ps
    
    log "📊 Використання ресурсів:"
    docker stats --no-stream
    
    log "📊 Логи останніх помилок:"
    docker-compose logs --tail=20 | grep -i error || echo "Помилок не знайдено"
}

# Основна функція деплою
deploy() {
    log "🚀 Початок деплою SkillKlan на Docker..."
    
    # Перевірки
    check_docker
    
    # Створення резервної копії
    create_backup
    
    # Зупинка поточних сервісів
    stop_services
    
    # Запуск Docker сервісів
    start_docker_services
    
    # Перевірка здоров'я
    health_check
    
    # Очищення
    cleanup_images
    
    # Відображення статусу
    show_status
    
    success "🎉 Деплой успішно завершено!"
    
    log "📋 Корисні команди:"
    echo "  Перегляд логів: docker-compose logs -f"
    echo "  Статус: docker-compose ps"
    echo "  Перезапуск: docker-compose restart"
    echo "  Зупинка: docker-compose down"
}

# Функція відкату
rollback() {
    log "🔄 Початок відкату..."
    
    if [ -z "$1" ]; then
        error "Вкажіть назву резервної копії для відкату"
    fi
    
    BACKUP_FILE="$BACKUP_DIR/$1"
    
    if [ ! -f "$BACKUP_FILE" ]; then
        error "Резервна копія не знайдена: $BACKUP_FILE"
    fi
    
    log "📦 Відновлення з резервної копії: $1"
    
    # Зупинка Docker сервісів
    cd "$PROJECT_DIR"
    docker-compose down
    
    # Відновлення файлів
    tar -xzf "$BACKUP_FILE" -C "$PROJECT_DIR"
    
    # Запуск оригінальних сервісів
    if [ -f "$PROJECT_DIR/ecosystem.config.js" ]; then
        cd "$PROJECT_DIR/server"
        pm2 start ecosystem.config.js --env production
    fi
    
    sudo systemctl start nginx
    sudo systemctl start postgresql
    
    success "Відкат завершено"
}

# Функція допомоги
show_help() {
    echo "🐳 Docker Deploy Script для SkillKlan"
    echo ""
    echo "Використання: $0 [команда]"
    echo ""
    echo "Команди:"
    echo "  deploy     - Запуск повного деплою"
    echo "  rollback   - Відкат до резервної копії"
    echo "  status     - Показати статус сервісів"
    echo "  backup     - Створити резервну копію"
    echo "  stop       - Зупинити всі сервіси"
    echo "  start      - Запустити Docker сервіси"
    echo "  logs       - Показати логи"
    echo "  help       - Показати цю допомогу"
    echo ""
    echo "Приклади:"
    echo "  $0 deploy                    # Повний деплой"
    echo "  $0 rollback backup_20241201_120000.tar.gz  # Відкат"
    echo "  $0 status                    # Статус сервісів"
}

# Обробка аргументів командного рядка
case "${1:-deploy}" in
    "deploy")
        deploy
        ;;
    "rollback")
        rollback "$2"
        ;;
    "status")
        show_status
        ;;
    "backup")
        create_backup
        ;;
    "stop")
        stop_services
        ;;
    "start")
        start_docker_services
        ;;
    "logs")
        cd "$PROJECT_DIR"
        docker-compose logs -f
        ;;
    "help"|"-h"|"--help")
        show_help
        ;;
    *)
        echo "Невідома команда: $1"
        show_help
        exit 1
        ;;
esac




