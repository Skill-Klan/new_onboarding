// Клавіатури для бота

const { Markup } = require('telegraf');

class KeyboardTemplates {
  /**
   * Клавіатура вибору професії
   */
  static getProfessionKeyboard() {
    return Markup.inlineKeyboard([
      [
        Markup.button.callback('1️⃣ QA (тестувальник)', 'profession_QA'),
        Markup.button.callback('2️⃣ Business Analyst', 'profession_BA')
      ],
      [Markup.button.callback('📚 Дізнатися більше (FAQ)', 'show_faq')]
    ]);
  }

  /**
   * Клавіатура "Готовий спробувати"
   */
  static getReadyToTryKeyboard() {
    return Markup.inlineKeyboard([
      [Markup.button.callback('Я готовий спробувати 🚀', 'ready_to_try')]
    ]);
  }

  /**
   * Клавіатура "Поділитись контактом"
   */
  static getContactKeyboard() {
    return Markup.keyboard([
      [Markup.button.contactRequest('📱 Поділитись контактом')]
    ]).resize();
  }

  /**
   * Клавіатура після отримання завдання
   */
  static getTaskCompletionKeyboard() {
    return Markup.inlineKeyboard([
      [Markup.button.callback('Я готовий здати тестове завдання', 'submit_task')]
    ]);
  }

  /**
   * Клавіатура головного меню
   */
  static getMainMenuKeyboard() {
    return Markup.inlineKeyboard([
      [Markup.button.callback('🔄 Почати спочатку', 'restart')],
      [Markup.button.callback('📚 FAQ', 'show_faq')]
    ]);
  }

  /**
   * Прибрати клавіатуру
   */
  static removeKeyboard() {
    return Markup.removeKeyboard();
  }
}

module.exports = KeyboardTemplates;
