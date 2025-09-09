FROM node:18-alpine

# Встановлюємо dumb-init для правильного обробки сигналів
RUN apk add --no-cache dumb-init

# Створюємо робочу директорію
WORKDIR /app

# Копіюємо package.json та package-lock.json
COPY package*.json ./

# Встановлюємо залежності
RUN npm ci --only=production && npm cache clean --force

# Копіюємо код додатку
COPY . .

# Створюємо користувача для безпеки
RUN addgroup -g 1001 -S nodejs && \
    adduser -S nextjs -u 1001

# Змінюємо власника файлів
RUN chown -R nextjs:nodejs /app
USER nextjs

# Відкриваємо порт
EXPOSE 3001

# Запускаємо додаток
CMD ["dumb-init", "node", "server.js"]
