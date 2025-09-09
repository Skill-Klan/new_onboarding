/**
 * LoggingMiddleware - Middleware для логування
 * 
 * Логує всі вхідні повідомлення та callback queries.
 * Завжди дозволяє продовження обробки.
 */

const BaseMiddleware = require('./BaseMiddleware');

class LoggingMiddleware extends BaseMiddleware {
  constructor() {
    super();
    this.log('Ініціалізація LoggingMiddleware');
  }

  /**
   * Обробка middleware
   */
  async process(ctx) {
    this.log('Обробка запиту');
    
    try {
      // Логування повідомлення
      if (ctx.message) {
        this.logMessage(ctx.message);
      }
      
      // Логування callback query
      if (ctx.callbackQuery) {
        this.logCallbackQuery(ctx.callbackQuery);
      }
      
      // Завжди дозволяємо продовження
      return { continue: true };
      
    } catch (error) {
      console.error('❌ LoggingMiddleware: Помилка логування:', error);
      // Навіть при помилці логування дозволяємо продовження
      return { continue: true };
    }
  }

  /**
   * Логування повідомлення
   */
  logMessage(message) {
    const user = message.from;
    const text = message.text || '[не текст]';
    
    console.log(`📨 Повідомлення від ${user.first_name} (@${user.username || 'без username'}): ${text}`);
  }

  /**
   * Логування callback query
   */
  logCallbackQuery(callbackQuery) {
    const user = callbackQuery.from;
    const data = callbackQuery.data;
    
    console.log(`🔘 Callback від ${user.first_name} (@${user.username || 'без username'}): ${data}`);
  }
}

module.exports = LoggingMiddleware;
