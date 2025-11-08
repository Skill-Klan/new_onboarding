// ============================================
// Утиліта для очищення прострочених токенів
// ============================================
// 
// Дата створення: 2025-01-XX
// Опис: Cron job для автоматичного очищення прострочених refresh tokens
//
// ============================================

const cron = require('node-cron');
const { cleanExpiredTokens } = require('./dbUtils');

/**
 * Запускає cron job для очищення прострочених токенів
 * Виконується щодня о 3:00 ранку
 * 
 * @param {Object} db - Database connection pool
 */
function startTokenCleanup(db) {
    if (!db) {
        console.error('[tokenCleanup] Database connection не надано');
        return;
    }

    // Запускаємо очищення щодня о 3:00 ранку
    // Формат: секунда хвилина година день місяць день_тижня
    cron.schedule('0 3 * * *', async () => {
        try {
            console.log('[tokenCleanup] Початок очищення прострочених токенів...');
            const deletedCount = await cleanExpiredTokens(db);
            console.log(`[tokenCleanup] Видалено ${deletedCount} прострочених токенів`);
        } catch (error) {
            console.error('[tokenCleanup] Помилка очищення токенів:', error);
        }
    });

    console.log('[tokenCleanup] Cron job для очищення токенів запущено (щодня о 3:00)');
}

module.exports = {
    startTokenCleanup
};

