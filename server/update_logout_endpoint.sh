#!/bin/bash
cd /home/roman/new_onboarding/server

# Оновлюємо authController.js
cat > server/controllers/authController.js.backup2 << 'BACKUP_END'
// ============================================
// Контролер автентифікації
// ============================================
// 
// Дата створення: 2025-01-XX
// Опис: Контролери для реєстрації, входу, оновлення токенів та виходу
//
// ============================================

const { hashPassword, comparePassword, validatePassword } = require('../utils/passwordUtils');
const { generateAccessToken, generateRefreshToken, getRefreshTokenExpirationSeconds } = require('../utils/jwtUtils');
const { validateLoginInput, normalizePhone } = require('../utils/validationUtils');
const {
    findUserByIdentifier,
    findUserByEmail,
    findUserByPhone,
    createUser,
    updateUserLastLogin,
    saveRefreshToken,
    findRefreshToken,
    revokeRefreshToken,
    revokeAllUserTokens
} = require('../utils/dbUtils');

/**
 * Реєстрація нового користувача
 * POST /api/auth/register
 */
async function register(req, res) {
    try {
        const { email, phone, password, name, role } = req.body;

        // Валідація обов'язкових полів
        if (!password || !name) {
            return res.status(400).json({
                error: 'Валідація не пройдена',
                message: 'Пароль та ім\'я обов\'язкові'
            });
        }

        // Перевірка що email або phone надано
        if (!email && !phone) {
            return res.status(400).json({
                error: 'Валідація не пройдена',
                message: 'Email або номер телефону обов\'язкові'
            });
        }

        // Валідація email якщо надано
        if (email) {
            const emailValidation = require('../utils/validationUtils').validateEmail(email);
            if (!emailValidation.isValid) {
                return res.status(400).json({
                    error: 'Валідація не пройдена',
                    message: emailValidation.error
                });
            }
        }

        // Валідація phone якщо надано
        let normalizedPhone = null;
        if (phone) {
            const phoneValidation = require('../utils/validationUtils').validatePhone(phone);
            if (!phoneValidation.isValid) {
                return res.status(400).json({
                    error: 'Валідація не пройдена',
                    message: phoneValidation.error
                });
            }
            normalizedPhone = normalizePhone(phoneValidation.normalizedPhone);
        }

        // Валідація пароля
        const passwordValidation = validatePassword(password);
        if (!passwordValidation.isValid) {
            return res.status(400).json({
                error: 'Валідація не пройдена',
                message: 'Пароль не відповідає вимогам',
                details: passwordValidation.errors
            });
        }

        // Валідація ролі
        if (role && !['admin', 'mentor'].includes(role)) {
            return res.status(400).json({
                error: 'Валідація не пройдена',
                message: 'Невірна роль. Дозволені: admin, mentor'
            });
        }

        // Отримуємо database connection
        const db = req.app.locals.db || req.db;
        if (!db) {
            return res.status(500).json({
                error: 'Помилка сервера',
                message: 'Помилка підключення до бази даних'
            });
        }

        // Перевірка унікальності email
        if (email) {
            const existingUserByEmail = await findUserByEmail(db, email);
            if (existingUserByEmail) {
                return res.status(409).json({
                    error: 'Конфлікт',
                    message: 'Користувач з таким email вже існує'
                });
            }
        }

        // Перевірка унікальності phone
        if (normalizedPhone) {
            const existingUserByPhone = await findUserByPhone(db, normalizedPhone);
            if (existingUserByPhone) {
                return res.status(409).json({
                    error: 'Конфлікт',
                    message: 'Користувач з таким номером телефону вже існує'
                });
            }
        }

        // Хешуємо пароль
        const passwordHash = await hashPassword(password);

        // Створюємо користувача
        const userData = {
            email: email || null,
            phone: normalizedPhone,
            password_hash: passwordHash,
            role: role || 'mentor',
            name: name
        };

        const user = await createUser(db, userData);

        // Генеруємо токени
        const accessToken = generateAccessToken(user);
        const refreshToken = generateRefreshToken();
        const expiresAt = new Date(Date.now() + getRefreshTokenExpirationSeconds() * 1000);

        // Зберігаємо refresh token
        await saveRefreshToken(db, user.id, refreshToken, expiresAt);

        // Повертаємо результат (без password_hash)
        res.status(201).json({
            user: {
                id: user.id,
                email: user.email,
                phone: user.phone,
                role: user.role,
                name: user.name,
                created_at: user.created_at,
                is_active: user.is_active
            },
            tokens: {
                access_token: accessToken,
                refresh_token: refreshToken,
                token_type: 'Bearer',
                expires_in: 15 * 60 // 15 хвилин в секундах
            }
        });
    } catch (error) {
        console.error('[authController] Помилка реєстрації:', error);
        
        // Обробка помилок унікальності
        if (error.message.includes('вже зайнятий') || error.message.includes('вже існує')) {
            return res.status(409).json({
                error: 'Конфлікт',
                message: error.message
            });
        }

        res.status(500).json({
            error: 'Помилка сервера',
            message: 'Не вдалося зареєструвати користувача'
        });
    }
}

