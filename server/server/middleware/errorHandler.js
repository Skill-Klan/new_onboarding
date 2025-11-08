// ============================================
// Error Handler Middleware
// ============================================
// 
// Дата створення: 2025-01-XX
// Опис: Централізована обробка помилок
//
// ============================================

/**
 * Централізований error handler middleware
 * Має бути доданий останнім в ланцюжку middleware
 * 
 * @param {Error} err - Error object
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 */
function errorHandler(err, req, res, next) {
    // Логуємо помилку (без PII)
    console.error('[ErrorHandler]', {
        message: err.message,
        stack: process.env.NODE_ENV === 'development' ? err.stack : undefined,
        path: req.path,
        method: req.method,
        statusCode: err.statusCode || 500
    });

    // Визначаємо статус код
    const statusCode = err.statusCode || 500;

    // Форматуємо відповідь
    const response = {
        error: getErrorType(statusCode),
        message: err.message || 'Внутрішня помилка сервера'
    };

    // Додаємо деталі тільки в development режимі
    if (process.env.NODE_ENV === 'development') {
        response.details = err.stack;
    }

    res.status(statusCode).json(response);
}

/**
 * Отримує тип помилки по статус коду
 * @param {number} statusCode - HTTP status code
 * @returns {string} - Тип помилки
 */
function getErrorType(statusCode) {
    switch (statusCode) {
        case 400:
            return 'Помилка валідації';
        case 401:
            return 'Не авторизовано';
        case 403:
            return 'Доступ заборонено';
        case 404:
            return 'Не знайдено';
        case 409:
            return 'Конфлікт';
        case 500:
        default:
            return 'Помилка сервера';
    }
}

module.exports = {
    errorHandler
};

