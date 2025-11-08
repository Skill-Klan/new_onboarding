// ============================================
// Утиліта для роботи з базою даних (users та refresh_tokens)
// ============================================
// 
// Дата створення: 2025-01-XX
// Опис: Функції для роботи з таблицями users та refresh_tokens
//       Використовує node-postgres (pg)
//
// ============================================

const { normalizePhone } = require('./validationUtils');

/**
 * Знаходить користувача по email або phone
 * @param {Object} db - Database connection pool або client
 * @param {string} identifier - Email або phone
 * @returns {Promise<Object|null>} - Користувач або null
 */
async function findUserByIdentifier(db, identifier) {
    if (!identifier || typeof identifier !== 'string') {
        return null;
    }

    // Нормалізуємо phone якщо потрібно
    const phoneValidation = require('./validationUtils').validatePhone(identifier);
    const normalizedIdentifier = phoneValidation.isValid && phoneValidation.normalizedPhone 
        ? normalizePhone(phoneValidation.normalizedPhone)
        : identifier;

    try {
        // Спочатку шукаємо по email
        const emailResult = await db.query(
            'SELECT * FROM auth_users WHERE email = $1 AND is_active = true',
            [identifier]
        );

        if (emailResult.rows.length > 0) {
            return emailResult.rows[0];
        }

        // Потім шукаємо по phone (нормалізованому)
        const phoneResult = await db.query(
            'SELECT * FROM auth_users WHERE phone = $1 AND is_active = true',
            [normalizedIdentifier]
        );

        if (phoneResult.rows.length > 0) {
            return phoneResult.rows[0];
        }

        return null;
    } catch (error) {
        throw new Error(`Помилка пошуку користувача: ${error.message}`);
    }
}

/**
 * Знаходить користувача по email
 * @param {Object} db - Database connection pool або client
 * @param {string} email - Email
 * @returns {Promise<Object|null>} - Користувач або null
 */
async function findUserByEmail(db, email) {
    if (!email || typeof email !== 'string') {
        return null;
    }

    try {
        const result = await db.query(
            'SELECT * FROM auth_users WHERE email = $1',
            [email]
        );

        return result.rows.length > 0 ? result.rows[0] : null;
    } catch (error) {
        throw new Error(`Помилка пошуку користувача по email: ${error.message}`);
    }
}

/**
 * Знаходить користувача по phone
 * @param {Object} db - Database connection pool або client
 * @param {string} phone - Phone
 * @returns {Promise<Object|null>} - Користувач або null
 */
async function findUserByPhone(db, phone) {
    if (!phone || typeof phone !== 'string') {
        return null;
    }

    const normalizedPhone = normalizePhone(phone);

    try {
        const result = await db.query(
            'SELECT * FROM auth_users WHERE phone = $1',
            [normalizedPhone]
        );

        return result.rows.length > 0 ? result.rows[0] : null;
    } catch (error) {
        throw new Error(`Помилка пошуку користувача по phone: ${error.message}`);
    }
}

/**
 * Створює нового користувача
 * @param {Object} db - Database connection pool або client
 * @param {Object} userData - Дані користувача
 * @param {string} userData.email - Email (опціонально)
 * @param {string} userData.phone - Phone (опціонально)
 * @param {string} userData.password_hash - Хешований пароль
 * @param {string} userData.role - Роль (admin або mentor)
 * @param {string} userData.name - Ім'я
 * @returns {Promise<Object>} - Створений користувач
 */
async function createUser(db, userData) {
    const { email, phone, password_hash, role, name } = userData;

    // Нормалізуємо phone якщо він є
    const normalizedPhone = phone ? normalizePhone(phone) : null;

    // Валідація: email або phone обов'язково
    if (!email && !normalizedPhone) {
        throw new Error('Email або phone обов\'язкові');
    }

    // Валідація ролі
    if (role && !['admin', 'mentor'].includes(role)) {
        throw new Error('Невірна роль. Дозволені: admin, mentor');
    }

    try {
        // Використовуємо транзакцію
        const client = await db.connect();
        
        try {
            await client.query('BEGIN');

            const result = await client.query(
                `INSERT INTO auth_users (email, phone, password_hash, role, name)
                 VALUES ($1, $2, $3, $4, $5)
                 RETURNING id, email, phone, role, name, created_at, updated_at, last_login_at, is_active`,
                [email || null, normalizedPhone || null, password_hash, role || 'mentor', name]
            );

            await client.query('COMMIT');

            // Видаляємо password_hash з результату
            const user = result.rows[0];
            delete user.password_hash;

            return user;
        } catch (error) {
            await client.query('ROLLBACK');
            throw error;
        } finally {
            client.release();
        }
    } catch (error) {
        // Перевірка на унікальність
        if (error.code === '23505') { // PostgreSQL unique violation
            if (error.constraint && error.constraint.includes('email')) {
                throw new Error('Email вже зайнятий');
            } else if (error.constraint && error.constraint.includes('phone')) {
                throw new Error('Номер телефону вже зайнятий');
            }
            throw new Error('Користувач з таким email або phone вже існує');
        }
        throw new Error(`Помилка створення користувача: ${error.message}`);
    }
}

