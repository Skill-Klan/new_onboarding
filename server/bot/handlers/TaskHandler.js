// Обробник доставки завдань

const BaseHandler = require('./BaseHandler');
const { BotStep } = require('../types');

class TaskHandler extends BaseHandler {
  async execute(ctx, userState) {
    const MessageTemplates = require('../templates/messages');
    
    // Перевіряємо, чи є всі необхідні дані
    if (!userState.selectedProfession || !userState.contactData) {
      await this.safeReply(ctx, MessageTemplates.getErrorMessage());
      return;
    }

    try {
      // Генеруємо завдання
      const taskData = this.taskService.generateTask(userState.selectedProfession);
      
      // Відправляємо завдання
      await this.taskService.sendTask(ctx, taskData);
      
      // Відстежуємо доставку
      await this.taskService.trackTaskDelivery(userState.telegramId, taskData);
      
      // Позначаємо завдання як відправлене
      await this.userStateService.markTaskSent(userState.telegramId);
      
      // Відправляємо фінальне повідомлення
      await this.safeReply(ctx, MessageTemplates.getCompletionMessage());

      // Логуємо успішну доставку
      console.log(`Завдання доставлено користувачу ${userState.telegramId} для професії ${userState.selectedProfession}`);

    } catch (error) {
      console.error('Помилка доставки завдання:', error);
      await this.safeReply(ctx, MessageTemplates.getErrorMessage());
    }
  }

  getNextStep() {
    return BotStep.COMPLETED;
  }

  /**
   * Валідація стану для цього обробника
   */
  validateState(userState) {
    return super.validateState(userState) && 
           userState.currentStep === BotStep.TASK_DELIVERY &&
           userState.selectedProfession &&
           userState.contactData;
  }
}

module.exports = TaskHandler;
