// ============================================
// Middleware для фільтрації даних менторів
// ============================================
// 
// Дата створення: 2025-01-XX
// Опис: Middleware для додавання фільтрів даних для менторів
//       Ментори бачать тільки своїх студентів та їх дані
//
// ============================================

/**
 * Middleware для фільтрації даних менторів
 * Додає req.mentorFilter з обмеженнями для менторів
 * Для адмінів - не додає обмежень
 * 
 * Використовується після authenticateToken middleware
 * 
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 */
function filterMentorData(req, res, next) {
    try {
        // Перевіряємо що користувач автентифікований
        if (!req.user) {
            return res.status(401).json({
                error: 'Не авторизовано',
                message: 'Необхідна автентифікація'
            });
        }

        // Якщо користувач - адмін, не додаємо обмежень
        if (req.user.role === 'admin') {
            req.mentorFilter = null;
            return next();
        }

        // Якщо користувач - ментор, додаємо фільтри
        if (req.user.role === 'mentor') {
            req.mentorFilter = {
                mentorName: req.user.name,
                mentorEmail: req.user.email || null,
                mentorPhone: req.user.phone || null
            };
            return next();
        }

        // Якщо роль невідома - відмовляємо в доступі
        return res.status(403).json({
            error: 'Доступ заборонено',
            message: 'Невідома роль користувача'
        });
    } catch (error) {
        console.error('[mentorDataFilterMiddleware] Помилка фільтрації даних:', error);
        return res.status(500).json({
            error: 'Помилка сервера',
            message: 'Помилка під час фільтрації даних'
        });
    }
}

module.exports = {
    filterMentorData
};

