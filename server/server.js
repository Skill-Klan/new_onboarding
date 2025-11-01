const express = require('express');
const { Pool } = require('pg');
const cors = require('cors');
const helmet = require('helmet');
require('dotenv').config();

// Імпорт нового FlowBot
const FlowBot = require('./bot/FlowBot');

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

// Dashboard stats endpoint for iOS app
// Dashboard stats endpoint for iOS app - виправлено
// Dashboard stats endpoint for iOS app - виправлено працевлаштовані
app.get('/api/dashboard/stats', async (req, res) => {
  try {
    const { Pool } = require('pg');
    const pool = new Pool({
      user: process.env.DB_USER || 'skilluser',
      host: process.env.DB_HOST || 'localhost',
      database: process.env.DB_NAME || 'skilldb',
      password: process.env.DB_PASSWORD || 'skillpass2025',
      port: process.env.DB_PORT || 5432,
    });
    
    // Отримуємо кількість студентів з таблиці users
    const studentsResult = await pool.query("SELECT COUNT(*) as count FROM users WHERE (is_mentor IS DISTINCT FROM TRUE OR (is_mentor = TRUE AND current_step IS NOT NULL AND current_step != ''))");
    const totalStudents = parseInt(studentsResult.rows[0]?.count || 0);
    
    // Отримуємо кількість менторів з таблиці users
    const mentorsResult = await pool.query('SELECT COUNT(*) as count FROM users WHERE is_mentor = TRUE');
    const totalMentors = parseInt(mentorsResult.rows[0]?.count || 0);
    
    // Студенти з тегом офер (працевлаштовані)
    const employedResult = await pool.query("SELECT COUNT(*) as count FROM users WHERE (is_mentor IS DISTINCT FROM TRUE OR (is_mentor = TRUE AND current_step IS NOT NULL AND current_step != '')) AND LOWER(TRIM(current_step)) = 'офер'");
    const employedStudents = parseInt(employedResult.rows[0]?.count || 0);
    
    // Виплачені кошти (з таблиці contracts, якщо вона існує)
    let paidAmount = 0;
    try {
      const contractsResult = await pool.query("SELECT COALESCE(SUM(amount), 0) as total FROM contracts WHERE status IN ('paid', 'completed')");
      paidAmount = parseFloat(contractsResult.rows[0]?.total || 0);
    } catch (e) {
      // Таблиця contracts може не існувати, це нормально
      paidAmount = 0;
    }
    
    res.json({
      total_students: totalStudents,
      total_mentors: totalMentors,
      employed_students: employedStudents,
      paid_amount: paidAmount
    });
  } catch (error) {
    console.error('❌ Помилка:', error);
    res.status(500).json({ error: error.message });
  }
});
// Students endpoint for iOS app
// Students endpoint for iOS app - проста версія
// Students endpoint for iOS app - проста версія з users
// Students endpoint for iOS app з фільтрацією
// Students endpoint for iOS app з фільтрацією
// Students endpoint for iOS app з фільтрацією
app.get('/api/students', async (req, res) => {
  try {
    const { Pool } = require('pg');
    const pool = new Pool({
      user: process.env.DB_USER || 'skilluser',
      host: process.env.DB_HOST || 'localhost',
      database: process.env.DB_NAME || 'skilldb',
      password: process.env.DB_PASSWORD || 'skillpass2025',
      port: process.env.DB_PORT || 5432,
    });
    
    // Отримуємо параметри фільтрації з query
    const mentorFilter = req.query.mentor;
    const statusFilter = req.query.status; // офер/студент
    
    // Формуємо SQL запит
    let query = "SELECT phone_number, first_name, last_name, email, current_step, direction_of_study, created_at, mentor_name, notes, discord_username, contract FROM users WHERE (is_mentor IS DISTINCT FROM TRUE OR (is_mentor = TRUE AND current_step IS NOT NULL AND current_step != ''))";
    const params = [];
    
    // Додаємо фільтр по ментору
    if (mentorFilter) {
      params.push('%' + mentorFilter + '%');
      query += ' AND mentor_name ILIKE $' + params.length;
    }
    
    // Додаємо фільтр по тегу (офер/студент)
    if (statusFilter) {
      params.push(statusFilter.trim());
      query += ' AND LOWER(TRIM(current_step)) = LOWER(TRIM($' + params.length + '))';
    }
    
    query += ' ORDER BY created_at DESC';
    
    const result = params.length > 0 ? await pool.query(query, params) : await pool.query(query);
    const total = result.rows.length;
    
    // Форматуємо відповідь
    const students = result.rows.map(row => ({
      id: row.phone_number || '',
      first_name: row.first_name || '',
      last_name: row.last_name || '',
      email: row.email || null,
      phone_number: row.phone_number || '',
      current_step: row.current_step || '',
      direction_of_study: row.direction_of_study || null,
      mentor_name: row.mentor_name || null,
      created_at: row.created_at ? new Date(row.created_at).toISOString() : new Date().toISOString(),
      notes: row.notes || null,
      discord_username: row.discord_username || null,
      contract: row.contract || false
    }));
    
    res.json({
      students: students,
      total: total
    });
  } catch (error) {
    console.error('❌ Помилка отримання студентів:', error);
    res.status(500).json({ error: 'Помилка отримання студентів', details: error.message });
  }
});

