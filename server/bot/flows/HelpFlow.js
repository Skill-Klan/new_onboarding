/**
 * HelpFlow - Flow для обробки команд допомоги
 */

const BaseFlow = require('./BaseFlow');
const BotConfig = require('../config/BotConfig');

class HelpFlow extends BaseFlow {
  constructor(databaseService, webhookService) {
    super(databaseService, webhookService);
    this.log('Ініціалізація HelpFlow');
  }

  async canHandle(ctx) {
    const message = ctx.message?.text;
    return message === '/help';
  }

  async canHandleCallback(ctx) {
    return false;
  }

  async handle(ctx) {
    this.log('Обробка команди /help');
    
    const message = BotConfig.getHelpMessage();
    const keyboard = BotConfig.getMainKeyboard();
    
    await this.safeReply(ctx, message, keyboard);
  }

  async handleCallback(ctx) {
    // HelpFlow не обробляє callbacks
  }
}

module.exports = HelpFlow;
