#!/bin/bash

# ========================================
# DOCKER BACKUP СКРИПТ ДЛЯ SKILLKLAN
# ========================================
# Скрипт для створення резервних копій Docker контейнерів та даних

set -e

# Конфігурація
PROJECT_NAME="skillklan"
PROJECT_DIR="/var/www/skillklan"
BACKUP_DIR="/var/www/skillklan/backups"
BACKUP_RETENTION_DAYS=7
LOG_FILE="/var/www/skillklan/logs/backup.log"

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

# Створення директорій
create_directories() {
    log "📁 Створення директорій для резервних копій..."
    
    mkdir -p "$BACKUP_DIR"
    mkdir -p "$(dirname "$LOG_FILE")"
    
    success "Директорії створені"
}

# Резервна копія бази даних PostgreSQL
backup_database() {
    log "🗄️  Створення резервної копії бази даних..."
    
    BACKUP_NAME="db_backup_$(date +%Y%m%d_%H%M%S).sql"
    BACKUP_PATH="$BACKUP_DIR/$BACKUP_NAME"
    
    # Створення резервної копії з Docker контейнера
    if docker-compose exec -T postgres pg_dump -U skillklan_user skillklan_db > "$BACKUP_PATH"; then
        # Стиснення
        gzip "$BACKUP_PATH"
        BACKUP_PATH="$BACKUP_PATH.gz"
        
        success "База даних збережена: $BACKUP_PATH"
        echo "Розмір: $(du -h "$BACKUP_PATH" | cut -f1)"
    else
        warning "Не вдалося створити резервну копію бази даних"
    fi
}

# Резервна копія Docker томів
backup_volumes() {
    log "💾 Створення резервної копії Docker томів..."
    
    BACKUP_NAME="volumes_backup_$(date +%Y%m%d_%H%M%S).tar.gz"
    BACKUP_PATH="$BACKUP_DIR/$BACKUP_NAME"
    
    # Створення архіву з Docker томами
    tar -czf "$BACKUP_PATH" \
        -C /var/lib/docker/volumes \
        skillklan_postgres_data \
        skillklan_server_logs \
        skillklan_server_data \
        skillklan_nginx_logs 2>/dev/null || warning "Не вдалося створити резервну копію томів"
    
    if [ -f "$BACKUP_PATH" ]; then
        success "Томи збережені: $BACKUP_PATH"
        echo "Розмір: $(du -h "$BACKUP_PATH" | cut -f1)"
    fi
}

# Резервна копія конфігурації
backup_config() {
    log "⚙️  Створення резервної копії конфігурації..."
    
    BACKUP_NAME="config_backup_$(date +%Y%m%d_%H%M%S).tar.gz"
    BACKUP_PATH="$BACKUP_DIR/$BACKUP_PATH"
    
    # Створення архіву з конфігурацією
    tar -czf "$BACKUP_PATH" \
        --exclude="node_modules" \
        --exclude="*.log" \
        --exclude="backups" \
        --exclude=".git" \
        -C "$PROJECT_DIR" .
    
    success "Конфігурація збережена: $BACKUP_PATH"
    echo "Розмір: $(du -h "$BACKUP_PATH" | cut -f1)"
}

# Резервна копія Docker образів
backup_images() {
    log "🐳 Створення резервної копії Docker образів..."
    
    BACKUP_NAME="images_backup_$(date +%Y%m%d_%H%M%S).tar"
    BACKUP_PATH="$BACKUP_DIR/$BACKUP_NAME"
    
    # Створення архіву з Docker образами
    docker save -o "$BACKUP_PATH" \
        skillklan_server:latest \
        postgres:16-alpine \
        nginx:alpine 2>/dev/null || warning "Не вдалося створити резервну копію образів"
    
    if [ -f "$BACKUP_PATH" ]; then
        # Стиснення
        gzip "$BACKUP_PATH"
        BACKUP_PATH="$BACKUP_PATH.gz"
        
        success "Образі збережені: $BACKUP_PATH"
        echo "Розмір: $(du -h "$BACKUP_PATH" | cut -f1)"
    fi
}

# Повна резервна копія
full_backup() {
    log "🔄 Створення повної резервної копії..."
    
    BACKUP_NAME="full_backup_$(date +%Y%m%d_%H%M%S).tar.gz"
    BACKUP_PATH="$BACKUP_DIR/$BACKUP_NAME"
    
    # Створення архіву з усіма даними
    tar -czf "$BACKUP_PATH" \
        --exclude="node_modules" \
        --exclude="*.log" \
        --exclude="backups" \
        --exclude=".git" \
        -C "$PROJECT_DIR" .
    
    success "Повна резервна копія створена: $BACKUP_PATH"
    echo "Розмір: $(du -h "$BACKUP_PATH" | cut -f1)"
}

