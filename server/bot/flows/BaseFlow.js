/**
 * BaseFlow - Базовий клас для всіх flows
 * 
 * Реалізує Chain of Responsibility pattern.
 * Кожен flow вирішує чи може він обробити повідомлення.
 */

class BaseFlow {
  constructor(databaseService, webhookService) {
    this.databaseService = databaseService;
    this.webhookService = webhookService;
    this.name = this.constructor.name;
  }

  /**
   * Перевіряє чи може flow обробити повідомлення
   * Має бути реалізовано в підкласах
   */
  async canHandle(ctx) {
    throw new Error('canHandle method must be implemented');
  }

  /**
   * Перевіряє чи може flow обробити callback query
   * Має бути реалізовано в підкласах
   */
  async canHandleCallback(ctx) {
    return false;
  }

  /**
   * Обробляє повідомлення
   * Має бути реалізовано в підкласах
   */
  async handle(ctx) {
    throw new Error('handle method must be implemented');
  }

  /**
   * Обробляє callback query
   * Має бути реалізовано в підкласах
   */
  async handleCallback(ctx) {
    throw new Error('handleCallback method must be implemented');
  }

  /**
   * Безпечна відправка повідомлення
   */
  async safeReply(ctx, message, keyboard = null) {
    try {
      if (keyboard) {
        await ctx.reply(message, keyboard);
      } else {
        await ctx.reply(message);
      }
    } catch (error) {
      console.error(`❌ ${this.name}: Помилка відправки повідомлення:`, error);
      throw error;
    }
  }

  /**
   * Безпечна відправка callback відповіді
   */
  async safeAnswerCbQuery(ctx, text = null) {
    try {
      await ctx.answerCbQuery(text);
    } catch (error) {
      console.error(`❌ ${this.name}: Помилка відповіді на callback:`, error);
    }
  }

  /**
   * Логування дій flow
   */
  log(action, details = '') {
    console.log(`🔄 ${this.name}: ${action} ${details}`);
  }

  /**
   * Отримання інформації про flow
   */
  getInfo() {
    return {
      name: this.name,
      canHandle: typeof this.canHandle === 'function',
      canHandleCallback: typeof this.canHandleCallback === 'function'
    };
  }
}

module.exports = BaseFlow;