// Student detail endpoint
app.get('/api/students/:id', async (req, res) => {
  try {
    const { Pool } = require('pg');
    const pool = new Pool({
      user: process.env.DB_USER || 'skilluser',
      host: process.env.DB_HOST || 'localhost',
      database: process.env.DB_NAME || 'skilldb',
      password: process.env.DB_PASSWORD || 'skillpass2025',
      port: process.env.DB_PORT || 5432,
    });
    
    const studentId = req.params.id; // phone_number
    
    // Отримуємо студента по phone_number
    const result = await pool.query(
      "SELECT phone_number, first_name, last_name, email, current_step, direction_of_study, created_at, mentor_name, notes, discord_username, contract FROM users WHERE phone_number = $1 AND (is_mentor IS DISTINCT FROM TRUE OR (is_mentor = TRUE AND current_step IS NOT NULL AND current_step != ''))",
      [studentId]
    );
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Студента не знайдено' });
    }
    
    const row = result.rows[0];
    
    const student = {
      id: row.phone_number || '',
      first_name: row.first_name || '',
      last_name: row.last_name || '',
      email: row.email || null,
      phone_number: row.phone_number || '',
      current_step: row.current_step || '',
      direction_of_study: row.direction_of_study || null,
      mentor_name: row.mentor_name || null,
      created_at: row.created_at ? new Date(row.created_at).toISOString() : new Date().toISOString(),
      notes: row.notes || null,
      discord_username: row.discord_username || null,
      contract: row.contract || false,
    };
    
    // Отримуємо контракти (якщо таблиця існує)
    let contracts = [];
    try {
      const contractsResult = await pool.query('SELECT * FROM contracts WHERE student_phone = $1 LIMIT 10', [studentId]);
      contracts = contractsResult.rows.map(contract => ({
        id: contract.id,
        studentPhone: contract.student_phone || '',
        amount: parseFloat(contract.amount || 0),
        status: contract.status || 'pending',
        signedDate: contract.signed_date ? new Date(contract.signed_date).toISOString() : null,
        createdAt: contract.created_at ? new Date(contract.created_at).toISOString() : null
      }));
    } catch (e) {
      // Таблиця contracts може не існувати, це нормально
    }
    
    // Отримуємо платежі (якщо таблиця існує)
    let payments = [];
    try {
      const paymentsResult = await pool.query('SELECT * FROM payments WHERE student_phone = $1 LIMIT 10', [studentId]);
      payments = paymentsResult.rows.map(payment => ({
        id: payment.id,
        studentPhone: payment.student_phone || '',
        amount: parseFloat(payment.amount || 0),
        status: payment.status || 'pending',
        paymentDate: payment.payment_date ? new Date(payment.payment_date).toISOString() : null,
        createdAt: payment.created_at ? new Date(payment.created_at).toISOString() : null
      }));
    } catch (e) {
      // Таблиця payments може не існувати, це нормально
    }
    
    // Отримуємо нагадування (якщо таблиця існує)
    let reminders = [];
    try {
      const remindersResult = await pool.query('SELECT * FROM reminders WHERE student_phone = $1 LIMIT 10', [studentId]);
      reminders = remindersResult.rows.map(reminder => ({
        id: reminder.id,
        studentPhone: reminder.student_phone || '',
        title: reminder.title || '',
        description: reminder.description || null,
        dueDate: reminder.due_date ? new Date(reminder.due_date).toISOString() : null,
        status: reminder.status || 'pending',
        createdAt: reminder.created_at ? new Date(reminder.created_at).toISOString() : null
      }));
    } catch (e) {
      // Таблиця reminders може не існувати, це нормально
    }
    
    res.json({
      student: student,
      contracts: contracts,
      payments: payments,
      reminders: reminders
    });
  } catch (error) {
    console.error('❌ Помилка отримання деталей студента:', error);
    res.status(500).json({ error: 'Помилка отримання деталей студента', details: error.message });
  }
});

