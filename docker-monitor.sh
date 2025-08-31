#!/bin/bash

# ========================================
# DOCKER MONITOR СКРИПТ ДЛЯ SKILLKLAN
# ========================================
# Скрипт для моніторингу Docker контейнерів та системи

set -e

# Конфігурація
PROJECT_NAME="skillklan"
PROJECT_DIR="/var/www/skillklan"
LOG_FILE="/var/www/skillklan/logs/monitor.log"
ALERT_EMAIL="admin@skillklan.com"
ALERT_THRESHOLD_CPU=80
ALERT_THRESHOLD_MEMORY=85
ALERT_THRESHOLD_DISK=90

# Кольори для виводу
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
PURPLE='\033[0;35m'
NC='\033[0m' # No Color

# Функція логування
log() {
    echo -e "${BLUE}[$(date '+%Y-%m-%d %H:%M:%S')]${NC} $1" | tee -a "$LOG_FILE"
}

# Функція попередження
warning() {
    echo -e "${YELLOW}⚠️  $1${NC}" | tee -a "$LOG_FILE"
}

# Функція помилки
error() {
    echo -e "${RED}❌ $1${NC}" | tee -a "$LOG_FILE"
}

# Функція успіху
success() {
    echo -e "${GREEN}✅ $1${NC}" | tee -a "$LOG_FILE"
}

# Функція інформації
info() {
    echo -e "${PURPLE}ℹ️  $1${NC}" | tee -a "$LOG_FILE"
}

# Створення директорій
create_directories() {
    mkdir -p "$(dirname "$LOG_FILE")"
}

# Перевірка статусу Docker контейнерів
check_container_status() {
    log "🐳 Перевірка статусу Docker контейнерів..."
    
    cd "$PROJECT_DIR"
    
    if [ ! -f "docker-compose.yml" ]; then
        error "docker-compose.yml не знайдено"
        return 1
    fi
    
    # Статус контейнерів
    echo "📊 Статус контейнерів:"
    docker-compose ps
    
    # Перевірка чи всі контейнери запущені
    if docker-compose ps | grep -q "Exit"; then
        warning "Знайдено зупинені контейнери!"
        docker-compose ps | grep "Exit"
    fi
    
    # Перевірка health checks
    echo ""
    log "🏥 Перевірка health checks..."
    
    # PostgreSQL
    if docker-compose exec -T postgres pg_isready -U skillklan_user -d skillklan_db; then
        success "PostgreSQL: Healthy"
    else
        warning "PostgreSQL: Unhealthy"
    fi
    
    # Server
    if curl -f -s http://localhost:3000/api/health > /dev/null; then
        success "Server: Healthy"
    else
        warning "Server: Unhealthy"
    fi
    
    # Nginx
    if curl -f -s http://localhost/health > /dev/null; then
        success "Nginx: Healthy"
    else
        warning "Nginx: Unhealthy"
    fi
}

# Моніторинг ресурсів контейнерів
monitor_container_resources() {
    log "📊 Моніторинг ресурсів контейнерів..."
    
    echo "💻 Використання ресурсів:"
    docker stats --no-stream --format "table {{.Container}}\t{{.CPUPerc}}\t{{.MemUsage}}\t{{.MemPerc}}\t{{.NetIO}}\t{{.BlockIO}}"
    
    # Перевірка CPU та Memory
    docker stats --no-stream --format "{{.Container}} {{.CPUPerc}} {{.MemPerc}}" | while read container cpu mem; do
        # Видаляємо % з CPU та Memory
        cpu_val=$(echo "$cpu" | sed 's/%//')
        mem_val=$(echo "$mem" | sed 's/%//')
        
        # Перевірка CPU
        if (( $(echo "$cpu_val > $ALERT_THRESHOLD_CPU" | bc -l) )); then
            warning "Контейнер $container: Високе використання CPU: ${cpu_val}%"
        fi
        
        # Перевірка Memory
        if (( $(echo "$mem_val > $ALERT_THRESHOLD_MEMORY" | bc -l) )); then
            warning "Контейнер $container: Високе використання Memory: ${mem_val}%"
        fi
    done
}

# Моніторинг системних ресурсів
monitor_system_resources() {
    log "🖥️  Моніторинг системних ресурсів..."
    
    echo "💾 Використання диску:"
    df -h | grep -E "(Filesystem|/dev/|/var/)"
    
    # Перевірка використання диску
    DISK_USAGE=$(df / | tail -1 | awk '{print $5}' | sed 's/%//')
    if [ "$DISK_USAGE" -gt "$ALERT_THRESHOLD_DISK" ]; then
        warning "Високе використання диску: ${DISK_USAGE}%"
    fi
    
    echo ""
    echo "🧠 Використання пам'яті:"
    free -h
    
    echo ""
    echo "🔥 Навантаження системи:"
    uptime
    echo "Load average: $(uptime | awk -F'load average:' '{print $2}')"
}

# Моніторинг логів
monitor_logs() {
    log "📝 Моніторинг логів..."
    
    cd "$PROJECT_DIR"
    
    echo "🔍 Останні помилки в логах:"
    
    # Помилки в Docker логах
    echo "🐳 Docker логи (останні 20 рядків):"
    docker-compose logs --tail=20 | grep -i error || echo "Помилок не знайдено"
    
    echo ""
    
    # Помилки в системних логах
    echo "📋 Системні логи (останні 10 рядків):"
    journalctl -u docker.service --since "1 hour ago" | grep -i error | tail -10 || echo "Помилок не знайдено"
}