/**
 * Оновлює last_login_at для користувача
 * @param {Object} db - Database connection pool або client
 * @param {number} userId - ID користувача
 * @returns {Promise<void>}
 */
async function updateUserLastLogin(db, userId) {
    if (!userId || typeof userId !== 'number') {
        throw new Error('ID користувача невалідний');
    }

    try {
        await db.query(
            'UPDATE auth_users SET last_login_at = CURRENT_TIMESTAMP WHERE id = $1',
            [userId]
        );
    } catch (error) {
        throw new Error(`Помилка оновлення last_login_at: ${error.message}`);
    }
}

/**
 * Знаходить користувача по ID
 * @param {Object} db - Database connection pool або client
 * @param {number} userId - ID користувача
 * @returns {Promise<Object|null>} - Користувач або null
 */
async function findUserById(db, userId) {
    if (!userId || typeof userId !== 'number') {
        return null;
    }

    try {
        const result = await db.query(
            'SELECT * FROM auth_users WHERE id = $1',
            [userId]
        );

        return result.rows.length > 0 ? result.rows[0] : null;
    } catch (error) {
        throw new Error(`Помилка пошуку користувача по ID: ${error.message}`);
    }
}

/**
 * Зберігає refresh token
 * @param {Object} db - Database connection pool або client
 * @param {number} userId - ID користувача
 * @param {string} token - Refresh token
 * @param {Date} expiresAt - Дата закінчення
 * @returns {Promise<void>}
 */
async function saveRefreshToken(db, userId, token, expiresAt) {
    if (!userId || typeof userId !== 'number') {
        throw new Error('ID користувача невалідний');
    }

    if (!token || typeof token !== 'string') {
        throw new Error('Token невалідний');
    }

    if (!expiresAt || !(expiresAt instanceof Date)) {
        throw new Error('Дата закінчення невалідна');
    }

    try {
        await db.query(
            `INSERT INTO refresh_tokens (user_id, token, expires_at)
             VALUES ($1, $2, $3)`,
            [userId, token, expiresAt]
        );
    } catch (error) {
        if (error.code === '23505') { // PostgreSQL unique violation
            throw new Error('Token вже існує');
        }
        throw new Error(`Помилка збереження refresh token: ${error.message}`);
    }
}

/**
 * Знаходить refresh token
 * @param {Object} db - Database connection pool або client
 * @param {string} token - Refresh token
 * @returns {Promise<Object|null>} - Refresh token або null
 */
async function findRefreshToken(db, token) {
    if (!token || typeof token !== 'string') {
        return null;
    }

    try {
        const result = await db.query(
            `SELECT rt.*, u.id as user_id, u.email, u.phone, u.role, u.name, u.is_active
             FROM refresh_tokens rt
             JOIN users u ON rt.user_id = u.id
             WHERE rt.token = $1`,
            [token]
        );

        return result.rows.length > 0 ? result.rows[0] : null;
    } catch (error) {
        throw new Error(`Помилка пошуку refresh token: ${error.message}`);
    }
}

/**
 * Відкликає refresh token
 * @param {Object} db - Database connection pool або client
 * @param {string} token - Refresh token
 * @returns {Promise<void>}
 */
async function revokeRefreshToken(db, token) {
    if (!token || typeof token !== 'string') {
        throw new Error('Token невалідний');
    }

    try {
        await db.query(
            'UPDATE refresh_tokens SET revoked = true WHERE token = $1',
            [token]
        );
    } catch (error) {
        throw new Error(`Помилка відкликання refresh token: ${error.message}`);
    }
}

/**
 * Відкликає всі refresh tokens користувача
 * @param {Object} db - Database connection pool або client
 * @param {number} userId - ID користувача
 * @returns {Promise<void>}
 */
async function revokeAllUserTokens(db, userId) {
    if (!userId || typeof userId !== 'number') {
        throw new Error('ID користувача невалідний');
    }

    try {
        await db.query(
            'UPDATE refresh_tokens SET revoked = true WHERE user_id = $1 AND revoked = false',
            [userId]
        );
    } catch (error) {
        throw new Error(`Помилка відкликання всіх токенів користувача: ${error.message}`);
    }
}

/**
 * Очищає прострочені refresh tokens
 * @param {Object} db - Database connection pool або client
 * @returns {Promise<number>} - Кількість видалених токенів
 */
async function cleanExpiredTokens(db) {
    try {
        const result = await db.query(
            'DELETE FROM refresh_tokens WHERE expires_at < CURRENT_TIMESTAMP OR revoked = true'
        );

        return result.rowCount || 0;
    } catch (error) {
        throw new Error(`Помилка очищення прострочених токенів: ${error.message}`);
    }
}

module.exports = {
    findUserByIdentifier,
    findUserByEmail,
    findUserByPhone,
    findUserById,
    createUser,
    updateUserLastLogin,
    saveRefreshToken,
    findRefreshToken,
    revokeRefreshToken,
    revokeAllUserTokens,
    cleanExpiredTokens
};