/**
 * Вхід користувача
 * POST /api/auth/login
 */
async function login(req, res) {
    try {
        const { identifier, password } = req.body;

        // Валідація обов'язкових полів
        if (!identifier || !password) {
            return res.status(400).json({
                error: 'Валідація не пройдена',
                message: 'Email/номер телефону та пароль обов\'язкові'
            });
        }

        // Валідація identifier
        const identifierValidation = validateLoginInput(identifier);
        if (!identifierValidation.isValid) {
            return res.status(400).json({
                error: 'Валідація не пройдена',
                message: identifierValidation.error
            });
        }

        // Отримуємо database connection
        const db = req.app.locals.db || req.db;
        if (!db) {
            return res.status(500).json({
                error: 'Помилка сервера',
                message: 'Помилка підключення до бази даних'
            });
        }

        // Нормалізуємо identifier для пошуку
        const searchIdentifier = identifierValidation.type === 'phone' && identifierValidation.normalizedPhone
            ? identifierValidation.normalizedPhone
            : identifier;

        // Знаходимо користувача
        const user = await findUserByIdentifier(db, searchIdentifier);

        if (!user) {
            return res.status(401).json({
                error: 'Не авторизовано',
                message: 'Невірний email/номер телефону або пароль'
            });
        }

        // Перевіряємо пароль
        const isPasswordValid = await comparePassword(password, user.password_hash);

        if (!isPasswordValid) {
            return res.status(401).json({
                error: 'Не авторизовано',
                message: 'Невірний email/номер телефону або пароль'
            });
        }

        // Перевіряємо що користувач активний
        if (!user.is_active) {
            return res.status(401).json({
                error: 'Не авторизовано',
                message: 'Користувач деактивований'
            });
        }

        // Оновлюємо last_login_at
        await updateUserLastLogin(db, user.id);

        // Генеруємо токени
        const accessToken = generateAccessToken(user);
        const refreshToken = generateRefreshToken();
        const expiresAt = new Date(Date.now() + getRefreshTokenExpirationSeconds() * 1000);

        // Зберігаємо refresh token
        await saveRefreshToken(db, user.id, refreshToken, expiresAt);

        // Повертаємо результат (без password_hash)
        const { password_hash, ...userWithoutPassword } = user;
        res.json({
            user: userWithoutPassword,
            tokens: {
                access_token: accessToken,
                refresh_token: refreshToken,
                token_type: 'Bearer',
                expires_in: 15 * 60 // 15 хвилин в секундах
            }
        });
    } catch (error) {
        console.error('[authController] Помилка входу:', error);
        res.status(500).json({
            error: 'Помилка сервера',
            message: 'Не вдалося увійти'
        });
    }
}

/**
 * Оновлення access token
 * POST /api/auth/refresh
 */