# Перевірка мережі
check_network() {
    log "🌐 Перевірка мережі..."
    
    echo "🔌 Статус мережевих інтерфейсів:"
    ip addr show | grep -E "(inet|UP|DOWN)" | grep -v "127.0.0.1"
    
    echo ""
    echo "🌍 Перевірка зовнішнього з'єднання:"
    
    # Ping до зовнішніх серверів
    if ping -c 1 8.8.8.8 > /dev/null 2>&1; then
        success "Зовнішнє з'єднання: OK"
    else
        warning "Зовнішнє з'єднання: FAILED"
    fi
    
    # Перевірка DNS
    if nslookup google.com > /dev/null 2>&1; then
        success "DNS: OK"
    else
        warning "DNS: FAILED"
    fi
}

# Перевірка портів
check_ports() {
    log "🔌 Перевірка портів..."
    
    echo "📡 Відкриті порти:"
    
    # HTTP порт 80
    if netstat -tlnp | grep ":80 " > /dev/null; then
        success "Порт 80 (HTTP): Відкритий"
    else
        warning "Порт 80 (HTTP): Закритий"
    fi
    
    # HTTPS порт 443
    if netstat -tlnp | grep ":443 " > /dev/null; then
        success "Порт 443 (HTTPS): Відкритий"
    else
        warning "Порт 443 (HTTPS): Закритий"
    fi
    
    # API порт 3000
    if netstat -tlnp | grep ":3000 " > /dev/null; then
        success "Порт 3000 (API): Відкритий"
    else
        warning "Порт 3000 (API): Закритий"
    fi
    
    # PostgreSQL порт 5432
    if netstat -tlnp | grep ":5432 " > /dev/null; then
        success "Порт 5432 (PostgreSQL): Відкритий"
    else
        warning "Порт 5432 (PostgreSQL): Закритий"
    fi
}

# Перевірка безпеки
check_security() {
    log "🔒 Перевірка безпеки..."
    
    echo "🛡️  Статус firewall:"
    if command -v ufw &> /dev/null; then
        ufw status
    else
        echo "UFW не встановлено"
    fi
    
    echo ""
    echo "🔐 SSL сертифікати:"
    if [ -f "docker/nginx/ssl/skillklan.crt" ]; then
        echo "SSL сертифікат знайдено"
        openssl x509 -in docker/nginx/ssl/skillklan.crt -text -noout | grep -E "(Subject|Not After)" | head -2
    else
        warning "SSL сертифікат не знайдено"
    fi
}

# Створення звіту
generate_report() {
    log "📊 Генерація звіту..."
    
    REPORT_FILE="/var/www/skillklan/logs/monitor_report_$(date +%Y%m%d_%H%M%S).txt"
    
    {
        echo "========================================"
        echo "ЗВІТ МОНІТОРИНГУ SKILLKLAN"
        echo "Дата: $(date)"
        echo "========================================"
        echo ""
        
        echo "🐳 СТАТУС DOCKER КОНТЕЙНЕРІВ:"
        docker-compose ps
        echo ""
        
        echo "💻 ВИКОРИСТАННЯ РЕСУРСІВ:"
        docker stats --no-stream
        echo ""
        
        echo "💾 СИСТЕМНІ РЕСУРСИ:"
        df -h
        echo ""
        free -h
        echo ""
        uptime
        echo ""
        
        echo "🔌 МЕРЕЖА:"
        netstat -tlnp | grep -E ":(80|443|3000|5432)"
        echo ""
        
        echo "📝 ПОСЛІДНІ ПОМИЛКИ:"
        docker-compose logs --tail=20 | grep -i error || echo "Помилок не знайдено"
        
    } > "$REPORT_FILE"
    
    success "Звіт збережено: $REPORT_FILE"
}

# Основна функція моніторингу
main() {
    log "🔍 Початок моніторингу SkillKlan..."
    
    # Створення директорій
    create_directories
    
    # Перевірки
    check_container_status
    echo ""
    
    monitor_container_resources
    echo ""
    
    monitor_system_resources
    echo ""
    
    monitor_logs
    echo ""
    
    check_network
    echo ""
    
    check_ports
    echo ""
    
    check_security
    echo ""
    
    # Генерація звіту
    generate_report
    
    success "🎉 Моніторинг завершено!"
}

# Функція допомоги
show_help() {
    echo "🔍 Docker Monitor Script для SkillKlan"
    echo ""
    echo "Використання: $0 [команда]"
    echo ""
    echo "Команди:"
    echo "  monitor    - Повний моніторинг (за замовчуванням)"
    echo "  status     - Статус контейнерів"
    echo "  resources  - Ресурси контейнерів"
    echo "  system     - Системні ресурси"
    echo "  logs       - Моніторинг логів"
    echo "  network    - Перевірка мережі"
    echo "  ports      - Перевірка портів"
    echo "  security   - Перевірка безпеки"
    echo "  report     - Генерація звіту"
    echo "  help       - Показати цю допомогу"
    echo ""
    echo "Приклади:"
    echo "  $0 monitor                    # Повний моніторинг"
    echo "  $0 status                     # Статус контейнерів"
    echo "  $0 resources                  # Ресурси контейнерів"
}

# Обробка аргументів командного рядка
case "${1:-monitor}" in
    "monitor")
        main
        ;;
    "status")
        check_container_status
        ;;
    "resources")
        monitor_container_resources
        ;;
    "system")
        monitor_system_resources
        ;;
    "logs")
        monitor_logs
        ;;
    "network")
        check_network
        ;;
    "ports")
        check_ports
        ;;
    "security")
        check_security
        ;;
    "report")
        generate_report
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



