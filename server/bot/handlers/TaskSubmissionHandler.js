// Обробник здачі завдання

const BaseHandler = require('./BaseHandler');
const { BotStep } = require('../types');

class TaskSubmissionHandler extends BaseHandler {
  async execute(ctx, userState) {
    const MessageTemplates = require('../templates/messages');
    const KeyboardTemplates = require('../templates/keyboards');
    
    // Відправляємо повідомлення про готовність менеджера
    await this.safeReply(
      ctx, 
      MessageTemplates.getTaskSubmissionMessage(),
      KeyboardTemplates.getMainMenuKeyboard()
    );
    
    // Підтверджуємо callback
    await ctx.answerCbQuery();

    // Логуємо здачу завдання
    console.log(`Користувач ${userState.telegramId} готовий здати завдання для професії ${userState.selectedProfession}`);

    // Тут можна додати логіку для сповіщення менеджера
    await this.notifyManager(userState);
  }

  getNextStep() {
    return BotStep.COMPLETED;
  }

  /**
   * Сповіщення менеджера про готовність користувача
   */
  async notifyManager(userState) {
    try {
      // Тут можна реалізувати логіку сповіщення менеджера
      // Наприклад, відправка повідомлення в адмін-чат
      console.log(`Менеджер повинен зв'язатися з користувачем ${userState.telegramId}`);
      
      // Можна додати запис в БД для відстеження
      // await this.databaseService.createManagerNotification(userState);
      
    } catch (error) {
      console.error('Помилка сповіщення менеджера:', error);
    }
  }

  /**
   * Валідація стану для цього обробника
   */
  validateState(userState) {
    return super.validateState(userState) && 
           userState.currentStep === BotStep.COMPLETED &&
           userState.taskSent;
  }
}

module.exports = TaskSubmissionHandler;
