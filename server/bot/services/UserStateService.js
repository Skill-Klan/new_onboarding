// Сервіс для управління станом користувача

const { UserState, BotStep } = require('../types');

class UserStateService {
  constructor(databaseService) {
    this.databaseService = databaseService;
    // Видаляємо кешування - кожен запит йде безпосередньо в БД
  }

  /**
   * Отримати стан користувача
   */
  async getState(telegramId) {
    console.log('🔍🔍🔍 UserStateService.getState: ПОЧАТОК');
    console.log('🔍🔍🔍 UserStateService.getState: telegramId =', telegramId);
    
    try {
      // Завжди завантажуємо з БД (без кешування)
      console.log('🔍🔍🔍 UserStateService.getState: завантажуємо з БД...');
      const userData = await this.databaseService.getUserByTelegramId(telegramId);
      console.log('🔍🔍🔍 UserStateService.getState: userData з БД =', userData);
      
      if (userData) {
        const state = UserState.fromJSON(userData);
        console.log('🔍🔍🔍 UserStateService.getState: створений стан з БД =', state);
        return state;
      }

      // Якщо користувача немає, створюємо новий стан
      console.log('🔍🔍🔍 UserStateService.getState: створюємо новий стан...');
      const newState = new UserState(null, telegramId);
      console.log('🔍🔍🔍 UserStateService.getState: новий стан =', newState);
      return newState;
    } catch (error) {
      console.error('🔍🔍🔍 UserStateService.getState: ПОМИЛКА =', error);
      // Повертаємо базовий стан при помилці
      return new UserState(null, telegramId);
    }
  }

  /**
   * Оновити стан користувача
   */
  async updateState(telegramId, updates) {
    console.log('🔍🔍🔍 UserStateService.updateState: ПОЧАТОК');
    console.log('🔍🔍🔍 UserStateService.updateState: telegramId =', telegramId);
    console.log('🔍🔍🔍 UserStateService.updateState: updates =', updates);
    
    try {
      // Завжди завантажуємо свіжі дані з БД
      const currentState = await this.getState(telegramId);
      console.log('🔍🔍🔍 UserStateService.updateState: currentState =', currentState);
      
      // Оновлюємо стан
      Object.assign(currentState, updates);
      currentState.lastActivity = new Date();
      console.log('🔍🔍🔍 UserStateService.updateState: оновлений стан =', currentState);

      // Зберігаємо в БД
      console.log('🔍🔍🔍 UserStateService.updateState: зберігаємо в БД...');
      const savedState = await this.databaseService.saveUserState(currentState);
      console.log('🔍🔍🔍 UserStateService.updateState: збережено в БД, savedState =', savedState);

      // Повертаємо збережений стан
      if (savedState) {
        const updatedState = UserState.fromJSON(savedState);
        console.log('🔍🔍🔍 UserStateService.updateState: повертаємо savedState =', updatedState);
        return updatedState;
      }

      return currentState;
    } catch (error) {
      console.error('🔍🔍🔍 UserStateService.updateState: ПОМИЛКА =', error);
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
    console.log('🔍🔍🔍 UserStateService.setProfession: ПОЧАТОК');
    console.log('🔍🔍🔍 UserStateService.setProfession: telegramId =', telegramId);
    console.log('🔍🔍🔍 UserStateService.setProfession: profession =', profession);
    
    try {
      const result = await this.updateState(telegramId, { 
        selectedProfession: profession,
        currentStep: BotStep.PROFESSION_SELECTION
      });
      console.log('🔍🔍🔍 UserStateService.setProfession: результат =', result);
      return result;
    } catch (error) {
      console.error('🔍🔍🔍 UserStateService.setProfession: ПОМИЛКА =', error);
      throw error;
    }
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
    const now = new Date();
    const deadline = this.calculateDeadline(now);
    
    return this.updateState(telegramId, { 
      taskSent: true,
      taskSentAt: now,
      taskDeadline: deadline,
      currentStep: BotStep.COMPLETED
    });
  }

  /**
   * Розрахувати дедлайн (9 робочих днів)
   */
  calculateDeadline(sentDate) {
    let deadline = new Date(sentDate);
    let workingDays = 0;
    
    // Додаємо 9 робочих днів (без вихідних)
    while (workingDays < 9) {
      deadline.setDate(deadline.getDate() + 1);
      const dayOfWeek = deadline.getDay();
      // Пропускаємо суботу (6) та неділю (0)
      if (dayOfWeek !== 0 && dayOfWeek !== 6) {
        workingDays++;
      }
    }
    
    return deadline;
  }

  /**
   * Скинути стан користувача
   */
  async resetState(telegramId) {
    try {
      const newState = new UserState(null, telegramId);
      await this.databaseService.saveUserState(newState);
      return newState;
    } catch (error) {
      console.error('Помилка скидання стану користувача:', error);
      throw error;
    }
  }

  /**
   * Очистити застарілі стани (старші за 24 години)
   */
  async cleanupOldStates() {
    try {
      const cutoffTime = new Date(Date.now() - 24 * 60 * 60 * 1000);
      
      // Очищаємо БД (якщо потрібно)
      await this.databaseService.cleanupOldStates(cutoffTime);
    } catch (error) {
      console.error('Помилка очищення застарілих станів:', error);
    }
  }
}

module.exports = UserStateService;
