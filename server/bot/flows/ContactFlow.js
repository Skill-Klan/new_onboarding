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
    
    const contact = ctx.message.contact;
    // Тут має бути логіка збереження контакту
    
    const message = BotConfig.getContactSavedMessage();
    await this.safeReply(ctx, message);
  }

  async handleCallback(ctx) {
    // ContactFlow не обробляє callbacks
  }
}

module.exports = ContactFlow;
