// ============================================
// Validation Middleware
// ============================================
// 
// Дата створення: 2025-01-XX
// Опис: Middleware для валідації request body
//
// ============================================

const { validateEmail, validatePhone, validatePassword, validateLoginInput } = require('../utils/validationUtils');

/**
 * Middleware для валідації реєстрації
 * Валідує email/phone, password, name, role
 */
function validateRegister(req, res, next) {
    const errors = [];
    const { email, phone, password, name, role } = req.body;

    // Перевірка name
    if (!name || typeof name !== 'string' || name.trim().length === 0) {
        errors.push({
            field: 'name',
            message: 'Ім\'я обов\'язкове'
        });
    }

    // Перевірка password
    if (!password) {
        errors.push({
            field: 'password',
            message: 'Пароль обов\'язковий'
        });
    } else {
        const passwordValidation = validatePassword(password);
        if (!passwordValidation.isValid) {
            errors.push({
                field: 'password',
                message: 'Пароль не відповідає вимогам',
                details: passwordValidation.errors
            });
        }
    }

    // Перевірка email або phone
    if (!email && !phone) {
        errors.push({
            field: 'identifier',
            message: 'Email або номер телефону обов\'язкові'
        });
    } else {
        if (email) {
            const emailValidation = validateEmail(email);
            if (!emailValidation.isValid) {
                errors.push({
                    field: 'email',
                    message: emailValidation.error
                });
            }
        }

        if (phone) {
            const phoneValidation = validatePhone(phone);
            if (!phoneValidation.isValid) {
                errors.push({
                    field: 'phone',
                    message: phoneValidation.error
                });
            }
        }
    }

    // Перевірка role
    if (role && !['admin', 'mentor'].includes(role)) {
        errors.push({
            field: 'role',
            message: 'Невірна роль. Дозволені: admin, mentor'
        });
    }

    if (errors.length > 0) {
        return res.status(400).json({
            error: 'Валідація не пройдена',
            message: 'Помилки валідації',
            errors: errors
        });
    }

    next();
}

/**
 * Middleware для валідації входу
 * Валідує identifier (email/phone) та password
 */
function validateLogin(req, res, next) {
    const errors = [];
    const { identifier, password } = req.body;

    // Перевірка identifier
    if (!identifier) {
        errors.push({
            field: 'identifier',
            message: 'Email або номер телефону обов\'язковий'
        });
    } else {
        const identifierValidation = validateLoginInput(identifier);
        if (!identifierValidation.isValid) {
            errors.push({
                field: 'identifier',
                message: identifierValidation.error
            });
        }
    }

    // Перевірка password
    if (!password || typeof password !== 'string' || password.length === 0) {
        errors.push({
            field: 'password',
            message: 'Пароль обов\'язковий'
        });
    }

    if (errors.length > 0) {
        return res.status(400).json({
            error: 'Валідація не пройдена',
            message: 'Помилки валідації',
            errors: errors
        });
    }

    next();
}

/**
 * Middleware для валідації refresh token
 */
function validateRefreshToken(req, res, next) {
    const { refresh_token } = req.body;

    if (!refresh_token || typeof refresh_token !== 'string' || refresh_token.trim().length === 0) {
        return res.status(400).json({
            error: 'Валідація не пройдена',
            message: 'Refresh token обов\'язковий',
            errors: [{
                field: 'refresh_token',
                message: 'Refresh token не може бути порожнім'
            }]
        });
    }

    next();
}

module.exports = {
    validateRegister,
    validateLogin,
    validateRefreshToken
};

