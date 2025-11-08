// ============================================
// Утиліта для хешування та валідації паролів
// ============================================
// 
// Дата створення: 2025-01-XX
// Опис: Функції для хешування паролів з використанням bcrypt
//       та валідації сили пароля
//
// ============================================

const bcrypt = require('bcrypt');

// Кількість раундів для bcrypt (можна налаштувати через environment variable)
const SALT_ROUNDS = parseInt(process.env.BCRYPT_SALT_ROUNDS) || 12;

/**
 * Хешує пароль з використанням bcrypt
 * @param {string} password - Пароль для хешування
 * @returns {Promise<string>} - Хешований пароль
 * @throws {Error} - Якщо пароль порожній або невалідний
 */
async function hashPassword(password) {
    if (!password || typeof password !== 'string' || password.trim().length === 0) {
        throw new Error('Пароль не може бути порожнім');
    }

    try {
        const hash = await bcrypt.hash(password, SALT_ROUNDS);
        return hash;
    } catch (error) {
        throw new Error(`Помилка хешування пароля: ${error.message}`);
    }
}

/**
 * Порівнює пароль з хешем
 * @param {string} password - Пароль для перевірки
 * @param {string} hash - Хешований пароль
 * @returns {Promise<boolean>} - true якщо пароль відповідає хешу
 * @throws {Error} - Якщо параметри невалідні
 */
async function comparePassword(password, hash) {
    if (!password || typeof password !== 'string') {
        throw new Error('Пароль не може бути порожнім');
    }

    if (!hash || typeof hash !== 'string') {
        throw new Error('Хеш не може бути порожнім');
    }

    try {
        const isMatch = await bcrypt.compare(password, hash);
        return isMatch;
    } catch (error) {
        throw new Error(`Помилка порівняння пароля: ${error.message}`);
    }
}

/**
 * Валідує силу пароля
 * Вимоги:
 * - Мінімум 8 символів
 * - Хоча б одна цифра
 * - Хоча б одна літера (латиниця або кирилиця)
 * 
 * @param {string} password - Пароль для валідації
 * @returns {{isValid: boolean, errors: string[]}} - Результат валідації
 */
function validatePassword(password) {
    const errors = [];

    if (!password || typeof password !== 'string') {
        return {
            isValid: false,
            errors: ['Пароль не може бути порожнім']
        };
    }

    // Мінімум 8 символів
    if (password.length < 8) {
        errors.push('Пароль повинен містити мінімум 8 символів');
    }

    // Хоча б одна цифра
    if (!/\d/.test(password)) {
        errors.push('Пароль повинен містити хоча б одну цифру');
    }

    // Хоча б одна літера (латиниця або кирилиця)
    if (!/[a-zA-Zа-яА-ЯіІїЇєЄ]/.test(password)) {
        errors.push('Пароль повинен містити хоча б одну літеру');
    }

    return {
        isValid: errors.length === 0,
        errors: errors
    };
}

module.exports = {
    hashPassword,
    comparePassword,
    validatePassword,
    SALT_ROUNDS
};

