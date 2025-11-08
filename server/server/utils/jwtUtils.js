// ============================================
// Утиліта для роботи з JWT токенами
// ============================================
// 
// Дата створення: 2025-01-XX
// Опис: Функції для генерації та валідації JWT токенів
//       (access token та refresh token)
//
// ============================================

const jwt = require('jsonwebtoken');

// Секретний ключ для JWT (обов'язково з environment variable)
const JWT_SECRET = process.env.JWT_SECRET;
if (!JWT_SECRET) {
    throw new Error('JWT_SECRET не встановлено в environment variables');
}

// Час життя токенів (можна налаштувати через environment variables)
const ACCESS_TOKEN_EXPIRES_IN = process.env.JWT_ACCESS_EXPIRES_IN || '15m'; // 15 хвилин
const REFRESH_TOKEN_EXPIRES_IN = process.env.JWT_REFRESH_EXPIRES_IN || '7d'; // 7 днів

/**
 * Генерує access token для користувача
 * @param {Object} user - Об'єкт користувача
 * @param {number} user.id - ID користувача
 * @param {string} user.email - Email користувача (опціонально)
 * @param {string} user.phone - Phone користувача (опціонально)
 * @param {string} user.role - Роль користувача
 * @param {string} user.name - Ім'я користувача
 * @returns {string} - Access token
 */
function generateAccessToken(user) {
    const payload = {
        id: user.id,
        email: user.email,
        phone: user.phone,
        role: user.role,
        name: user.name,
        type: 'access'
    };

    const options = {
        expiresIn: ACCESS_TOKEN_EXPIRES_IN,
        issuer: 'skillklan-api',
        audience: 'skillklan-app'
    };

    return jwt.sign(payload, JWT_SECRET, options);
}

/**
 * Генерує refresh token (без payload, тільки випадковий рядок)
 * Refresh token зберігається в базі даних, тому тут генеруємо випадковий рядок
 * @returns {string} - Refresh token (випадковий рядок)
 */
function generateRefreshToken() {
    // Генеруємо випадковий рядок для refresh token
    // Використовуємо crypto для генерації безпечного випадкового рядка
    const crypto = require('crypto');
    return crypto.randomBytes(64).toString('hex');
}

/**
 * Валідує та декодує JWT токен
 * @param {string} token - JWT токен для валідації
 * @returns {Object} - Декодований payload токена
 * @throws {Error} - Якщо токен невалідний, прострочений або має невірний формат
 */
function verifyToken(token) {
    if (!token || typeof token !== 'string') {
        throw new Error('Токен не може бути порожнім');
    }

    try {
        const decoded = jwt.verify(token, JWT_SECRET, {
            issuer: 'skillklan-api',
            audience: 'skillklan-app'
        });

        return decoded;
    } catch (error) {
        if (error.name === 'TokenExpiredError') {
            throw new Error('Токен прострочений');
        } else if (error.name === 'JsonWebTokenError') {
            throw new Error('Невірний токен');
        } else if (error.name === 'NotBeforeError') {
            throw new Error('Токен ще не активний');
        } else {
            throw new Error(`Помилка валідації токена: ${error.message}`);
        }
    }
}

/**
 * Декодує JWT токен без перевірки підпису (для отримання user_id)
 * Використовується тільки для отримання інформації з токена, не для автентифікації
 * @param {string} token - JWT токен для декодування
 * @returns {Object} - Декодований payload токена
 * @throws {Error} - Якщо токен має невірний формат
 */
function decodeToken(token) {
    if (!token || typeof token !== 'string') {
        throw new Error('Токен не може бути порожнім');
    }

    try {
        const decoded = jwt.decode(token, { complete: true });
        if (!decoded) {
            throw new Error('Неможливо декодувати токен');
        }
        return decoded.payload;
    } catch (error) {
        throw new Error(`Помилка декодування токена: ${error.message}`);
    }
}

/**
 * Отримує час закінчення refresh token (в секундах)
 * @returns {number} - Час закінчення в секундах
 */
function getRefreshTokenExpirationSeconds() {
    const expiresIn = REFRESH_TOKEN_EXPIRES_IN;
    
    // Парсимо формат (7d, 24h, 3600s)
    const match = expiresIn.match(/^(\d+)([dhms])$/);
    if (!match) {
        // За замовчуванням 7 днів
        return 7 * 24 * 60 * 60;
    }

    const value = parseInt(match[1]);
    const unit = match[2];

    switch (unit) {
        case 'd':
            return value * 24 * 60 * 60; // дні в секунди
        case 'h':
            return value * 60 * 60; // години в секунди
        case 'm':
            return value * 60; // хвилини в секунди
        case 's':
            return value; // секунди
        default:
            return 7 * 24 * 60 * 60; // за замовчуванням 7 днів
    }
}

module.exports = {
    generateAccessToken,
    generateRefreshToken,
    verifyToken,
    decodeToken,
    getRefreshTokenExpirationSeconds,
    ACCESS_TOKEN_EXPIRES_IN,
    REFRESH_TOKEN_EXPIRES_IN
};