async function refreshToken(req, res) {
    try {
        const { refresh_token } = req.body;

        if (!refresh_token) {
            return res.status(400).json({
                error: 'Валідація не пройдена',
                message: 'Refresh token обов\'язковий'
            });
        }

        // Отримуємо database connection
        const db = req.app.locals.db || req.db;
        if (!db) {
            return res.status(500).json({
                error: 'Помилка сервера',
                message: 'Помилка підключення до бази даних'
            });
        }

        // Знаходимо refresh token в базі даних
        const tokenRecord = await findRefreshToken(db, refresh_token);

        if (!tokenRecord) {
            return res.status(401).json({
                error: 'Не авторизовано',
                message: 'Невірний refresh token'
            });
        }

        // Перевіряємо що токен не відкликаний
        if (tokenRecord.revoked) {
            return res.status(401).json({
                error: 'Не авторизовано',
                message: 'Refresh token відкликаний'
            });
        }

        // Перевіряємо що токен не прострочений
        const expiresAt = new Date(tokenRecord.expires_at);
        if (expiresAt < new Date()) {
            return res.status(401).json({
                error: 'Не авторизовано',
                message: 'Refresh token прострочений'
            });
        }

        // Перевіряємо що користувач активний
        if (!tokenRecord.is_active) {
            return res.status(401).json({
                error: 'Не авторизовано',
                message: 'Користувач деактивований'
            });
        }

        // Створюємо user об'єкт для генерації токена
        const user = {
            id: tokenRecord.user_id,
            email: tokenRecord.email,
            phone: tokenRecord.phone,
            role: tokenRecord.role,
            name: tokenRecord.name
        };

        // Генеруємо новий access token
        const accessToken = generateAccessToken(user);

        // Повертаємо новий access token
        res.json({
            access_token: accessToken,
            token_type: 'Bearer',
            expires_in: 15 * 60 // 15 хвилин в секундах
        });
    } catch (error) {
        console.error('[authController] Помилка оновлення токена:', error);
        res.status(500).json({
            error: 'Помилка сервера',
            message: 'Не вдалося оновити токен'
        });
    }
}

/**
 * Вихід користувача
 * POST /api/auth/logout
 */
async function logout(req, res) {
    try {
        const { refresh_token } = req.body;

        // Отримуємо database connection
        const db = req.app.locals.db || req.db;
        if (!db) {
            return res.status(500).json({
                error: 'Помилка сервера',
                message: 'Помилка підключення до бази даних'
            });
        }

        // Якщо передано refresh_token - відкликаємо його
        if (refresh_token) {
            await revokeRefreshToken(db, refresh_token);
        } else if (req.user && req.user.id) {
            // Якщо користувач авторизований - відкликаємо всі його токени
            await revokeAllUserTokens(db, req.user.id);
        } else {
            // Якщо нічого не передано - просто повертаємо успіх
            return res.json({
                success: true,
                message: 'Вихід виконано'
            });
        }

        res.json({
            success: true,
            message: 'Вихід виконано'
        });
    } catch (error) {
        console.error('[authController] Помилка виходу:', error);
        res.status(500).json({
            error: 'Помилка сервера',
            message: 'Не вдалося вийти'
        });
    }
}

/**
 * Отримання поточного користувача
 * GET /api/auth/me
 */
async function getCurrentUser(req, res) {
    try {
        // Користувач вже доданий в req.user через authenticateToken middleware
        if (!req.user) {
            return res.status(401).json({
                error: 'Не авторизовано',
                message: 'Користувач не авторизований'
            });
        }

        res.json({
            user: req.user
        });
    } catch (error) {
        console.error('[authController] Помилка отримання користувача:', error);
        res.status(500).json({
            error: 'Помилка сервера',
            message: 'Не вдалося отримати інформацію про користувача'
        });
    }
}

module.exports = {
    register,
    login,
    refreshToken,
    logout,
    getCurrentUser
};
BACKUP_END

