/**
 * ContactFlow - Flow для обробки контактів
 */

const BaseFlow = require('./BaseFlow');
const BotConfig = require('../config/BotConfig');

class ContactFlow extends BaseFlow {
  constructor(databaseService, webhookService) {
    super(databaseService, webhookService);
    this.log('Ініціалізація ContactFlow');
  }

  async canHandle(ctx) {
    return ctx.message?.contact !== undefined;
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
        await this.safeReply(ctx, BotConfig.getErrorMessage());
        return;
      }
      
      // Зберігаємо контакт в БД
      await this.databaseService.saveContact(userState.telegram_id, {
        phone_number: contact.phone_number,
        first_name: contact.first_name,
        last_name: contact.last_name
      });
      
      // Оновлюємо крок користувача
      await this.databaseService.updateUser(userState.telegram_id, {
        current_step: 'task_delivery',
        last_activity: new Date()
      });
      
      const message = BotConfig.getContactSavedMessage();
      await this.safeReply(ctx, message);
      
      this.log('Контакт збережено успішно');
      
    } catch (error) {
      console.error('❌ ContactFlow: Помилка збереження контакту:', error);
      await this.safeReply(ctx, BotConfig.getErrorMessage());
    }
  }

  async handleCallback(ctx) {
    // ContactFlow не обробляє callbacks
  }
}

module.exports = ContactFlow;
