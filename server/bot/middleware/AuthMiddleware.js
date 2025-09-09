/**
 * AuthMiddleware - Middleware для аутентифікації
 * 
 * Перевіряє чи є користувач в системі та створює його якщо потрібно.
 * Завжди дозволяє продовження обробки.
 */

const BaseMiddleware = require('./BaseMiddleware');

class AuthMiddleware extends BaseMiddleware {
  constructor(databaseService) {
    super();
    this.databaseService = databaseService;
    this.log('Ініціалізація AuthMiddleware');
  }

  /**
   * Обробка middleware
   */
  async process(ctx) {
    this.log('Обробка аутентифікації');
    
    try {
      // Отримуємо інформацію про користувача
      const userInfo = this.extractUserInfo(ctx);
      
      if (!userInfo) {
        this.log('Не вдалося отримати інформацію про користувача');
        return { continue: false, error: 'User info not available' };
      }
      
      // Перевіряємо чи є користувач в БД
      let user = await this.getUserFromDatabase(userInfo.id);
      
      if (!user) {
        // Створюємо нового користувача
        user = await this.createUser(userInfo);
        this.log('Створено нового користувача:', userInfo.id);
      } else {
        this.log('Користувач знайдено в БД:', userInfo.id);
      }
      
      // Додаємо користувача в контекст
      ctx.user = user;
      ctx.userInfo = userInfo;
      
      return { continue: true, data: { user, userInfo } };
      
    } catch (error) {
      console.error('❌ AuthMiddleware: Помилка аутентифікації:', error);
      // Навіть при помилці дозволяємо продовження
      return { continue: true };
    }
  }

  /**
   * Витягування інформації про користувача
   */
  extractUserInfo(ctx) {
    const from = ctx.message?.from || ctx.callbackQuery?.from;
    
    if (!from) {
      return null;
    }
    
    return {
      id: from.id,
      username: from.username,
      first_name: from.first_name,
      last_name: from.last_name,
      language_code: from.language_code
    };
  }

  /**
   * Отримання користувача з БД
   */
  async getUserFromDatabase(telegramId) {
    try {
      // Тут має бути реальний запит до БД
      // Поки що повертаємо заглушку
      return null;
    } catch (error) {
      console.error('❌ AuthMiddleware: Помилка отримання користувача:', error);
      return null;
    }
  }

  /**
   * Створення нового користувача
   */
  async createUser(userInfo) {
    try {
      // Тут має бути реальний запит до БД
      // Поки що повертаємо заглушку
      return {
        id: userInfo.id,
        telegram_id: userInfo.id,
        username: userInfo.username,
        first_name: userInfo.first_name,
        last_name: userInfo.last_name,
        current_step: 'start',
        created_at: new Date()
      };
    } catch (error) {
      console.error('❌ AuthMiddleware: Помилка створення користувача:', error);
      throw error;
    }
  }
}

module.exports = AuthMiddleware;
