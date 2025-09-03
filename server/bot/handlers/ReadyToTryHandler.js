// Обробник кнопки "Я готовий спробувати"

const BaseHandler = require('./BaseHandler');
const { BotStep } = require('../types');

class ReadyToTryHandler extends BaseHandler {
  async execute(ctx, userState) {
    console.log('🔍🔍🔍 ReadyToTryHandler.execute: ПОЧАТОК');
    console.log('🔍🔍🔍 ReadyToTryHandler.execute: userState =', userState);
    
    const MessageTemplates = require('../templates/messages');
    const KeyboardTemplates = require('../templates/keyboards');
    
    // Перевіряємо, чи вибрана професія
    if (!userState.selectedProfession) {
      console.log('🔍🔍🔍 ReadyToTryHandler.execute: професія не вибрана');
      await this.safeReply(ctx, MessageTemplates.getErrorMessage());
      return;
    }

    // Оновлюємо крок користувача
    console.log('🔍🔍🔍 ReadyToTryHandler.execute: оновлюємо крок на CONTACT_REQUEST');
    await this.userStateService.updateStep(userState.telegramId, BotStep.CONTACT_REQUEST);

    // Відправляємо запит контакту
    console.log('🔍🔍🔍 ReadyToTryHandler.execute: відправляємо запит контакту');
    await this.safeReply(
      ctx, 
      MessageTemplates.getContactRequestMessage(),
      KeyboardTemplates.getContactKeyboard()
    );
    
    // Підтверджуємо callback
    await ctx.answerCbQuery();
    console.log('🔍🔍🔍 ReadyToTryHandler.execute: ЗАВЕРШЕНО');
  }

  getNextStep() {
    return BotStep.CONTACT_REQUEST;
  }

  /**
   * Валідація стану для цього обробника
   */
  validateState(userState) {
    console.log('🔍🔍🔍 ReadyToTryHandler.validateState: ПОЧАТОК');
    console.log('🔍🔍🔍 ReadyToTryHandler.validateState: userState =', userState);
    console.log('🔍🔍🔍 ReadyToTryHandler.validateState: userState.currentStep =', userState?.currentStep);
    console.log('🔍🔍🔍 ReadyToTryHandler.validateState: userState.selectedProfession =', userState?.selectedProfession);
    
    const superValid = super.validateState(userState);
    const stepValid = userState.currentStep === BotStep.PROFESSION_SELECTION;
    const professionValid = !!userState.selectedProfession;
    
    console.log('🔍🔍🔍 ReadyToTryHandler.validateState: superValid =', superValid);
    console.log('🔍🔍🔍 ReadyToTryHandler.validateState: stepValid =', stepValid);
    console.log('🔍🔍🔍 ReadyToTryHandler.validateState: professionValid =', professionValid);
    console.log('🔍🔍🔍 ReadyToTryHandler.validateState: загальний результат =', superValid && stepValid && professionValid);
    
    return superValid && stepValid && professionValid;
  }
}

module.exports = ReadyToTryHandler;
