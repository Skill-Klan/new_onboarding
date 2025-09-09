#!/usr/bin/env node

// Локальний тест сервера без запуску бота
require('dotenv').config({ path: './.env' });

const express = require('express');
const cors = require('cors');
const helmet = require('helmet');

console.log('🧪 Локальний тест сервера...');

// Створюємо Express додаток
const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(helmet());
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'ok', 
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development'
  });
});

// Test endpoints
app.get('/api/test', (req, res) => {
  res.json({ 
    message: 'Тестовий endpoint працює',
    timestamp: new Date().toISOString()
  });
});

// Database test endpoint
app.get('/api/db-test', async (req, res) => {
  try {
    const { DatabaseService } = require('./shared/database/DatabaseService');
    const db = new DatabaseService();
    
    // Тестуємо з'єднання
    await db.connect();
    console.log('✅ З\'єднання з БД успішне');
    
    // Тестуємо запит
    const result = await db.query('SELECT NOW() as current_time');
    console.log('✅ Запит до БД успішний:', result.rows[0]);
    
    await db.disconnect();
    
    res.json({ 
      status: 'success',
      message: 'База даних працює',
      data: result.rows[0]
    });
  } catch (error) {
    console.error('❌ Помилка БД:', error);
    res.status(500).json({ 
      status: 'error',
      message: 'Помилка бази даних',
      error: error.message
    });
  }
});

// Bot test endpoint (без запуску бота)
app.get('/api/bot-test', async (req, res) => {
  try {
    const { Telegraf } = require('telegraf');
    const bot = new Telegraf(process.env.TELEGRAM_BOT_TOKEN);
    
    // Тестуємо токен
    const me = await bot.telegram.getMe();
    console.log('✅ Бот токен валідний:', me.first_name);
    
    res.json({ 
      status: 'success',
      message: 'Бот токен валідний',
      bot: {
        id: me.id,
        first_name: me.first_name,
        username: me.username
      }
    });
  } catch (error) {
    console.error('❌ Помилка бота:', error);
    res.status(500).json({ 
      status: 'error',
      message: 'Помилка бота',
      error: error.message
    });
  }
});

// Webhook test endpoint
app.get('/api/webhook-test', (req, res) => {
  try {
    const webhookConfig = require('./config/webhook.config.js');
    
    res.json({ 
      status: 'success',
      message: 'Webhook конфігурація завантажена',
      config: {
        enabled: webhookConfig.enabled,
        hasUrl: !!webhookConfig.webhookUrl,
        url: webhookConfig.webhookUrl ? 'встановлено' : 'не встановлено'
      }
    });
  } catch (error) {
    console.error('❌ Помилка webhook:', error);
    res.status(500).json({ 
      status: 'error',
      message: 'Помилка webhook',
      error: error.message
    });
  }
});

// Error handling
app.use((err, req, res, next) => {
  console.error('❌ Помилка сервера:', err);
  res.status(500).json({ 
    error: 'Внутрішня помилка сервера',
    message: err.message
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ 
    error: 'Endpoint не знайдено',
    path: req.path
  });
});

// Запускаємо сервер
app.listen(PORT, () => {
  console.log(`🚀 Локальний тестовий сервер запущено на порту ${PORT}`);
  console.log(`🌐 Health check: http://localhost:${PORT}/api/health`);
  console.log(`🧪 Тест endpoints: http://localhost:${PORT}/api/test`);
  console.log(`🗄️  БД тест: http://localhost:${PORT}/api/db-test`);
  console.log(`🤖 Бот тест: http://localhost:${PORT}/api/bot-test`);
  console.log(`🔗 Webhook тест: http://localhost:${PORT}/api/webhook-test`);
  console.log('');
  console.log('⏹️  Для зупинки натисніть Ctrl+C');
});

// Graceful shutdown
process.on('SIGINT', () => {
  console.log('\n🛑 Зупиняємо локальний тестовий сервер...');
  process.exit(0);
});

process.on('SIGTERM', () => {
  console.log('\n🛑 Зупиняємо локальний тестовий сервер...');
  process.exit(0);
});