# Очищення старих резервних копій
cleanup_old_backups() {
    log "🧹 Очищення старих резервних копій..."
    
    # Видалення файлів старіше BACKUP_RETENTION_DAYS днів
    find "$BACKUP_DIR" -name "*.tar.gz" -mtime +$BACKUP_RETENTION_DAYS -delete
    find "$BACKUP_DIR" -name "*.sql.gz" -mtime +$BACKUP_RETENTION_DAYS -delete
    find "$BACKUP_DIR" -name "*.tar" -mtime +$BACKUP_RETENTION_DAYS -delete
    
    success "Старі резервні копії видалені"
}

# Відображення статистики
show_backup_stats() {
    log "📊 Статистика резервних копій..."
    
    echo "📁 Директорія: $BACKUP_DIR"
    echo "📅 Збережено днів: $BACKUP_RETENTION_DAYS"
    echo ""
    
    # Кількість файлів
    TOTAL_FILES=$(find "$BACKUP_DIR" -type f | wc -l)
    echo "📄 Всього файлів: $TOTAL_FILES"
    
    # Загальний розмір
    TOTAL_SIZE=$(du -sh "$BACKUP_DIR" | cut -f1)
    echo "💾 Загальний розмір: $TOTAL_SIZE"
    
    # Список файлів
    echo ""
    echo "📋 Список резервних копій:"
    ls -lh "$BACKUP_DIR" | grep -E "\.(tar\.gz|sql\.gz|tar)$" || echo "Резервних копій не знайдено"
}

# Відновлення з резервної копії
restore_backup() {
    log "🔄 Відновлення з резервної копії..."
    
    if [ -z "$1" ]; then
        error "Вкажіть назву резервної копії для відновлення"
    fi
    
    BACKUP_FILE="$BACKUP_DIR/$1"
    
    if [ ! -f "$BACKUP_FILE" ]; then
        error "Резервна копія не знайдена: $BACKUP_FILE"
    fi
    
    log "📦 Відновлення з: $1"
    
    # Зупинка сервісів
    cd "$PROJECT_DIR"
    docker-compose down
    
    # Відновлення файлів
    if [[ "$1" == *.sql.gz ]]; then
        # Відновлення бази даних
        log "🗄️  Відновлення бази даних..."
        gunzip -c "$BACKUP_FILE" | docker-compose exec -T postgres psql -U skillklan_user -d skillklan_db
    elif [[ "$1" == *.tar.gz ]]; then
        # Відновлення файлів
        log "📁 Відновлення файлів..."
        tar -xzf "$BACKUP_FILE" -C "$PROJECT_DIR"
    fi
    
    # Запуск сервісів
    docker-compose up -d
    
    success "Відновлення завершено"
}

# Основна функція
main() {
    log "💾 Початок створення резервних копій..."
    
    # Перевірка наявності Docker
    if ! command -v docker &> /dev/null; then
        error "Docker не знайдено"
    fi
    
    # Створення директорій
    create_directories
    
    # Створення резервних копій
    backup_database
    backup_volumes
    backup_config
    backup_images
    full_backup
    
    # Очищення старих файлів
    cleanup_old_backups
    
    # Відображення статистики
    show_backup_stats
    
    success "🎉 Резервне копіювання завершено!"
}

# Функція допомоги
show_help() {
    echo "💾 Docker Backup Script для SkillKlan"
    echo ""
    echo "Використання: $0 [команда]"
    echo ""
    echo "Команди:"
    echo "  backup     - Створити всі резервні копії (за замовчуванням)"
    echo "  restore    - Відновити з резервної копії"
    echo "  stats      - Показати статистику"
    echo "  cleanup    - Очистити старі резервні копії"
    echo "  help       - Показати цю допомогу"
    echo ""
    echo "Приклади:"
    echo "  $0 backup                           # Створити резервні копії"
    echo "  $0 restore full_backup_20241201_120000.tar.gz  # Відновити"
    echo "  $0 stats                            # Показати статистику"
}

# Обробка аргументів командного рядка
case "${1:-backup}" in
    "backup")
        main
        ;;
    "restore")
        restore_backup "$2"
        ;;
    "stats")
        show_backup_stats
        ;;
    "cleanup")
        cleanup_old_backups
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



