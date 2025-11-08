// ============================================
// Middleware для авторизації (перевірка ролей)
// ============================================
// 
// Дата створення: 2025-01-XX
// Опис: Middleware для перевірки ролей користувачів та контролю доступу
//
// ============================================

/**
 * Middleware factory для перевірки ролей
 * Використовується після authenticateToken middleware
 * 
 * @param {...string} roles - Дозволені ролі
 * @returns {Function} - Express middleware function
 */
function requireRole(...roles) {
    return (req, res, next) => {
        // Перевіряємо що користувач автентифікований
        if (!req.user) {
            return res.status(401).json({
                error: 'Не авторизовано',
                message: 'Необхідна автентифікація'
            });
        }

        // Перевіряємо що роль користувача в дозволених ролях
        if (!roles.includes(req.user.role)) {
            return res.status(403).json({
                error: 'Доступ заборонено',
                message: `Доступ дозволено тільки для ролей: ${roles.join(', ')}`
            });
        }

        next();
    };
}

/**
 * Middleware для перевірки що користувач - адміністратор
 * Шорткат для requireRole('admin')
 */
function requireAdmin() {
    return requireRole('admin');
}

/**
 * Middleware для перевірки що користувач - ментор
 * Шорткат для requireRole('mentor')
 */
function requireMentor() {
    return requireRole('mentor');
}

/**
 * Middleware для перевірки що користувач - адміністратор або ментор
 * Шорткат для requireRole('admin', 'mentor')
 */
function requireAdminOrMentor() {
    return requireRole('admin', 'mentor');
}

module.exports = {
    requireRole,
    requireAdmin,
    requireMentor,
    requireAdminOrMentor
};

