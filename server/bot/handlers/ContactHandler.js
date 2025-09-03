// Обробник контактних даних

const BaseHandler = require('./BaseHandler');
const { BotStep } = require('../types');

class ContactHandler extends BaseHandler {
  constructor(userStateService, contactService, taskService, webhookService) {
    super(userStateService, contactService, taskService, webhookService);
  }
  async execute(ctx, userState) {
    console.log('🔍🔍🔍 ContactHandler.execute: ПОЧАТОК');
    console.log('🔍🔍🔍 ContactHandler.execute: userState =', userState);
    console.log('🔍🔍🔍 ContactHandler.execute: ctx.message =', ctx.message);
    
    const MessageTemplates = require('../templates/messages');
    const KeyboardTemplates = require('../templates/keyboards');
    
    // Перевіряємо, чи є контакт в повідомленні
    if (!ctx.message || !ctx.message.contact) {
      console.log('🔍🔍🔍 ContactHandler.execute: немає контакту в повідомленні');
      // Якщо немає контакту, відправляємо повторний запит
      await this.safeReply(
        ctx, 
        MessageTemplates.getContactRequestRepeatMessage(),
        KeyboardTemplates.getContactKeyboard()
      );
      return;
    }

    console.log('🔍🔍🔍 ContactHandler.execute: контакт знайдено =', ctx.message.contact);

    try {
      // Зберігаємо контакт
      console.log('🔍🔍🔍 ContactHandler.execute: зберігаємо контакт...');
      const contactData = await this.contactService.saveContact(
        userState.telegramId, 
        ctx.message.contact
      );
      console.log('🔍🔍🔍 ContactHandler.execute: контакт збережено =', contactData);

      // Оновлюємо стан користувача
      console.log('🔍🔍🔍 ContactHandler.execute: оновлюємо стан користувача...');
      await this.userStateService.setContactData(userState.telegramId, contactData);
      console.log('🔍🔍🔍 ContactHandler.execute: стан користувача оновлено');
      
      // Відправляємо webhook про надання контакту
      try {
        const webhookData = {
          telegramId: userState.telegramId,
          username: userState.username,
          firstName: contactData.firstName,
          lastName: contactData.lastName
        };
        await this.webhookService.notifyContactProvided(webhookData, contactData);
        console.log('✅ ContactHandler: Webhook про надання контакту відправлено');
      } catch (webhookError) {
        console.error('❌ ContactHandler: Помилка відправки webhook:', webhookError);
        // Не зупиняємо виконання через помилку webhook
      }

      // Відправляємо підтвердження та одразу завдання
      console.log('🔍🔍🔍 ContactHandler.execute: відправляємо підтвердження та завдання...');
      await this.safeReply(
        ctx, 
        'Надсилаю для тебе тестове завдання.',
        KeyboardTemplates.removeKeyboard()
      );
      console.log('🔍🔍🔍 ContactHandler.execute: підтвердження та завдання відправлено');

      // Відправляємо завдання
      const TaskHandler = require('./TaskHandler');
      const taskHandler = new TaskHandler(this.userStateService, this.contactService, this.taskService);
      await taskHandler.execute(ctx, userState);

      // Логуємо успішне збереження контакту
      console.log(`Контакт збережено для користувача ${userState.telegramId}: ${this.contactService.maskPhoneNumber(contactData.phoneNumber)}`);

    } catch (error) {
      console.error('🔍🔍🔍 ContactHandler.execute: ПОМИЛКА =', error);
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
