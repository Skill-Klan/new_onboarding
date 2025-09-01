# ========================================
# DOCKERFILE ДЛЯ SKILLKLAN SERVER
# ========================================
# Базований на Node.js 18 LTS для сумісності

# ЕТАП 1: БАЗОВИЙ ОБРАЗ
FROM node:18-alpine AS base

# Встановлюємо залежності для збірки
RUN apk add --no-cache \
    python3 \
    make \
    g++ \
    && rm -rf /var/cache/apk/*

# Встановлюємо робочу директорію
WORKDIR /app

# Копіюємо файли залежностей
COPY package*.json ./

# ЕТАП 2: ЗБІРКА ЗАЛЕЖНОСТЕЙ
FROM base AS deps

# Встановлюємо залежності
RUN npm ci --only=production && npm cache clean --force

# ЕТАП 3: ЗБІРКА ДОДАТКУ
FROM base AS builder

# Копіюємо залежності з попереднього етапу
COPY --from=deps /app/node_modules ./node_modules

# Копіюємо код додатку
COPY . .

# Створюємо директорію для логів
RUN mkdir -p logs

# Встановлюємо права доступу
RUN chown -R node:node /app

# ЕТАП 4: ПРОДАКШН ОБРАЗ
FROM node:18-alpine AS production

# Встановлюємо необхідні пакети
RUN apk add --no-cache dumb-init

# Створюємо користувача node
RUN addgroup -g 1001 -S nodejs && \
    adduser -S nodejs -u 1001

# Встановлюємо робочу директорію
WORKDIR /app

# Копіюємо залежності та код
COPY --from=builder --chown=nodejs:nodejs /app/node_modules ./node_modules
COPY --from=builder --chown=nodejs:nodejs /app ./

# Створюємо директорії для логів та даних
RUN mkdir -p logs data && \
    chown -R nodejs:nodejs logs data

# Переключаємося на користувача node
USER nodejs

# Відкриваємо порт
EXPOSE 3000

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
    CMD node healthcheck.js || exit 1

# Запускаємо додаток через dumb-init
ENTRYPOINT ["dumb-init", "--"]
CMD ["node", "server.js"]

# ========================================
# МЕТАДАНІ ОБРАЗУ
# ========================================
LABEL maintainer="SkillKlan Team"
LABEL version="1.0.0"
LABEL description="SkillKlan Mini App Backend Server"
LABEL org.opencontainers.image.source="https://github.com/Skill-Klan/new_onboarding"




