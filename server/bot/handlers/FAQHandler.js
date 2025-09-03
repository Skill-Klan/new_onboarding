// Обробник показу FAQ

const BaseHandler = require('./BaseHandler');

class FAQHandler extends BaseHandler {
  async execute(ctx, userState) {
    const KeyboardTemplates = require('../templates/keyboards');
    
    // URL до WebApp FAQ
    const faqUrl = process.env.WEBAPP_URL || 'https://37.57.209.201.nip.io/faq';
    
    // Відправляємо повідомлення з посиланням на FAQ
    await this.safeReply(
      ctx, 
      `📚 Детальна інформація про SkillKlan доступна в нашому FAQ:

🔗 [Відкрити FAQ](${faqUrl})

Тут ви знайдете відповіді на всі питання про:
• Навчання та професії
• Формат занять
• Працевлаштування
• Фінанси
• Інструменти
• Спільноту

Після ознайомлення з FAQ, повертайтеся сюди для отримання тестового завдання! 🚀`,
      { parse_mode: 'Markdown' }
    );
    
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
