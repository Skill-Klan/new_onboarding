// Обробник команди /start

const BaseHandler = require('./BaseHandler');
const { BotStep } = require('../types');

class StartHandler extends BaseHandler {
  async execute(ctx, userState) {
    const { MessageTemplates } = require('../templates/messages');
    const { KeyboardTemplates } = require('../templates/keyboards');
    
    // Отримуємо інформацію про користувача
    const userInfo = this.getUserInfo(ctx);
    
    // Оновлюємо інформацію про користувача в стані
    userState.username = userInfo.username;
    userState.userId = userInfo.id;
    
    // Відправляємо вітальне повідомлення
    await this.safeReply(
      ctx, 
      MessageTemplates.getWelcomeMessage(),
      KeyboardTemplates.getProfessionKeyboard()
    );
  }

  getNextStep() {
    return BotStep.PROFESSION_SELECTION;
  }
}

module.exports = StartHandler;
