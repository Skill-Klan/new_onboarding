// Обробник невідомих команд та повідомлень

const BaseHandler = require('./BaseHandler');
const { BotStep } = require('../types');

class UnknownHandler extends BaseHandler {
  async execute(ctx, userState) {
    const MessageTemplates = require('../templates/messages');
    const KeyboardTemplates = require('../templates/keyboards');
    
    // Визначаємо тип повідомлення
    const messageType = this.getMessageType(ctx);
    
    // Обробляємо різні типи повідомлень
    switch (messageType) {
      case 'text':
        await this.handleTextMessage(ctx, userState);
        break;
      case 'callback':
        await this.handleCallbackQuery(ctx, userState);
        break;
      default:
        await this.safeReply(ctx, MessageTemplates.getUnknownCommandMessage());
    }
  }

  /**
   * Визначення типу повідомлення
   */
  getMessageType(ctx) {
    if (ctx.message && ctx.message.text) {
      return 'text';
    } else if (ctx.callbackQuery) {
      return 'callback';
    }
    return 'unknown';
  }

  /**
   * Обробка текстового повідомлення
   */
  async handleTextMessage(ctx, userState) {
    const MessageTemplates = require('../templates/messages');
    const KeyboardTemplates = require('../templates/keyboards');
    
    const messageText = ctx.message.text.toLowerCase();
    
    // Перевіряємо на ключові слова
    if (messageText.includes('привіт') || messageText.includes('hello')) {
      await this.safeReply(
        ctx, 
        'Привіт! 👋 Напишіть /start для початку роботи з ботом.',
        KeyboardTemplates.getMainMenuKeyboard()
      );
    } else if (messageText.includes('допомога') || messageText.includes('help')) {
      await this.safeReply(
        ctx, 
        'Для початку роботи напишіть /start\nДля перегляду FAQ натисніть кнопку нижче.',
        KeyboardTemplates.getMainMenuKeyboard()
      );
    } else {
      // Загальна відповідь для невідомих повідомлень
      await this.safeReply(
        ctx, 
        MessageTemplates.getUnknownCommandMessage(),
        KeyboardTemplates.getMainMenuKeyboard()
      );
    }
  }

  /**
   * Обробка callback запиту
   */
  async handleCallbackQuery(ctx, userState) {
    const MessageTemplates = require('../templates/messages');
    
    // Підтверджуємо callback
    await ctx.answerCbQuery('Команда не розпізнана');
    
    // Відправляємо повідомлення про невідому команду
    await this.safeReply(ctx, MessageTemplates.getUnknownCommandMessage());
  }

  getNextStep() {
    // Не змінюємо крок для невідомих команд
    return null;
  }

  /**
   * Валідація стану для цього обробника
   */
  validateState(userState) {
    // Невідомі команди можуть оброблятися на будь-якому етапі
    return super.validateState(userState);
  }
}

module.exports = UnknownHandler;
