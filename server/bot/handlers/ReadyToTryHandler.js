// Обробник кнопки "Я готовий спробувати"

const BaseHandler = require('./BaseHandler');
const { BotStep } = require('../types');

class ReadyToTryHandler extends BaseHandler {
  constructor(userStateService, contactService, taskService, webhookService) {
    super(userStateService, contactService, taskService, webhookService);
  }
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

    // Перевіряємо, чи вже є контакт у користувача
    console.log('🔍🔍🔍 ReadyToTryHandler.execute: перевіряємо наявність контакту...');
    const hasContact = await this.contactService.hasContact(userState.telegramId);
    console.log('🔍🔍🔍 ReadyToTryHandler.execute: hasContact =', hasContact);

    if (hasContact) {
      // Якщо контакт вже є, одразу надсилаємо завдання
      console.log('🔍🔍🔍 ReadyToTryHandler.execute: контакт вже є, надсилаємо завдання');
      await this.safeReply(ctx, 'Надсилаю для тебе тестове завдання.');
      
      // Оновлюємо крок на TASK_DELIVERY
      await this.userStateService.updateStep(userState.telegramId, BotStep.TASK_DELIVERY);
      
      // Відправляємо завдання
      const TaskHandler = require('./TaskHandler');
      const taskHandler = new TaskHandler(this.userStateService, this.contactService, this.taskService, this.webhookService);
      await taskHandler.execute(ctx, userState);
    } else {
      // Якщо контакту немає, запитуємо його
      console.log('🔍🔍🔍 ReadyToTryHandler.execute: контакту немає, запитуємо');
      
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
    }
    
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
    // Дозволяємо виконання якщо професія вибрана і крок PROFESSION_SELECTION
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
