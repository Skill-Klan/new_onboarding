// Обробник команди /start

const BaseHandler = require('./BaseHandler');
const { BotStep } = require('../types');

class StartHandler extends BaseHandler {
  async execute(ctx, userState) {
    try {
      console.log('🚀 StartHandler: Початок виконання');
      
      const { MessageTemplates } = require('../templates/messages');
      console.log('✅ StartHandler: MessageTemplates завантажено');
      
      const { KeyboardTemplates } = require('../templates/keyboards');
      console.log('✅ StartHandler: KeyboardTemplates завантажено');
      
      // Отримуємо інформацію про користувача
      const userInfo = this.getUserInfo(ctx);
      console.log('✅ StartHandler: userInfo отримано:', userInfo);
      
      // Оновлюємо інформацію про користувача в стані
      userState.username = userInfo.username;
      userState.userId = userInfo.id;
      console.log('✅ StartHandler: userState оновлено:', userState);
      
      // Отримуємо повідомлення та клавіатуру
      const welcomeMessage = MessageTemplates.getWelcomeMessage();
      console.log('✅ StartHandler: welcomeMessage отримано:', welcomeMessage);
      
      const professionKeyboard = KeyboardTemplates.getProfessionKeyboard();
      console.log('✅ StartHandler: professionKeyboard отримано:', professionKeyboard);
      
      // Відправляємо вітальне повідомлення
      console.log('📤 StartHandler: Відправляємо повідомлення...');
      await this.safeReply(
        ctx, 
        welcomeMessage,
        professionKeyboard
      );
      console.log('✅ StartHandler: Повідомлення відправлено успішно');
      
    } catch (error) {
      console.error('❌ StartHandler: Помилка виконання:', error);
      console.error('❌ StartHandler: Stack trace:', error.stack);
      
      // Спробуємо відправити просте повідомлення про помилку
      try {
        await ctx.reply('Вибачте, сталася помилка. Спробуйте ще раз.');
      } catch (replyError) {
        console.error('❌ StartHandler: Помилка відправки повідомлення про помилку:', replyError);
      }
    }
  }

  getNextStep() {
    return BotStep.PROFESSION_SELECTION;
  }
}

module.exports = StartHandler;
