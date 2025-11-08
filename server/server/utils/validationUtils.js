// ============================================
// Утиліта для валідації вхідних даних
// ============================================
// 
// Дата створення: 2025-01-XX
// Опис: Функції для валідації email, phone, login input та password
//
// ============================================

/**
 * Валідує email формат
 * @param {string} email - Email для валідації
 * @returns {{isValid: boolean, error?: string}} - Результат валідації
 */
function validateEmail(email) {
    if (!email || typeof email !== 'string') {
        return {
            isValid: false,
            error: 'Email не може бути порожнім'
        };
    }

    // Базовий regex для email (RFC 5322 спрощений)
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!emailRegex.test(email)) {
        return {
            isValid: false,
            error: 'Невірний формат email'
        };
    }

    // Перевірка довжини
    if (email.length > 255) {
        return {
            isValid: false,
            error: 'Email занадто довгий (максимум 255 символів)'
        };
    }

    return {
        isValid: true
    };
}

/**
 * Валідує номер телефону (український формат)
 * Підтримує формати:
 * - +380XXXXXXXXX
 * - 380XXXXXXXXX
 * - 0XXXXXXXXX
 * 
 * @param {string} phone - Номер телефону для валідації
 * @returns {{isValid: boolean, error?: string}} - Результат валідації
 */
function validatePhone(phone) {
    if (!phone || typeof phone !== 'string') {
        return {
            isValid: false,
            error: 'Номер телефону не може бути порожнім'
        };
    }

    // Видаляємо всі пробіли, дефіси та дужки
    const cleanedPhone = phone.replace(/[\s\-()]/g, '');

    // Перевірка формату українського номера
    // +380XXXXXXXXX або 380XXXXXXXXX або 0XXXXXXXXX
    const phoneRegex = /^(\+?380|0)\d{9}$/;

    if (!phoneRegex.test(cleanedPhone)) {
        return {
            isValid: false,
            error: 'Невірний формат номера телефону. Очікується український формат (+380XXXXXXXXX, 380XXXXXXXXX або 0XXXXXXXXX)'
        };
    }

    // Перевірка довжини (після очищення)
    if (cleanedPhone.length < 10 || cleanedPhone.length > 13) {
        return {
            isValid: false,
            error: 'Невірна довжина номера телефону'
        };
    }

    return {
        isValid: true,
        normalizedPhone: cleanedPhone // Повертаємо нормалізований номер
    };
}

/**
 * Валідує login input (identifier - email або phone)
 * @param {string} identifier - Email або phone для валідації
 * @returns {{isValid: boolean, type?: 'email'|'phone', error?: string}} - Результат валідації
 */
function validateLoginInput(identifier) {
    if (!identifier || typeof identifier !== 'string') {
        return {
            isValid: false,
            error: 'Email або номер телефону не може бути порожнім'
        };
    }

    // Спробуємо валідувати як email
    const emailValidation = validateEmail(identifier);
    if (emailValidation.isValid) {
        return {
            isValid: true,
            type: 'email'
        };
    }

    // Спробуємо валідувати як phone
    const phoneValidation = validatePhone(identifier);
    if (phoneValidation.isValid) {
        return {
            isValid: true,
            type: 'phone',
            normalizedPhone: phoneValidation.normalizedPhone
        };
    }

    // Якщо ні email, ні phone не валідні
    return {
        isValid: false,
        error: 'Невірний формат email або номера телефону'
    };
}

/**
 * Валідує пароль (використовує функцію з passwordUtils)
 * @param {string} password - Пароль для валідації
 * @returns {{isValid: boolean, errors?: string[]}} - Результат валідації
 */
function validatePassword(password) {
    // Імпортуємо функцію валідації пароля
    const { validatePassword: validatePasswordStrength } = require('./passwordUtils');
    return validatePasswordStrength(password);
}

/**
 * Нормалізує номер телефону до формату +380XXXXXXXXX
 * @param {string} phone - Номер телефону для нормалізації
 * @returns {string} - Нормалізований номер телефону
 */
function normalizePhone(phone) {
    if (!phone || typeof phone !== 'string') {
        return phone;
    }

    // Видаляємо всі пробіли, дефіси та дужки
    let cleanedPhone = phone.replace(/[\s\-()]/g, '');

    // Нормалізуємо до формату +380XXXXXXXXX
    if (cleanedPhone.startsWith('0')) {
        cleanedPhone = '+380' + cleanedPhone.substring(1);
    } else if (cleanedPhone.startsWith('380')) {
        cleanedPhone = '+' + cleanedPhone;
    } else if (!cleanedPhone.startsWith('+380')) {
        cleanedPhone = '+380' + cleanedPhone;
    }

    return cleanedPhone;
}

module.exports = {
    validateEmail,
    validatePhone,
    validateLoginInput,
    validatePassword,
    normalizePhone
};

