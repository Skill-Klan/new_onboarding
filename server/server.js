const express = require('express');
const { Pool } = require('pg');
const cors = require('cors');
const helmet = require('helmet');
require('dotenv').config();

const app = express();

// Middleware
app.use(helmet());
app.use(cors({
  origin: process.env.NODE_ENV === 'production' 
    ? ['https://your-domain.com'] 
    : ['http://localhost:5173', 'https://*.ngrok-free.app']
}));
app.use(express.json());

// Підключення до PostgreSQL
const pool = new Pool({
  user: process.env.DB_USER,
  host: process.env.DB_HOST,
  database: process.env.DB_NAME,
  password: process.env.DB_PASSWORD,
  port: process.env.DB_PORT,
});

// Тест підключення до БД
pool.query('SELECT NOW()', (err, res) => {
  if (err) {
    console.error('Database connection error:', err);
  } else {
    console.log('Database connected successfully');
  }
});

// Health check endpoint
app.get("/api/health", (req, res) => {
  res.json({ status: "ok", timestamp: new Date().toISOString() });
});

// API для збереження заявки на тестове завдання
app.post('/api/test-task-request', async (req, res) => {
  const client = await pool.connect();
  
  try {
    const { name, phone, email, profession, telegram_id } = req.body;
    
    // Валідація даних
    if (!name || !phone || !profession) {
      return res.status(400).json({ 
        error: 'Необхідно заповнити ім\'я, телефон та професію' 
      });
    }
    
    if (!['qa', 'ba'].includes(profession)) {
      return res.status(400).json({ 
        error: 'Невірна професія' 
      });
    }
    
    await client.query('BEGIN');
    
    // Перевіряємо, чи існує користувач з таким telegram_id
    let userResult = await client.query(
      'SELECT id FROM users WHERE telegram_id = $1',
      [telegram_id]
    );
    
    let userId;
    
    if (userResult.rows.length === 0) {
      // Створюємо нового користувача
      const newUserResult = await client.query(
        'INSERT INTO users (telegram_id, name, phone, email) VALUES ($1, $2, $3, $4) RETURNING id',
        [telegram_id, name, phone, email]
      );
      userId = newUserResult.rows[0].id;
    } else {
      // Оновлюємо існуючого користувача
      await client.query(
        'UPDATE users SET name = $1, phone = $2, email = $3, updated_at = CURRENT_TIMESTAMP WHERE telegram_id = $4',
        [name, phone, email, telegram_id]
      );
      userId = userResult.rows[0].id;
    }
    
    // Створюємо заявку на тестове завдання
    await client.query(
      'INSERT INTO test_task_requests (user_id, profession) VALUES ($1, $2)',
      [userId, profession]
    );
    
    await client.query('COMMIT');
    
    res.json({ 
      success: true, 
      message: 'Заявку на тестове завдання збережено успішно',
      user_id: userId
    });
    
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Error saving test task request:', error);
    res.status(500).json({ 
      error: 'Помилка збереження заявки. Спробуйте ще раз.' 
    });
  } finally {
    client.release();
  }
});

// API для отримання статистики (для адміністраторів)
app.get('/api/admin/stats', async (req, res) => {
  try {
    const stats = await pool.query(`
      SELECT 
        profession,
        status,
        COUNT(*) as count
      FROM test_task_requests ttr
      JOIN users u ON ttr.user_id = u.id
      GROUP BY profession, status
      ORDER BY profession, status
    `);
    
    res.json({ success: true, stats: stats.rows });
  } catch (error) {
    console.error('Error getting stats:', error);
    res.status(500).json({ error: 'Помилка отримання статистики' });
  }
});

// API для отримання всіх заявок (для адміністраторів)
app.get('/api/admin/requests', async (req, res) => {
  try {
    const requests = await pool.query(`
      SELECT 
        ttr.id,
        ttr.profession,
        ttr.status,
        ttr.created_at,
        u.name,
        u.phone,
        u.email,
        u.telegram_id
      FROM test_task_requests ttr
      JOIN users u ON ttr.user_id = u.id
      ORDER BY ttr.created_at DESC
    `);
    
    res.json({ success: true, requests: requests.rows });
  } catch (error) {
    console.error('Error getting requests:', error);
    res.status(500).json({ error: 'Помилка отримання заявок' });
  }
});

// API для перевірки існування користувача
app.get('/api/check-user/:telegramId', async (req, res) => {
  try {
    const { telegramId } = req.params;
    
    const result = await pool.query(
      'SELECT id, name, phone, email FROM users WHERE telegram_id = $1',
      [telegramId]
    );
    
    if (result.rows.length > 0) {
      const user = result.rows[0];
      res.json({ 
        exists: true, 
        user: {
          id: user.id,
          name: user.name,
          phone: user.phone,
          email: user.email
        }
      });
    } else {
      res.json({ exists: false, user: null });
    }
    
  } catch (error) {
    console.error('Error checking user:', error);
    res.status(500).json({ error: 'Помилка перевірки користувача' });
  }
});

// API для оновлення статусу тестового завдання
app.post('/api/update-test-task-status', async (req, res) => {
  const client = await pool.connect();
  
  try {
    const { telegram_id, profession, status } = req.body;
    
    await client.query('BEGIN');
    
    // Знайти користувача
    const userResult = await client.query(
      'SELECT id FROM users WHERE telegram_id = $1',
      [telegram_id]
    );
    
    if (userResult.rows.length === 0) {
      return res.status(404).json({ error: 'Користувача не знайдено' });
    }
    
    const userId = userResult.rows[0].id;
    
    // Оновити статус останньої заявки
    const updateResult = await client.query(
      `UPDATE test_task_requests 
       SET status = $1, sent_at = CURRENT_TIMESTAMP 
       WHERE id = (
         SELECT id FROM test_task_requests 
         WHERE user_id = $2 AND profession = $3 
         ORDER BY created_at DESC 
         LIMIT 1
       )`,
      [status, userId, profession]
    );
    
    if (updateResult.rowCount === 0) {
      return res.status(404).json({ error: 'Заявку не знайдено' });
    }
    
    await client.query('COMMIT');
    
    res.json({ success: true, message: 'Статус оновлено' });
    
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Error updating test task status:', error);
    res.status(500).json({ error: 'Помилка оновлення статусу' });
  } finally {
    client.release();
  }
});

// Graceful shutdown
process.on('SIGINT', () => {
  pool.end();
  process.exit(0);
});

// Запуск сервера (має бути в кінці файлу)
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});