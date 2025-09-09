// Обробник вибору професії

const BaseHandler = require('./BaseHandler');
const { BotStep, Profession } = require('../types');
const MessageTemplates = require('../templates/messages');
const KeyboardTemplates = require('../templates/keyboards');

class ProfessionHandler extends BaseHandler {
  constructor(userStateService, contactService, taskService, webhookService) {
    super(userStateService, contactService, taskService, webhookService);
  }
  async execute(ctx, userState) {
    console.log('🔍🔍🔍 ProfessionHandler.execute: ПОЧАТОК');
    console.log('🔍🔍🔍 ProfessionHandler.execute: ctx.callbackQuery.data =', ctx.callbackQuery?.data);
    console.log('🔍🔍🔍 ProfessionHandler.execute: userState =', userState);
    
    // Отримуємо вибрану професію з callback_data
    const profession = this.extractProfession(ctx.callbackQuery.data);
    console.log('🔍🔍🔍 ProfessionHandler.execute: profession =', profession);
    
    if (!profession) {
      await this.safeReply(ctx, MessageTemplates.getErrorMessage());
      return;
    }

    // Оновлюємо стан користувача
    console.log('🔍🔍🔍 ProfessionHandler.execute: оновлюємо стан користувача...');
    try {
      await this.userStateService.setProfession(userState.telegramId, profession);
      console.log('🔍🔍🔍 ProfessionHandler.execute: стан користувача оновлено успішно');
    } catch (error) {
      console.error('🔍🔍🔍 ProfessionHandler.execute: ПОМИЛКА при оновленні стану =', error);
      throw error;
    }
    
    // Відправляємо опис професії
    const description = this.getProfessionDescription(profession);
    console.log('🔍🔍🔍 ProfessionHandler.execute: description =', description);
    console.log('🔍🔍🔍 ProfessionHandler.execute: KeyboardTemplates =', typeof KeyboardTemplates);
    console.log('🔍🔍🔍 ProfessionHandler.execute: getReadyToTryKeyboard =', typeof KeyboardTemplates?.getReadyToTryKeyboard);
    
    try {
      await this.safeReply(
        ctx, 
        description,
        KeyboardTemplates.getReadyToTryKeyboard()
      );
      console.log('🔍🔍🔍 ProfessionHandler.execute: повідомлення відправлено успішно');
    } catch (error) {
      console.error('🔍🔍🔍 ProfessionHandler.execute: ПОМИЛКА відправки повідомлення =', error);
      throw error;
    }
    
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
    console.log('🔍🔍🔍 ProfessionHandler.getProfessionDescription: ПОЧАТОК');
    console.log('🔍🔍🔍 ProfessionHandler.getProfessionDescription: profession =', profession);
    console.log('🔍🔍🔍 ProfessionHandler.getProfessionDescription: MessageTemplates =', typeof MessageTemplates);
    console.log('🔍🔍🔍 ProfessionHandler.getProfessionDescription: getQADescription =', typeof MessageTemplates?.getQADescription);
    console.log('🔍🔍🔍 ProfessionHandler.getProfessionDescription: getBADescription =', typeof MessageTemplates?.getBADescription);
    
    switch (profession) {
      case Profession.QA:
        console.log('🔍🔍🔍 ProfessionHandler.getProfessionDescription: Вибрано QA');
        return MessageTemplates.getQADescription();
      case Profession.BA:
        console.log('🔍🔍🔍 ProfessionHandler.getProfessionDescription: Вибрано BA');
        return MessageTemplates.getBADescription();
      default:
        return MessageTemplates.getErrorMessage();
    }
  }

  getNextStep() {
    // Після вибору професії користувач готовий спробувати
    return BotStep.PROFESSION_SELECTION;
  }

  /**
   * Валідація стану для цього обробника
   * Дозволяємо зміну професії на будь-якому кроці
   */
  validateState(userState) {
    console.log('🔍🔍🔍 ProfessionHandler.validateState: ПОЧАТОК');
    console.log('🔍🔍🔍 ProfessionHandler.validateState: userState =', userState);
    console.log('🔍🔍🔍 ProfessionHandler.validateState: userState.currentStep =', userState?.currentStep);
    
    const superValid = super.validateState(userState);
    // Дозволяємо зміну професії на будь-якому кроці, крім завершеного
    const stepValid = userState.currentStep !== BotStep.COMPLETED;
    
    console.log('🔍🔍🔍 ProfessionHandler.validateState: superValid =', superValid);
    console.log('🔍🔍🔍 ProfessionHandler.validateState: stepValid =', stepValid);
    console.log('🔍🔍🔍 ProfessionHandler.validateState: загальний результат =', superValid && stepValid);
    
    return superValid && stepValid;
  }
}

module.exports = ProfessionHandler;
