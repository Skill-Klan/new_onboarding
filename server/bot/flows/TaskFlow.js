/**
 * TaskFlow - Flow для обробки завдань
 */

const BaseFlow = require('./BaseFlow');
const BotConfig = require('../config/BotConfig');

class TaskFlow extends BaseFlow {
  constructor(databaseService, webhookService) {
    super(databaseService, webhookService);
    this.log('Ініціалізація TaskFlow');
  }

  async canHandle(ctx) {
    return false; // Поки що не обробляємо повідомлення
  }

  async canHandleCallback(ctx) {
    return false; // Поки що не обробляємо callbacks
  }

  async handle(ctx) {
    // Поки що заглушка
  }

  async handleCallback(ctx) {
    // Поки що заглушка
  }
}

module.exports = TaskFlow;
