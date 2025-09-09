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
    // Обробляємо команди допомоги
    return ctx.message && ctx.message.text === '/help';
  }

  async canHandleCallback(ctx) {
    // Обробляємо callback для FAQ
    return ctx.callbackQuery?.data === 'show_faq';
  }

  async handle(ctx) {
    this.log('Обробка команди /help');
    
    try {
      const message = 'Доступні команди:\n/start - почати спочатку\n/help - показати цю довідку\n\nДля отримання детальної інформації натисніть кнопку "Маєш питання?"';
      await this.safeReply(ctx, message);
      
      this.log('Команда /help оброблена успішно');
      
    } catch (error) {
      console.error('❌ HelpFlow: Помилка обробки /help:', error);
      await this.safeReply(ctx, 'Вибачте, сталася помилка. Спробуйте ще раз.');
    }
  }

  async handleCallback(ctx) {
    this.log('Обробка callback FAQ');
    
    try {
      // URL до MiniApp FAQ на GitHub Pages
      const faqUrl = process.env.WEBAPP_URL || 'https://skill-klan.github.io/new_onboarding/';
      
      // Відкриваємо MiniApp FAQ
      await ctx.reply('📚 Відкриваю FAQ для вас...', {
        reply_markup: {
          inline_keyboard: [[
            {
              text: '📚 Відкрити FAQ',
              web_app: { url: faqUrl }
            }
          ]]
        }
      });
      
      this.log('FAQ відкрито успішно');
      
    } catch (error) {
      console.error('❌ HelpFlow: Помилка відкриття FAQ:', error);
      await this.safeReply(ctx, 'Вибачте, не вдалося відкрити FAQ. Спробуйте ще раз.');
    }
  }
}

module.exports = HelpFlow;
