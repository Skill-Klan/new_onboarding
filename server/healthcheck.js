#!/usr/bin/env node

/**
 * Health Check для Docker контейнера
 * Перевіряє доступність сервера та бази даних
 */

const http = require('http');

// Конфігурація health check
const options = {
  hostname: 'localhost',
  port: process.env.PORT || 3000,
  path: '/api/health',
  method: 'GET',
  timeout: 3000
};

// Функція перевірки здоров'я
function checkHealth() {
  return new Promise((resolve, reject) => {
    const req = http.request(options, (res) => {
      let data = '';
      
      res.on('data', (chunk) => {
        data += chunk;
      });
      
      res.on('end', () => {
        if (res.statusCode === 200) {
          try {
            const response = JSON.parse(data);
            if (response.status === 'ok' || response.healthy) {
              resolve(true);
            } else {
              reject(new Error('Health check failed: Invalid response'));
            }
          } catch (error) {
            // Якщо не JSON, але статус 200 - все добре
            resolve(true);
          }
        } else {
          reject(new Error(`Health check failed: HTTP ${res.statusCode}`));
        }
      });
    });
    
    req.on('error', (error) => {
      reject(new Error(`Health check failed: ${error.message}`));
    });
    
    req.on('timeout', () => {
      req.destroy();
      reject(new Error('Health check timeout'));
    });
    
    req.end();
  });
}

// Основна логіка
async function main() {
  try {
    await checkHealth();
    console.log('✅ Health check passed');
    process.exit(0);
  } catch (error) {
    console.error(`❌ Health check failed: ${error.message}`);
    process.exit(1);
  }
}

// Запускаємо health check
if (require.main === module) {
  main();
}

module.exports = { checkHealth };