# Оновлюємо routes
sed -i 's/router.post('\''\/logout'\'', authenticateToken, logout);/router.post('\''\/logout'\'', logout);/g' server/routes/authRoutes.js

# Додаємо логіку в logout функцію
python3 << 'PYTHON_END'
import re

with open('server/controllers/authController.js', 'r', encoding='utf-8') as f:
    content = f.read()

# Замінюємо logout функцію
old_logout = r'async function logout\(req, res\) \{[^}]*\}'

new_logout = '''async function logout(req, res) {
    try {
        console.log('[authController] logout() called');
        const { refresh_token } = req.body;
        console.log('[authController] Request body refresh_token:', refresh_token ? 'present' : 'not present');

        // Отримуємо database connection
        const db = req.app.locals.db || req.db;
        if (!db) {
            console.error('[authController] Database connection not found');
            return res.status(500).json({
                error: 'Помилка сервера',
                message: 'Помилка підключення до бази даних'
            });
        }

        // Спробуємо отримати користувача з access token (опціонально)
        let userIdFromToken = null;
        try {
            const authHeader = req.headers['authorization'];
            if (authHeader) {
                const parts = authHeader.split(' ');
                if (parts.length === 2 && parts[0] === 'Bearer') {
                    const { verifyToken } = require('../utils/jwtUtils');
                    const decoded = verifyToken(parts[1]);
                    if (decoded && decoded.type === 'access') {
                        userIdFromToken = decoded.id;
                        console.log('[authController] User ID from access token:', userIdFromToken);
                    }
                }
            }
        } catch (tokenError) {
            // Access token прострочений або невалідний - це нормально для logout
            console.log('[authController] Access token validation failed (expected for logout):', tokenError.message);
        }

        // Якщо передано refresh_token - відкликаємо його
        if (refresh_token) {
            console.log('[authController] Revoking refresh token...');
            try {
                const { revokeRefreshToken } = require('../utils/dbUtils');
                await revokeRefreshToken(db, refresh_token);
                console.log('[authController] Refresh token revoked successfully');
            } catch (revokeError) {
                console.error('[authController] Error revoking refresh token:', revokeError.message);
                // Продовжуємо навіть якщо не вдалося відкликати (можливо токен вже видалений)
            }
            
            res.json({
                success: true,
                message: 'Вихід виконано'
            });
            return;
        }

        // Якщо є user ID з access token - відкликаємо всі його токени
        if (userIdFromToken) {
            console.log('[authController] Revoking all tokens for user:', userIdFromToken);
            try {
                const { revokeAllUserTokens } = require('../utils/dbUtils');
                await revokeAllUserTokens(db, userIdFromToken);
                console.log('[authController] All user tokens revoked successfully');
            } catch (revokeError) {
                console.error('[authController] Error revoking all user tokens:', revokeError.message);
                // Продовжуємо навіть якщо не вдалося відкликати
            }
            
            res.json({
                success: true,
                message: 'Вихід виконано'
            });
            return;
        }

        // Якщо нічого не передано - просто повертаємо успіх
        // (локальні дані на клієнті все одно будуть очищені)
        console.log('[authController] No refresh_token or access token provided, returning success');
        res.json({
            success: true,
            message: 'Вихід виконано'
        });
    } catch (error) {
        console.error('[authController] Помилка виходу:', error);
        console.error('[authController] Error stack:', error.stack);
        res.status(500).json({
            error: 'Помилка сервера',
            message: 'Не вдалося вийти'
        });
    }
}'''

# Знаходимо та замінюємо logout функцію
pattern = r'async function logout\(req, res\) \{.*?\n\}'
matches = list(re.finditer(pattern, content, re.DOTALL))

if matches:
    match = matches[0]
    content = content[:match.start()] + new_logout + content[match.end():]
    
    with open('server/controllers/authController.js', 'w', encoding='utf-8') as f:
        f.write(content)
    print('Logout function updated successfully')
else:
    print('Could not find logout function')

PYTHON_END

echo 'Endpoint updated'
