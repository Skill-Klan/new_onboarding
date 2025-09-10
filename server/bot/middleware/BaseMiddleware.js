/**
 * BaseMiddleware - Базовий клас для всіх middleware
 * 
 * Middleware виконують перевірки та підготовку перед обробкою flows.
 * Вони можуть зупинити обробку або передати управління далі.
 */

class BaseMiddleware {
  constructor() {
    this.name = this.constructor.name;
  }

  /**
   * Обробка middleware
   * Повертає { continue: boolean, data?: any }
   */
  async process(ctx) {
    throw new Error('process method must be implemented');
  }

  /**
   * Логування дій middleware
   */
  log(action, details = '') {
    console.log(`🔄 ${this.name}: ${action} ${details}`);
  }

  /**
   * Отримання інформації про middleware
   */
  getInfo() {
    return {
      name: this.name,
      type: 'middleware'
    };
  }
}

module.exports = BaseMiddleware;
