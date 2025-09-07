const express = require('express');
const { Pool } = require('pg');
const cors = require('cors');
const helmet = require('helmet');
require('dotenv').config();

// Імпорт бота
const SkillKlanBot = require('./bot/bot');

const app = express();

// Middleware
app.use(helmet());
app.use(cors({
  origin: process.env.NODE_ENV === 'production' 
    ? ['https://skill-klan.github.io/new_onboarding'] 
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
    const { name, phone, email, profession, telegram_id, contact_source = 'manual' } = req.body;
    
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

    // Валідація джерела контактів
    if (!['telegram', 'manual'].includes(contact_source)) {
      return res.status(400).json({ 
        error: 'Невірне джерело контактів' 
      });
    }

    // Валідація номера телефону для українських номерів
    const cleanPhone = phone.replace(/[^\d]/g, '');
    if (cleanPhone.length !== 10 || !cleanPhone.startsWith('0')) {
      return res.status(400).json({ 
        error: 'Невірний формат номера телефону. Очікується український номер (10 цифр, починається з 0)' 
      });
    }

    // Валідація імені
    if (name.trim().length < 2 || name.trim().length > 50) {
      return res.status(400).json({ 
        error: 'Ім\'я має бути від 2 до 50 символів' 
      });
    }

    // Логування джерела контактів
    console.log(`📝 Збереження контактів з джерела: ${contact_source} для telegram_id: ${telegram_id}`);
    
    await client.query('BEGIN');
    
    // Перевіряємо, чи існує користувач з таким telegram_id
    let userResult = await client.query(
      'SELECT id FROM users WHERE telegram_id = $1',
      [telegram_id]
    );
    
    let userId;
    
    if (userResult.rows.length === 0) {
      // Створюємо нового користувача
      console.log(`👤 Створюємо нового користувача з telegram_id: ${telegram_id}`);
      const newUserResult = await client.query(
        'INSERT INTO users (telegram_id, name, phone, email) VALUES ($1, $2, $3, $4) RETURNING id',
        [telegram_id, name.trim(), phone, email || '']
      );
      userId = newUserResult.rows[0].id;
      console.log(`✅ Користувача створено з ID: ${userId}`);
    } else {
      // Оновлюємо існуючого користувача
      console.log(`🔄 Оновлюємо існуючого користувача з ID: ${userResult.rows[0].id}`);
      await client.query(
        'UPDATE users SET name = $1, phone = $2, email = $3, updated_at = CURRENT_TIMESTAMP WHERE telegram_id = $4',
        [name.trim(), phone, email || '', telegram_id]
      );
      userId = userResult.rows[0].id;
    }
    
    // Створюємо заявку на тестове завдання
    console.log(`📋 Створюємо заявку на тестове завдання для користувача ${userId}, професія: ${profession}`);
    await client.query(
      'INSERT INTO test_task_requests (user_id, profession) VALUES ($1, $2)',
      [userId, profession]
    );
    
    await client.query('COMMIT');
    
    console.log(`✅ Заявку успішно збережено. User ID: ${userId}, Джерело: ${contact_source}`);
    
    res.json({ 
      success: true, 
      message: 'Заявку на тестове завдання збережено успішно',
      user_id: userId,
      contact_source: contact_source
    });
    
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('❌ Помилка збереження заявки:', error);
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

// Запуск сервера та бота
const PORT = process.env.PORT || 3000;

async function startServer() {
  try {
    // Запускаємо Express сервер
    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });

    // Запускаємо Telegram бота (якщо є токен)
    console.log('🔍🔍🔍 Перевіряємо наявність токена...');
    console.log('🔍🔍🔍 process.env.TELEGRAM_BOT_TOKEN:', process.env.TELEGRAM_BOT_TOKEN ? 'ПРИСУТНІЙ' : 'ВІДСУТНІЙ');
    console.log('🔍🔍🔍 Довжина токена в server.js:', process.env.TELEGRAM_BOT_TOKEN ? process.env.TELEGRAM_BOT_TOKEN.length : 0);
    
    if (process.env.TELEGRAM_BOT_TOKEN) {
      console.log('🔍🔍🔍 Токен присутній, створюємо новий екземпляр бота...');
      const bot = new SkillKlanBot();
      console.log('🔍🔍🔍 Екземпляр бота створено, запускаємо...');
      await bot.start();
      
      // Запускаємо cron job для нагадувань
      bot.reminderService.startReminderCron();
      
      console.log('🤖 Telegram bot запущено');
      console.log('⏰ Cron job для нагадувань запущено');
    } else {
      console.log('⚠️ TELEGRAM_BOT_TOKEN не встановлено, бот не запущено');
    }

  } catch (error) {
    console.error('❌ Помилка запуску сервера:', error);
    process.exit(1);
  }
}

startServer();