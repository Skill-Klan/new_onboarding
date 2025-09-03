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
      console.log('🔍 BaseHandler: Початок handle, userState =', userState);
      // Логування вхідного запиту
      this.logRequest(ctx, userState);
      
      // Валідація стану
      if (!this.validateState(userState)) {
        console.log('🔍 BaseHandler: Невалідний стан, викликаємо handleInvalidState');
        await this.handleInvalidState(ctx, userState);
        return;
      }

      // Виконання логіки обробника
      console.log('🔍 BaseHandler: Викликаємо execute');
      await this.execute(ctx, userState);
      console.log('🔍 BaseHandler: execute завершено, викликаємо updateUserState');
      
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
    console.log('🔍🔍🔍 BaseHandler.handleInvalidState: ПОЧАТОК');
    console.log('🔍🔍🔍 BaseHandler.handleInvalidState: ctx =', ctx);
    console.log('🔍🔍🔍 BaseHandler.handleInvalidState: userState =', userState);
    
    const MessageTemplates = require('../templates/messages');
    console.log('🔍🔍🔍 BaseHandler.handleInvalidState: MessageTemplates =', typeof MessageTemplates);
    console.log('🔍🔍🔍 BaseHandler.handleInvalidState: getErrorMessage =', typeof MessageTemplates?.getErrorMessage);
    
    await ctx.reply(MessageTemplates.getErrorMessage());
    console.log('🔍🔍🔍 BaseHandler.handleInvalidState: Повідомлення відправлено');
    
    // Скидаємо стан користувача
    await this.userStateService.resetState(userState.telegramId);
  }

  /**
   * Оновлення стану користувача
   */
  async updateUserState(ctx, userState) {
    console.log('🔍🔍🔍 BaseHandler.updateUserState: ПОЧАТОК');
    console.log('🔍🔍🔍 BaseHandler.updateUserState: userState =', userState);
    
    const nextStep = this.getNextStep();
    console.log('🔍🔍🔍 BaseHandler.updateUserState: nextStep =', nextStep);
    console.log('🔍🔍🔍 BaseHandler.updateUserState: userState.currentStep =', userState.currentStep);
    
    if (nextStep && nextStep !== userState.currentStep) {
      console.log('🔍🔍🔍 BaseHandler.updateUserState: оновлюємо крок...');
      await this.userStateService.updateStep(userState.telegramId, nextStep);
    } else {
      console.log('🔍🔍🔍 BaseHandler.updateUserState: крок не потрібно оновлювати');
    }
    
    // Кеш видалено - кожен запит йде безпосередньо в БД
    console.log('🔍🔍🔍 BaseHandler.updateUserState: кеш видалено, дані завжди свіжі з БД');
  }

  /**
   * Обробка помилок
   */
  async handleError(ctx, error) {
    console.log('🔍🔍🔍 BaseHandler.handleError: ПОЧАТОК');
    console.log('🔍🔍🔍 BaseHandler.handleError: error =', error);
    console.log('🔍🔍🔍 BaseHandler.handleError: ctx =', ctx);
    
    const MessageTemplates = require('../templates/messages');
    console.log('🔍🔍🔍 BaseHandler.handleError: MessageTemplates =', typeof MessageTemplates);
    console.log('🔍🔍🔍 BaseHandler.handleError: getErrorMessage =', typeof MessageTemplates?.getErrorMessage);
    
    await ctx.reply(MessageTemplates.getErrorMessage());
    console.log('🔍🔍🔍 BaseHandler.handleError: Повідомлення відправлено');
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
