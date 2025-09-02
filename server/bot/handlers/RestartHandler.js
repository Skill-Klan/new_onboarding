// Обробник перезапуску бота

const BaseHandler = require('./BaseHandler');
const { BotStep } = require('../types');

class RestartHandler extends BaseHandler {
  async execute(ctx, userState) {
    const { MessageTemplates } = require('../templates/messages');
    const { KeyboardTemplates } = require('../templates/keyboards');
    
    // Скидаємо стан користувача
    await this.userStateService.resetState(userState.telegramId);
    
    // Відправляємо вітальне повідомлення
    await this.safeReply(
      ctx, 
      MessageTemplates.getWelcomeMessage(),
      KeyboardTemplates.getProfessionKeyboard()
    );
    
    // Підтверджуємо callback
    await ctx.answerCbQuery();

    // Логуємо перезапуск
    console.log(`Користувач ${userState.telegramId} перезапустив бота`);
  }

  getNextStep() {
    return BotStep.PROFESSION_SELECTION;
  }

  /**
   * Валідація стану для цього обробника
   */
  validateState(userState) {
    // Перезапуск доступний на будь-якому етапі
    return super.validateState(userState);
  }
}

module.exports = RestartHandler;
