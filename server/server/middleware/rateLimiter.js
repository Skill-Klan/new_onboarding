// ============================================
// Rate Limiter Middleware
// ============================================
// 
// Дата створення: 2025-01-XX
// Опис: Rate limiting для захисту від brute force атак
//
// ============================================

const rateLimit = require('express-rate-limit');

/**
 * Rate limiter для /api/auth/login
 * 10 спроб на 15 хвилин
 * Використовує стандартний keyGenerator (IP адреса)
 * Успішні запити не рахуються (skipSuccessfulRequests: true)
 */
const loginLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 хвилин
    max: 10, // 10 спроб (збільшено з 5)
    message: {
        error: 'Занадто багато спроб',
        message: 'Занадто багато невдалих спроб входу. Спробуйте через 15 хвилин.'
    },
    standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
    legacyHeaders: false, // Disable the `X-RateLimit-*` headers
    skipSuccessfulRequests: true // Успішні запити не рахуються (тільки невдалі)
    // Використовуємо стандартний keyGenerator (IP адреса автоматично)
    // Не додаємо кастомний keyGenerator, щоб уникнути проблем з IPv6
});

/**
 * Rate limiter для /api/auth/register
 * 5 спроб на годину
 * Використовує стандартний keyGenerator (IP адреса)
 */
const registerLimiter = rateLimit({
    windowMs: 60 * 60 * 1000, // 1 година
    max: 5, // 5 спроб (збільшено з 3)
    message: {
        error: 'Занадто багато спроб',
        message: 'Занадто багато спроб реєстрації. Спробуйте через годину.'
    },
    standardHeaders: true,
    legacyHeaders: false,
    skipSuccessfulRequests: false
    // Використовуємо стандартний keyGenerator (IP адреса автоматично)
    // Не додаємо кастомний keyGenerator, щоб уникнути проблем з IPv6
});

module.exports = {
    loginLimiter,
    registerLimiter
};
