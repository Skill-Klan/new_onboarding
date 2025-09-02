// Обробник вибору професії

const BaseHandler = require('./BaseHandler');
const { BotStep, Profession } = require('../types');

class ProfessionHandler extends BaseHandler {
  async execute(ctx, userState) {
    const { MessageTemplates } = require('../templates/messages');
    const { KeyboardTemplates } = require('../templates/keyboards');
    
    // Отримуємо вибрану професію з callback_data
    const profession = this.extractProfession(ctx.callbackQuery.data);
    
    if (!profession) {
      await this.safeReply(ctx, MessageTemplates.getErrorMessage());
      return;
    }

    // Оновлюємо стан користувача
    await this.userStateService.setProfession(userState.telegramId, profession);
    
    // Відправляємо опис професії
    const description = this.getProfessionDescription(profession);
    await this.safeReply(
      ctx, 
      description,
      KeyboardTemplates.getReadyToTryKeyboard()
    );
    
    // Підтверджуємо callback
    await ctx.answerCbQuery();
  }

  /**
   * Витягування професії з callback_data
   */
  extractProfession(callbackData) {
    if (callbackData === 'profession_QA') {
      return Profession.QA;
    } else if (callbackData === 'profession_BA') {
      return Profession.BA;
    }
    return null;
  }

  /**
   * Отримання опису професії
   */
  getProfessionDescription(profession) {
    const { MessageTemplates } = require('../templates/messages');
    
    switch (profession) {
      case Profession.QA:
        return MessageTemplates.getQADescription();
      case Profession.BA:
        return MessageTemplates.getBADescription();
      default:
        return MessageTemplates.getErrorMessage();
    }
  }

  getNextStep() {
    return BotStep.CONTACT_REQUEST;
  }

  /**
   * Валідація стану для цього обробника
   */
  validateState(userState) {
    return super.validateState(userState) && 
           userState.currentStep === BotStep.PROFESSION_SELECTION;
  }
}

module.exports = ProfessionHandler;
