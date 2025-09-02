// Сервіс для управління станом користувача

const { UserState, BotStep } = require('../types');

class UserStateService {
  constructor(databaseService) {
    this.databaseService = databaseService;
    this.memoryCache = new Map(); // Кеш в пам'яті для швидкого доступу
  }

  /**
   * Отримати стан користувача
   */
  async getState(telegramId) {
    try {
      // Спочатку перевіряємо кеш
      if (this.memoryCache.has(telegramId)) {
        return this.memoryCache.get(telegramId);
      }

      // Якщо немає в кеші, завантажуємо з БД
      const userData = await this.databaseService.getUserByTelegramId(telegramId);
      
      if (userData) {
        const state = UserState.fromJSON(userData);
        this.memoryCache.set(telegramId, state);
        return state;
      }

      // Якщо користувача немає, створюємо новий стан
      const newState = new UserState(null, telegramId);
      this.memoryCache.set(telegramId, newState);
      return newState;
    } catch (error) {
      console.error('Помилка отримання стану користувача:', error);
      // Повертаємо базовий стан при помилці
      return new UserState(null, telegramId);
    }
  }

  /**
   * Оновити стан користувача
   */
  async updateState(telegramId, updates) {
    try {
      const currentState = await this.getState(telegramId);
      
      // Оновлюємо стан
      Object.assign(currentState, updates);
      currentState.lastActivity = new Date();

      // Зберігаємо в кеш
      this.memoryCache.set(telegramId, currentState);

      // Зберігаємо в БД
      await this.databaseService.saveUserState(currentState);

      return currentState;
    } catch (error) {
      console.error('Помилка оновлення стану користувача:', error);
      throw error;
    }
  }

  /**
   * Оновити крок користувача
   */
  async updateStep(telegramId, step) {
    return this.updateState(telegramId, { currentStep: step });
  }

  /**
   * Встановити професію
   */
  async setProfession(telegramId, profession) {
    return this.updateState(telegramId, { 
      selectedProfession: profession,
      currentStep: BotStep.CONTACT_REQUEST
    });
  }

  /**
   * Встановити контактні дані
   */
  async setContactData(telegramId, contactData) {
    return this.updateState(telegramId, { 
      contactData: contactData,
      currentStep: BotStep.TASK_DELIVERY
    });
  }

  /**
   * Позначити завдання як відправлене
   */
  async markTaskSent(telegramId) {
    return this.updateState(telegramId, { 
      taskSent: true,
      currentStep: BotStep.COMPLETED
    });
  }

  /**
   * Скинути стан користувача
   */
  async resetState(telegramId) {
    try {
      const newState = new UserState(null, telegramId);
      this.memoryCache.set(telegramId, newState);
      await this.databaseService.saveUserState(newState);
      return newState;
    } catch (error) {
      console.error('Помилка скидання стану користувача:', error);
      throw error;
    }
  }

  /**
   * Очистити кеш (для оптимізації пам'яті)
   */
  clearCache() {
    this.memoryCache.clear();
  }

  /**
   * Очистити застарілі стани (старші за 24 години)
   */
  async cleanupOldStates() {
    try {
      const cutoffTime = new Date(Date.now() - 24 * 60 * 60 * 1000);
      
      // Очищаємо кеш
      for (const [telegramId, state] of this.memoryCache.entries()) {
        if (state.lastActivity < cutoffTime) {
          this.memoryCache.delete(telegramId);
        }
      }

      // Очищаємо БД (якщо потрібно)
      await this.databaseService.cleanupOldStates(cutoffTime);
    } catch (error) {
      console.error('Помилка очищення застарілих станів:', error);
    }
  }
}

module.exports = UserStateService;
