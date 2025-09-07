// Обробник показу FAQ

const BaseHandler = require('./BaseHandler');

class FAQHandler extends BaseHandler {
  async execute(ctx, userState) {
    // URL до MiniApp FAQ
    const faqUrl = process.env.WEBAPP_URL || 'https://your-username.github.io/new_onboarding/faq';
    
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
    
    // Підтверджуємо callback
    await ctx.answerCbQuery();
  }

  getNextStep() {
    // Не змінюємо крок, користувач залишається на поточному етапі
    return null;
  }

  /**
   * Валідація стану для цього обробника
   */
  validateState(userState) {
    // FAQ доступний на будь-якому етапі
    return super.validateState(userState);
  }
}

module.exports = FAQHandler;
