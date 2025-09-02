// Обробник кнопки "Я готовий спробувати"

const BaseHandler = require('./BaseHandler');
const { BotStep } = require('../types');

class ReadyToTryHandler extends BaseHandler {
  async execute(ctx, userState) {
    const { MessageTemplates } = require('../templates/messages');
    const { KeyboardTemplates } = require('../templates/keyboards');
    
    // Перевіряємо, чи вибрана професія
    if (!userState.selectedProfession) {
      await this.safeReply(ctx, MessageTemplates.getErrorMessage());
      return;
    }

    // Відправляємо запит контакту
    await this.safeReply(
      ctx, 
      MessageTemplates.getContactRequestMessage(),
      KeyboardTemplates.getContactKeyboard()
    );
    
    // Підтверджуємо callback
    await ctx.answerCbQuery();
  }

  getNextStep() {
    return BotStep.CONTACT_REQUEST;
  }

  /**
   * Валідація стану для цього обробника
   */
  validateState(userState) {
    return super.validateState(userState) && 
           userState.currentStep === BotStep.CONTACT_REQUEST &&
           userState.selectedProfession;
  }
}

module.exports = ReadyToTryHandler;
