# 🗄️ База даних

## Схема бази даних

### Основні таблиці

#### `bot_users` - Користувачі бота
```sql
CREATE TABLE bot_users (
  id SERIAL PRIMARY KEY,
  telegram_id VARCHAR(50) UNIQUE NOT NULL,
  username VARCHAR(100),
  current_step VARCHAR(50) DEFAULT 'start',
  selected_profession VARCHAR(20),
  contact_data JSONB,
  task_sent BOOLEAN DEFAULT FALSE,
  task_sent_at TIMESTAMP,
  task_deadline TIMESTAMP,
  reminders_sent JSONB DEFAULT '[]',
  last_activity TIMESTAMP DEFAULT NOW(),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

#### `bot_contacts` - Контактні дані
```sql
CREATE TABLE bot_contacts (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES bot_users(id),
  phone_number VARCHAR(20) NOT NULL,
  first_name VARCHAR(100) NOT NULL,
  last_name VARCHAR(100),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

### Індекси для оптимізації
```sql
-- Індекс для пошуку по telegram_id
CREATE INDEX idx_bot_users_telegram_id ON bot_users(telegram_id);

-- Індекс для нагадувань
CREATE INDEX idx_bot_users_task_sent_at ON bot_users(task_sent_at) WHERE task_sent = true;
CREATE INDEX idx_bot_users_task_deadline ON bot_users(task_deadline) WHERE task_sent = true;

-- Індекс для контактів
CREATE INDEX idx_bot_contacts_user_id ON bot_contacts(user_id);
```

## Підключення

### Змінні середовища
```env
DB_HOST=localhost
DB_PORT=5432
DB_NAME=skillklan_db
DB_USER=skillklan_user
DB_PASSWORD=your_password
```

### Підключення через Node.js
```javascript
const { Pool } = require('pg');

const pool = new Pool({
  user: process.env.DB_USER,
  host: process.env.DB_HOST,
  database: process.env.DB_NAME,
  password: process.env.DB_PASSWORD,
  port: process.env.DB_PORT,
});
```

## Операції з даними

### Отримання стану користувача
```sql
SELECT * FROM bot_users WHERE telegram_id = $1;
```

### Оновлення стану
```sql
UPDATE bot_users 
SET current_step = $1, updated_at = NOW() 
WHERE telegram_id = $2;
```

### Збереження контакту
```sql
INSERT INTO bot_contacts (user_id, phone_number, first_name, last_name)
VALUES ($1, $2, $3, $4);
```

### Позначення завдання як відправлене
```sql
UPDATE bot_users 
SET task_sent = true, 
    task_sent_at = NOW(), 
    task_deadline = $1,
    updated_at = NOW()
WHERE telegram_id = $2;
```

## Backup та відновлення

### Створення backup
```bash
pg_dump -h localhost -U skillklan_user skillklan_db > backup.sql
```

### Відновлення з backup
```bash
psql -h localhost -U skillklan_user -d skillklan_db < backup.sql
```

### Автоматичний backup
```bash
# Cron job для щоденного backup
0 2 * * * pg_dump -h localhost -U skillklan_user skillklan_db > /backups/backup_$(date +\%Y\%m\%d).sql
```
