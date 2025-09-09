/**
 * StateMiddleware - Middleware для роботи зі станом користувача
 * 
 * Завантажує поточний стан користувача з БД та додає його в контекст.
 * Завжди дозволяє продовження обробки.
 */

const BaseMiddleware = require('./BaseMiddleware');
const { BotStep } = require('../types');

class StateMiddleware extends BaseMiddleware {
  constructor(databaseService) {
    super();
    this.databaseService = databaseService;
    this.log('Ініціалізація StateMiddleware');
  }

  /**
   * Обробка middleware
   */
  async process(ctx) {
    this.log('Обробка стану користувача');
    
    try {
      // Перевіряємо чи є користувач в контексті
      if (!ctx.user) {
        this.log('Користувач не знайдено в контексті');
        return { continue: true };
      }
      
      // Завантажуємо стан користувача
      const userState = await this.loadUserState(ctx.user.telegram_id);
      
      if (userState) {
        // Додаємо стан в контекст
        ctx.userState = userState;
        this.log('Стан користувача завантажено:', userState.current_step);
      } else {
        // Створюємо початковий стан
        ctx.userState = this.createInitialState(ctx.user);
        this.log('Створено початковий стан користувача');
      }
      
      return { continue: true, data: { userState: ctx.userState } };
      
    } catch (error) {
      console.error('❌ StateMiddleware: Помилка завантаження стану:', error);
      // Навіть при помилці дозволяємо продовження
      return { continue: true };
    }
  }

  /**
   * Завантаження стану користувача з БД
   */
  async loadUserState(telegramId) {
    try {
      return await this.databaseService.getUserByTelegramId(telegramId);
    } catch (error) {
      console.error('❌ StateMiddleware: Помилка завантаження стану:', error);
      return null;
    }
  }

  /**
   * Створення початкового стану
   */
  createInitialState(user) {
    return {
      telegram_id: user.telegram_id,
      current_step: BotStep.START,
      selected_profession: null,
      contact_data: null,
      task_sent: false,
      last_activity: new Date(),
      created_at: new Date()
    };
  }

  /**
   * Оновлення стану користувача
   */
  async updateUserState(telegramId, updates) {
    try {
      this.log('Оновлення стану користувача:', updates);
      await this.databaseService.updateUser(telegramId, updates);
    } catch (error) {
      console.error('❌ StateMiddleware: Помилка оновлення стану:', error);
      throw error;
    }
  }

  /**
   * Оновлення кроку користувача
   */
  async updateUserStep(telegramId, step) {
    return this.updateUserState(telegramId, { 
      current_step: step,
      last_activity: new Date()
    });
  }

  /**
   * Оновлення професії користувача
   */
  async updateUserProfession(telegramId, profession) {
    return this.updateUserState(telegramId, { 
      selected_profession: profession,
      last_activity: new Date()
    });
  }
}

module.exports = StateMiddleware;
