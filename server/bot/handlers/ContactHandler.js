// Обробник контактних даних

const BaseHandler = require('./BaseHandler');
const { BotStep } = require('../types');

class ContactHandler extends BaseHandler {
  async execute(ctx, userState) {
    const { MessageTemplates } = require('../templates/messages');
    const { KeyboardTemplates } = require('../templates/keyboards');
    
    // Перевіряємо, чи є контакт в повідомленні
    if (!ctx.message || !ctx.message.contact) {
      // Якщо немає контакту, відправляємо повторний запит
      await this.safeReply(
        ctx, 
        MessageTemplates.getContactRequestRepeatMessage(),
        KeyboardTemplates.getContactKeyboard()
      );
      return;
    }

    try {
      // Зберігаємо контакт
      const contactData = await this.contactService.saveContact(
        userState.telegramId, 
        ctx.message.contact
      );

      // Оновлюємо стан користувача
      await this.userStateService.setContactData(userState.telegramId, contactData);

      // Відправляємо підтвердження
      await this.safeReply(
        ctx, 
        MessageTemplates.getContactConfirmationMessage(),
        KeyboardTemplates.removeKeyboard()
      );

      // Логуємо успішне збереження контакту
      console.log(`Контакт збережено для користувача ${userState.telegramId}: ${this.contactService.maskPhoneNumber(contactData.phoneNumber)}`);

    } catch (error) {
      console.error('Помилка збереження контакту:', error);
      await this.safeReply(ctx, MessageTemplates.getErrorMessage());
    }
  }

  getNextStep() {
    return BotStep.TASK_DELIVERY;
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

module.exports = ContactHandler;
