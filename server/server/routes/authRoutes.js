// ============================================
// Routes для автентифікації
// ============================================
// 
// Дата створення: 2025-01-XX
// Опис: Маршрути для реєстрації, входу, оновлення токенів та виходу
//
// ============================================

const express = require('express');
const router = express.Router();

const {
    register,
    login,
    refreshToken,
    logout,
    getCurrentUser
} = require('../controllers/authController');

const { authenticateToken } = require('../middleware/authMiddleware');
const { validateRegister, validateLogin, validateRefreshToken } = require('../middleware/validationMiddleware');
const { loginLimiter, registerLimiter } = require('../middleware/rateLimiter');

/**
 * POST /api/auth/register
 * Реєстрація нового користувача
 */
router.post('/register', registerLimiter, validateRegister, register);

/**
 * POST /api/auth/login
 * Вхід користувача
 */
router.post('/login', loginLimiter, validateLogin, login);

/**
 * POST /api/auth/refresh
 * Оновлення access token
 */
router.post('/refresh', validateRefreshToken, refreshToken);

/**
 * POST /api/auth/logout
 * Вихід користувача
 * Може використовувати authenticateToken для відкликання всіх токенів
 */
router.post('/logout', logout);

/**
 * GET /api/auth/me
 * Отримання інформації про поточного користувача
 * Вимагає автентифікації
 */
router.get('/me', authenticateToken, getCurrentUser);

module.exports = router;

