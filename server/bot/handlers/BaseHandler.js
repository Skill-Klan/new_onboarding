// Базовий клас для обробників команд бота

const { BotStep } = require('../types');

class BaseHandler {
  constructor(userStateService, contactService, taskService) {
    this.userStateService = userStateService;
    this.contactService = contactService;
    this.taskService = taskService;
  }

  /**
   * Основний метод обробки
   */
  async handle(ctx, userState) {
    try {
      // Логування вхідного запиту
      this.logRequest(ctx, userState);
      
      // Валідація стану
      if (!this.validateState(userState)) {
        await this.handleInvalidState(ctx, userState);
        return;
      }

      // Виконання логіки обробника
      await this.execute(ctx, userState);
      
      // Оновлення стану
      await this.updateUserState(ctx, userState);
      
    } catch (error) {
      console.error(`Помилка в обробнику ${this.constructor.name}:`, error);
      await this.handleError(ctx, error);
    }
  }

  /**
   * Виконання логіки обробника (має бути реалізовано в підкласах)
   */
  async execute(ctx, userState) {
    throw new Error('Метод execute має бути реалізований в підкласі');
  }

  /**
   * Отримання наступного кроку (має бути реалізовано в підкласах)
   */
  getNextStep() {
    throw new Error('Метод getNextStep має бути реалізований в підкласі');
  }

  /**
   * Валідація стану користувача
   */
  validateState(userState) {
    return userState && userState.telegramId;
  }

  /**
   * Обробка невалідного стану
   */
  async handleInvalidState(ctx, userState) {
    const { MessageTemplates } = require('../templates/messages');
    await ctx.reply(MessageTemplates.getErrorMessage());
    
    // Скидаємо стан користувача
    await this.userStateService.resetState(userState.telegramId);
  }

  /**
   * Оновлення стану користувача
   */
  async updateUserState(ctx, userState) {
    const nextStep = this.getNextStep();
    if (nextStep && nextStep !== userState.currentStep) {
      await this.userStateService.updateStep(userState.telegramId, nextStep);
    }
  }

  /**
   * Обробка помилок
   */
  async handleError(ctx, error) {
    const { MessageTemplates } = require('../templates/messages');
    await ctx.reply(MessageTemplates.getErrorMessage());
  }

  /**
   * Логування запиту
   */
  logRequest(ctx, userState) {
    const logData = {
      handler: this.constructor.name,
      userId: userState.telegramId,
      username: userState.username,
      currentStep: userState.currentStep,
      messageType: ctx.message ? ctx.message.text : 'callback',
      timestamp: new Date().toISOString()
    };
    
    console.log('Bot Request:', JSON.stringify(logData, null, 2));
  }

  /**
   * Відправка повідомлення з обробкою помилок
   */
  async safeReply(ctx, message, keyboard = null) {
    try {
      console.log('📤 safeReply: Початок відправки повідомлення');
      console.log('📤 safeReply: message:', message);
      console.log('📤 safeReply: keyboard:', keyboard);
      
      if (keyboard) {
        console.log('📤 safeReply: Відправляємо з клавіатурою');
        await ctx.reply(message, keyboard);
        console.log('✅ safeReply: Повідомлення з клавіатурою відправлено');
      } else {
        console.log('📤 safeReply: Відправляємо без клавіатури');
        await ctx.reply(message);
        console.log('✅ safeReply: Повідомлення без клавіатури відправлено');
      }
    } catch (error) {
      console.error('❌ safeReply: Помилка відправки повідомлення:', error);
      console.error('❌ safeReply: Stack trace:', error.stack);
      
      // Спробуємо відправити без клавіатури
      try {
        console.log('🔄 safeReply: Спробуємо відправити без клавіатури');
        await ctx.reply(message);
        console.log('✅ safeReply: Повідомлення без клавіатури відправлено після помилки');
      } catch (retryError) {
        console.error('❌ safeReply: Критична помилка відправки повідомлення:', retryError);
        console.error('❌ safeReply: Retry stack trace:', retryError.stack);
      }
    }
  }

  /**
   * Отримання інформації про користувача
   */
  getUserInfo(ctx) {
    const user = ctx.from;
    return {
      id: user.id,
      username: user.username,
      firstName: user.first_name,
      lastName: user.last_name
    };
  }
}

module.exports = BaseHandler;
