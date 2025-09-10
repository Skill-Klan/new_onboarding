/**
 * ContactFlow - Flow для обробки контактів
 */

const BaseFlow = require('./BaseFlow');
const { BotStep } = require('../types');
const MessageTemplates = require('../templates/messages');
const KeyboardTemplates = require('../templates/keyboards');

class ContactFlow extends BaseFlow {
  constructor(services) {
    super(services);
    this.userStateService = services.userStateService;
    this.contactService = services.contactService;
    this.taskService = services.taskService;
    this.webhookService = services.webhookService;
    this.log('Ініціалізація ContactFlow');
  }

  async canHandle(ctx) {
    const userState = ctx.userState;
    if (!userState) return false;
    
    // Обробляємо тільки контакти на кроці CONTACT_REQUEST
    return ctx.message && ctx.message.contact && userState.currentStep === BotStep.CONTACT_REQUEST;
  }

  async canHandleCallback(ctx) {
    return false;
  }

  async handle(ctx) {
    this.log('Обробка контакту');
    
    try {
      const contact = ctx.message.contact;
      const userState = ctx.userState;
      
      if (!userState) {
        await this.safeReply(ctx, MessageTemplates.getErrorMessage());
        return;
      }

      // Перевіряємо, чи є контакт в повідомленні
      if (!ctx.message || !ctx.message.contact) {
        this.log('Немає контакту в повідомленні');
        // Якщо немає контакту, відправляємо повторний запит
        await this.safeReply(
          ctx, 
          MessageTemplates.getContactRequestRepeatMessage(),
          KeyboardTemplates.getContactKeyboard()
        );
        return;
      }

      this.log('Контакт знайдено:', ctx.message.contact);

      // Зберігаємо контакт
      this.log('Зберігаємо контакт...');
      const contactData = await this.contactService.saveContact(
        userState.telegramId, 
        ctx.message.contact
      );
      this.log('Контакт збережено:', contactData);

      // Оновлюємо стан користувача
      this.log('Оновлюємо стан користувача...');
      await this.userStateService.setContactData(userState.telegramId, contactData);
      this.log('Стан користувача оновлено');
      
      // Відправляємо webhook про надання контакту
      try {
        const webhookData = {
          telegramId: userState.telegramId,
          username: userState.username,
          firstName: contactData.firstName,
          lastName: contactData.lastName
        };
        await this.webhookService.notifyContactProvided(webhookData, contactData);
        this.log('Webhook про надання контакту відправлено');
      } catch (webhookError) {
        console.error('❌ ContactFlow: Помилка відправки webhook:', webhookError);
        // Не зупиняємо виконання через помилку webhook
      }

      // Відправляємо підтвердження та одразу завдання
      this.log('Відправляємо підтвердження та завдання...');
      await this.safeReply(
        ctx, 
        'Надсилаю для тебе тестове завдання.',
        KeyboardTemplates.removeKeyboard()
      );
      this.log('Підтвердження та завдання відправлено');

      // Відправляємо завдання
      const TaskHandler = require('../handlers/TaskHandler');
      const taskHandler = new TaskHandler(this.userStateService, this.contactService, this.taskService, this.webhookService);
      await taskHandler.execute(ctx, userState);

      // Логуємо успішне збереження контакту
      this.log(`Контакт збережено для користувача ${userState.telegramId}: ${this.contactService.maskPhoneNumber(contactData.phoneNumber)}`);
      
    } catch (error) {
      console.error('❌ ContactFlow: Помилка збереження контакту:', error);
      await this.safeReply(ctx, MessageTemplates.getErrorMessage());
    }
  }

  async handleCallback(ctx) {
    // ContactFlow не обробляє callbacks
  }
}

module.exports = ContactFlow;
