// Обробник команди /start

const BaseHandler = require('./BaseHandler');
const { BotStep } = require('../types');

class StartHandler extends BaseHandler {
  constructor(userStateService, contactService, taskService, webhookService) {
    super(userStateService, contactService, taskService, webhookService);
  }
  async execute(ctx, userState) {
    try {
      console.log('🔍 StartHandler: Початок execute, userState =', userState);
      console.log('🚀 StartHandler: Початок виконання');
      
      const MessageTemplates = require('../templates/messages');
      console.log('✅ StartHandler: MessageTemplates завантажено');
      
      const KeyboardTemplates = require('../templates/keyboards');
      console.log('✅ StartHandler: KeyboardTemplates завантажено');
      
      // Отримуємо інформацію про користувача
      const userInfo = this.getUserInfo(ctx);
      console.log('✅ StartHandler: userInfo отримано:', userInfo);
      
      // Оновлюємо інформацію про користувача в стані та зберігаємо в БД
      userState.username = userInfo.username;
      userState.userId = userInfo.id;
      console.log('✅ StartHandler: userState оновлено:', userState);
      
      // Зберігаємо оновлену інформацію в БД
      await this.userStateService.updateState(userState.telegramId, {
        username: userInfo.username,
        userId: userInfo.id
      });
      console.log('✅ StartHandler: інформація користувача збережена в БД');
      
      // Відправляємо webhook про початок взаємодії
      try {
        const webhookData = {
          telegramId: userState.telegramId,
          username: userInfo.username,
          firstName: userInfo.firstName,
          lastName: userInfo.lastName
        };
        await this.webhookService.notifyUserStarted(webhookData);
        console.log('✅ StartHandler: Webhook про початок взаємодії відправлено');
      } catch (webhookError) {
        console.error('❌ StartHandler: Помилка відправки webhook:', webhookError);
        // Не зупиняємо виконання через помилку webhook
      }
      
      // Отримуємо повідомлення та клавіатуру
      const welcomeMessage = MessageTemplates.getWelcomeMessage();
      console.log('✅ StartHandler: welcomeMessage отримано:', welcomeMessage);
      
      console.log('🔍 StartHandler: Отримуємо professionKeyboard');
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

  /**
   * Валідація стану для команди /start
   * Дозволяємо виконання на будь-якому кроці
   */
  validateState(userState) {
    console.log('🔍🔍🔍 StartHandler.validateState: ПОЧАТОК');
    console.log('🔍🔍🔍 StartHandler.validateState: userState =', userState);
    
    // Команда /start завжди дозволена
    return true;
  }

  /**
   * Отримати інформацію про користувача з контексту
   */
  getUserInfo(ctx) {
    const from = ctx.from;
    return {
      id: from.id,
      username: from.username || null,
      firstName: from.first_name || null,
      lastName: from.last_name || null
    };
  }
}

module.exports = StartHandler;