// Student stats endpoint
app.get('/api/students/:id/stats', async (req, res) => {
  try {
    const { Pool } = require('pg');
    const pool = new Pool({
      user: process.env.DB_USER || 'skilluser',
      host: process.env.DB_HOST || 'localhost',
      database: process.env.DB_NAME || 'skilldb',
      password: process.env.DB_PASSWORD || 'skillpass2025',
      port: process.env.DB_PORT || 5432,
    });
    
    const studentId = req.params.id; // phone_number
    
    // Статистика платежів
    let paymentStats = {
      totalAmount: 0,
      paidAmount: 0,
      pendingAmount: 0,
      overdueAmount: 0,
      totalPayments: 0,
      paidPayments: 0,
      pendingPayments: 0,
      overduePayments: 0
    };
    
    try {
      const paymentsResult = await pool.query('SELECT amount, status, payment_date FROM payments WHERE student_phone = $1', [studentId]);
      paymentStats.totalPayments = paymentsResult.rows.length;
      paymentsResult.rows.forEach(payment => {
        const amount = parseFloat(payment.amount || 0);
        paymentStats.totalAmount += amount;
        if (payment.status === 'paid' || payment.status === 'completed') {
          paymentStats.paidAmount += amount;
          paymentStats.paidPayments += 1;
        } else if (payment.status === 'pending') {
          paymentStats.pendingAmount += amount;
          paymentStats.pendingPayments += 1;
        } else if (payment.status === 'overdue') {
          paymentStats.overdueAmount += amount;
          paymentStats.overduePayments += 1;
        }
      });
    } catch (e) {
      // Таблиця payments може не існувати
    }
    
    // Статистика контрактів
    let contractStats = {
      totalContracts: 0,
      signedContracts: 0,
      pendingContracts: 0
    };
    
    try {
      const contractsResult = await pool.query('SELECT status FROM contracts WHERE student_phone = $1', [studentId]);
      contractStats.totalContracts = contractsResult.rows.length;
      contractsResult.rows.forEach(contract => {
        if (contract.status === 'signed' || contract.status === 'completed') {
          contractStats.signedContracts += 1;
        } else {
          contractStats.pendingContracts += 1;
        }
      });
    } catch (e) {
      // Таблиця contracts може не існувати
    }
    
    // Статистика нагадувань
    let reminderStats = {
      pending: 0,
      completed: 0,
      cancelled: 0
    };
    
    try {
      const remindersResult = await pool.query('SELECT status FROM reminders WHERE student_phone = $1', [studentId]);
      remindersResult.rows.forEach(reminder => {
        if (reminder.status === 'pending') {
          reminderStats.pending += 1;
        } else if (reminder.status === 'completed') {
          reminderStats.completed += 1;
        } else if (reminder.status === 'cancelled') {
          reminderStats.cancelled += 1;
        }
      });
    } catch (e) {
      // Таблиця reminders може не існувати
    }
    
    res.json({
      payments: paymentStats,
      contracts: contractStats,
      reminders: reminderStats
    });
  } catch (error) {
    console.error('❌ Помилка отримання статистики студента:', error);
    res.status(500).json({ error: 'Помилка отримання статистики студента', details: error.message });
  }
});
app.get('/api/check-user/:telegramId', async (req, res) => {
  try {
    const { Pool } = require('pg');
    const pool = new Pool({
      user: process.env.DB_USER || 'skilluser',
      host: process.env.DB_HOST || 'localhost',
      database: process.env.DB_NAME || 'skilldb',
      password: process.env.DB_PASSWORD || 'skillpass2025',
      port: process.env.DB_PORT || 5432,
    });
    
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
app.put('/api/students/:id', async (req, res) => {
  try {
    const { Pool } = require('pg');
    const pool = new Pool({
      user: process.env.DB_USER || 'skilluser',
      host: process.env.DB_HOST || 'localhost',
      database: process.env.DB_NAME || 'skilldb',
      password: process.env.DB_PASSWORD || 'skillpass2025',
      port: process.env.DB_PORT || 5432,
    });
    
    const studentId = req.params.id; // phone_number
    const updates = req.body;
    
    // Формуємо SQL запит для оновлення
    const updateFields = [];
    const values = [];
    let paramCount = 0;
    
    if (updates.first_name !== undefined) {
      paramCount++;
      updateFields.push(`first_name = $${paramCount}`);
      values.push(updates.first_name);
    }
    
    if (updates.last_name !== undefined) {
      paramCount++;
      updateFields.push(`last_name = $${paramCount}`);
      values.push(updates.last_name);
    }
    
    if (updates.email !== undefined) {
      paramCount++;
      updateFields.push(`email = $${paramCount}`);
      values.push(updates.email || null);
    }
    
    if (updates.current_step !== undefined) {
      paramCount++;
      updateFields.push(`current_step = $${paramCount}`);
      values.push(updates.current_step);
    }
    
    if (updates.direction_of_study !== undefined) {
      paramCount++;
      updateFields.push(`direction_of_study = $${paramCount}`);
      values.push(updates.direction_of_study || null);
    }
    
    if (updates.mentor_name !== undefined) {
      paramCount++;
      updateFields.push(`mentor_name = $${paramCount}`);
      values.push(updates.mentor_name || null);
    }
    
    if (updates.notes !== undefined) {
      paramCount++;
      updateFields.push(`notes = $${paramCount}`);
      values.push(updates.notes || null);
    }
    
    if (updates.discord_username !== undefined) {
      paramCount++;
      updateFields.push(`discord_username = $${paramCount}`);
      values.push(updates.discord_username || null);
    }
    
    if (updates.contract !== undefined) {
      paramCount++;
      updateFields.push(`contract = $${paramCount}`);
      values.push(updates.contract);
    }
    
    if (updateFields.length === 0) {
      return res.status(400).json({ error: 'Немає полів для оновлення' });
    }
    
    // Додаємо updated_at
    updateFields.push("updated_at = NOW()");
    
    // Додаємо phone_number в кінець для WHERE
    paramCount++;
    values.push(studentId);
    
    const query = `UPDATE users SET ${updateFields.join(', ')} WHERE phone_number = $${paramCount} RETURNING phone_number, first_name, last_name, email, current_step, direction_of_study, created_at, mentor_name, notes, discord_username, contract`;
    
    const result = await pool.query(query, values);
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Студента не знайдено' });
    }
    
    const row = result.rows[0];
    
    const student = {
      id: row.phone_number || '',
      first_name: row.first_name || '',
      last_name: row.last_name || '',
      email: row.email || null,
      phone_number: row.phone_number || '',
      current_step: row.current_step || '',
      direction_of_study: row.direction_of_study || null,
      mentor_name: row.mentor_name || null,
      created_at: row.created_at ? new Date(row.created_at).toISOString() : new Date().toISOString(),
      notes: row.notes || null,
      discord_username: row.discord_username || null,
      contract: row.contract || false,
    };
    
    res.json({
      student: student
    });
  } catch (error) {
    console.error('❌ Помилка оновлення студента:', error);
    res.status(500).json({ error: 'Помилка оновлення студента', details: error.message });
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

// ========================================
// Webhook Management API
// ========================================

// Глобальна змінна для зберігання посилання на webhookService
let webhookServiceInstance = null;

// API для отримання статусу webhook
app.get('/api/webhook/status', (req, res) => {
  try {
    if (!webhookServiceInstance) {
      return res.status(503).json({ 
        error: 'WebhookService не ініціалізовано' 
      });
    }
    
    const status = webhookServiceInstance.getStatus();
    res.json({ success: true, status });
  } catch (error) {
    console.error('Error getting webhook status:', error);
    res.status(500).json({ error: 'Помилка отримання статусу webhook' });
  }
});

// API для увімкнення/вимкнення webhook
app.post('/api/webhook/toggle', (req, res) => {
  try {
    const { enabled } = req.body;
    
    if (typeof enabled !== 'boolean') {
      return res.status(400).json({ 
        error: 'Параметр enabled має бути boolean' 
      });
    }
    
    if (!webhookServiceInstance) {
      return res.status(503).json({ 
        error: 'WebhookService не ініціалізовано' 
      });
    }
    
    webhookServiceInstance.setEnabled(enabled);
    
    res.json({ 
      success: true, 
      message: `Webhook ${enabled ? 'увімкнено' : 'вимкнено'}`,
      enabled 
    });
  } catch (error) {
    console.error('Error toggling webhook:', error);
    res.status(500).json({ error: 'Помилка перемикання webhook' });
  }
});

// API для управління конкретними типами повідомлень
app.post('/api/webhook/notification', (req, res) => {
  try {
    const { type, enabled } = req.body;
    
    if (!type || typeof enabled !== 'boolean') {
      return res.status(400).json({ 
        error: 'Параметри type та enabled обов\'язкові' 
      });
    }
    
    if (!webhookServiceInstance) {
      return res.status(503).json({ 
        error: 'WebhookService не ініціалізовано' 
      });
    }
    
    webhookServiceInstance.setNotificationEnabled(type, enabled);
    
    res.json({ 
      success: true, 
      message: `Повідомлення ${type} ${enabled ? 'увімкнено' : 'вимкнено'}`,
      type,
      enabled 
    });
  } catch (error) {
    console.error('Error updating notification:', error);
    res.status(500).json({ error: 'Помилка оновлення повідомлення' });
  }
});

// API для оновлення конфігурації webhook
app.post('/api/webhook/config', (req, res) => {
  try {
    const { config } = req.body;
    
    if (!config || typeof config !== 'object') {
      return res.status(400).json({ 
        error: 'Параметр config має бути об\'єктом' 
      });
    }
    
    if (!webhookServiceInstance) {
      return res.status(503).json({ 
        error: 'WebhookService не ініціалізовано' 
      });
    }
    
    webhookServiceInstance.updateConfig(config);
    
    res.json({ 
      success: true, 
      message: 'Конфігурація webhook оновлена',
      config: webhookServiceInstance.getStatus()
    });
  } catch (error) {
    console.error('Error updating webhook config:', error);
    res.status(500).json({ error: 'Помилка оновлення конфігурації webhook' });
  }
});

// Graceful shutdown
process.on("SIGINT", () => {
  pool.end();
  process.exit(0);
});

// Запуск сервера та бота
const PORT = process.env.PORT || 3000;

// Оновлений startServer з обробкою помилок FlowBot
// Оновлений startServer - спочатку запускаємо сервер, потім бота
async function startServer() {
  // Запускаємо Express сервер ПЕРШИМ
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });

  // Запускаємо FlowBot в окремому try-catch, щоб не зупиняти сервер
  if (process.env.TELEGRAM_BOT_TOKEN) {
    try {
      console.log('🔍 Створюємо новий екземпляр FlowBot...');
      const flowBot = new FlowBot();
      console.log('🔍 FlowBot створено, запускаємо...');
      await flowBot.start();
      
      // Зберігаємо посилання на webhookService для API управління
      webhookServiceInstance = flowBot.webhookService;
      console.log('🔧 WebhookService посилання збережено для API управління');
      console.log('🤖 Telegram bot запущено');
    } catch (botError) {
      console.error('⚠️ FlowBot не запущено (це не критично для API):', botError.message);
      // Сервер продовжує працювати без бота
    }
  } else {
    console.log('⚠️ TELEGRAM_BOT_TOKEN не встановлено, бот не запущено');
  }
}
startServer();

// Endpoint для отримання фінансових даних студента з Google Sheets
app.get('/api/students/:id/financial', async (req, res) => {
  try {
    const googleSheetsService = require('./googleSheetsService');
    const { Pool } = require('pg');
    const pool = new Pool({
      user: process.env.DB_USER || 'skilluser',
      host: process.env.DB_HOST || 'localhost',
      database: process.env.DB_NAME || 'skilldb',
      password: process.env.DB_PASSWORD || 'skillpass2025',
      port: process.env.DB_PORT || 5432,
    });
    
    const studentId = req.params.id; // phone_number
    
    // Отримуємо дані студента з БД
    const studentResult = await pool.query(
      'SELECT first_name, last_name FROM users WHERE phone_number = $1',
      [studentId]
    );
    
    if (studentResult.rows.length === 0) {
      return res.status(404).json({ error: 'Студента не знайдено' });
    }
    
    const student = studentResult.rows[0];
    const firstName = student.first_name || '';
    const lastName = student.last_name || '';
    
    // Отримуємо фінансові дані з Google Sheets
    const financialData = await googleSheetsService.getStudentFinancialData(firstName, lastName);
    
    if (!financialData) {
      return res.status(404).json({ 
        error: 'Фінансові дані не знайдено в Google Таблиці',
        message: `Студента "${firstName} ${lastName}" не знайдено в таблиці`
      });
    }
    
    res.json({
      student: {
        id: studentId,
        firstName: firstName,
        lastName: lastName
      },
      financial: financialData
    });
  } catch (error) {
    console.error('❌ Помилка отримання фінансових даних:', error);
    res.status(500).json({ error: 'Помилка отримання фінансових даних', details: error.message });
  }
});

// ===== Payments summary endpoint for iOS app =====
try {
  const googleSheetsService = require('./googleSheetsService');
  app.get('/api/payments/summary', async (req, res) => {
    try {
      const { Pool } = require('pg');
      const pool = new Pool({
        user: process.env.DB_USER || 'skilluser',
        host: process.env.DB_HOST || 'localhost',
        database: process.env.DB_NAME || 'skilldb',
        password: process.env.DB_PASSWORD || 'skillpass2025',
        port: process.env.DB_PORT || 5432,
      });

      const sheetsSummary = await googleSheetsService.getGlobalSummary();

      let paidAmount = 0;
      try {
        const result = await pool.query("SELECT COALESCE(SUM(amount), 0) AS total FROM contracts WHERE status IN ('paid','completed')");
        paidAmount = parseFloat(result.rows[0]?.total || 0);
      } catch (e) {
        paidAmount = 0;
      }

      res.json({
        summary: {
          total_given_to_school_usd: sheetsSummary.totalGivenToSchoolUSD || 0,
          remainder_to_school_usd: sheetsSummary.remainderToSchoolUSD || 0,
          paid_amount: paidAmount
        }
      });
    } catch (error) {
      console.error('❌ Помилка отримання summary payments:', error);
      res.status(500).json({ error: 'Помилка отримання summary payments', details: error.message });
    }
  });
} catch (e) {
  console.error('⚠️ Не вдалося ініціалізувати endpoint /api/payments/summary:', e.message);
}
// ===== End payments summary endpoint =====
// ===== Paying students endpoint for iOS app =====
try {
  const googleSheetsService = require('./googleSheetsService');
  app.get('/api/payments/payers', async (req, res) => {
    try {
      const students = await googleSheetsService.getPayingStudents();
      res.json({ students: students });
    } catch (error) {
      console.error('❌ Помилка отримання списку студентів що виплачують:', error);
      res.status(500).json({ error: 'Помилка отримання списку студентів що виплачують', details: error.message });
    }
  });
} catch (e) {
  console.error('⚠️ Не вдалося ініціалізувати endpoint /api/payments/payers:', e.message);
}
// ===== End paying students endpoint =====
// ===== Add payment record endpoint =====
try {
  const googleSheetsService = require('./googleSheetsService');
  app.post('/api/payments/add', async (req, res) => {
    try {
      const { studentName, paymentDate, amount, usdRate } = req.body;
      
      // Валідація
      if (!studentName || !paymentDate || amount === undefined || usdRate === undefined) {
        return res.status(400).json({ 
          error: 'Відсутні обов\'язкові поля',
          details: 'Потрібні: studentName, paymentDate, amount, usdRate'
        });
      }
      
      console.log(`📝 Запит на додавання оплати для ${studentName}`);
      const result = await googleSheetsService.addPaymentRecord(studentName, paymentDate, amount, usdRate);
      
      res.json({ 
        success: true, 
        message: 'Оплата успішно додана',
        row: result.row
      });
    } catch (error) {
      console.error('❌ Помилка додавання оплати:', error);
      res.status(500).json({ 
        error: 'Помилка додавання оплати', 
        details: error.message 
      });
    }
  });
} catch (e) {
  console.error('⚠️ Не вдалося ініціалізувати endpoint /api/payments/add:', e.message);
}
// ===== End add payment record endpoint =====

