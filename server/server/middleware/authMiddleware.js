// ============================================
// Middleware для автентифікації
// ============================================
// 
// Дата створення: 2025-01-XX
// Опис: Middleware для перевірки JWT токенів та автентифікації користувачів
//
// ============================================

const { verifyToken } = require('../utils/jwtUtils');
const { findUserById } = require('../utils/dbUtils');

/**
 * Middleware для автентифікації користувача через JWT token
 * Витягує токен з заголовка Authorization (Bearer token)
 * Валідує токен та додає user об'єкт в req.user
 * 
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 */
async function authenticateToken(req, res, next) {
    try {
        // Витягуємо токен з заголовка Authorization
        const authHeader = req.headers['authorization'];
        
        if (!authHeader) {
            return res.status(401).json({
                error: 'Необхідна авторизація',
                message: 'Токен доступу не надано'
            });
        }

        // Перевіряємо формат Bearer token
        const parts = authHeader.split(' ');
        if (parts.length !== 2 || parts[0] !== 'Bearer') {
            return res.status(401).json({
                error: 'Необхідна авторизація',
                message: 'Невірний формат токена. Очікується: Bearer <token>'
            });
        }

        const token = parts[1];

        if (!token || token.trim().length === 0) {
            return res.status(401).json({
                error: 'Необхідна авторизація',
                message: 'Токен не може бути порожнім'
            });
        }

        // Валідуємо токен
        let decoded;
        try {
            decoded = verifyToken(token);
        } catch (error) {
            return res.status(401).json({
                error: 'Необхідна авторизація',
                message: error.message || 'Невірний або прострочений токен'
            });
        }

        // Перевіряємо що це access token
        if (decoded.type !== 'access') {
            return res.status(401).json({
                error: 'Необхідна авторизація',
                message: 'Невірний тип токена'
            });
        }

        // Отримуємо database connection з req.app.locals або req.db
        // Припускаємо що db connection додається в app.locals.db
        const db = req.app.locals.db || req.db;
        
        if (!db) {
            console.error('[authMiddleware] Database connection не знайдено');
            return res.status(500).json({
                error: 'Помилка сервера',
                message: 'Помилка підключення до бази даних'
            });
        }

        // Знаходимо користувача в базі даних
        const user = await findUserById(db, decoded.id);

        if (!user) {
            return res.status(401).json({
                error: 'Необхідна авторизація',
                message: 'Користувач не знайдений'
            });
        }

        // Перевіряємо що користувач активний
        if (!user.is_active) {
            return res.status(401).json({
                error: 'Необхідна авторизація',
                message: 'Користувач деактивований'
            });
        }

        // Додаємо user в req (без password_hash)
        const { password_hash, ...userWithoutPassword } = user;
        req.user = userWithoutPassword;

        // Додаємо decoded token для подальшого використання
        req.token = decoded;

        next();
    } catch (error) {
        console.error('[authMiddleware] Помилка автентифікації:', error);
        return res.status(500).json({
            error: 'Помилка сервера',
            message: 'Помилка під час автентифікації'
        });
    }
}

module.exports = {
    authenticateToken
};

