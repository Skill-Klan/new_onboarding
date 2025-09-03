// Обробник для відправки тестових завдань

const BaseHandler = require('./BaseHandler');
const { BotStep } = require('../types');

class TaskHandler extends BaseHandler {
  async execute(ctx, userState) {
    console.log('🔍🔍🔍 TaskHandler.execute: ПОЧАТОК');
    console.log('🔍🔍🔍 TaskHandler.execute: userState =', userState);
    
    try {
      // Перевіряємо, чи вибрана професія
      if (!userState.selectedProfession) {
        console.log('🔍🔍🔍 TaskHandler.execute: професія не вибрана');
        await this.safeReply(ctx, 'Помилка: професія не вибрана. Спробуйте /start');
        return;
      }

      // Отримуємо інформацію про завдання
      const taskInfo = this.taskService.getTaskInfo(userState.selectedProfession);
      if (!taskInfo) {
        console.log('🔍🔍🔍 TaskHandler.execute: інформація про завдання не знайдена');
        await this.safeReply(ctx, 'Помилка: завдання для цієї професії не знайдено');
        return;
      }

      // Перевіряємо, чи існує файл завдання
      const fileExists = await this.taskService.taskFileExists(userState.selectedProfession);
      if (!fileExists) {
        console.log('🔍🔍🔍 TaskHandler.execute: файл завдання не існує');
        await this.safeReply(ctx, 'Помилка: файл завдання не знайдено');
        return;
      }

      // Отримуємо шлях до файлу
      const filePath = this.taskService.getTaskFilePath(userState.selectedProfession);
      console.log('🔍🔍🔍 TaskHandler.execute: відправляємо файл =', filePath);

      // Відправляємо файл
      await ctx.replyWithDocument(
        { source: filePath },
        {
          caption: `📋 ${taskInfo.title}\n\n${taskInfo.description}\n\n⏰ Термін виконання: ${taskInfo.deadline}\n\nУспіхів! 🚀`
        }
      );

      console.log('🔍🔍🔍 TaskHandler.execute: файл відправлено успішно');

      // Оновлюємо стан користувача
      await this.userStateService.markTaskSent(userState.telegramId);
      console.log('🔍🔍🔍 TaskHandler.execute: стан користувача оновлено');

    } catch (error) {
      console.error('🔍🔍🔍 TaskHandler.execute: ПОМИЛКА =', error);
      await this.safeReply(ctx, 'Вибачте, сталася помилка при відправці завдання. Спробуйте ще раз.');
    }
  }

  getNextStep() {
    return BotStep.COMPLETED;
  }

  /**
   * Валідація стану для цього обробника
   */
  validateState(userState) {
    console.log('🔍🔍🔍 TaskHandler.validateState: ПОЧАТОК');
    console.log('🔍🔍🔍 TaskHandler.validateState: userState =', userState);
    
    const superValid = super.validateState(userState);
    const stepValid = userState.currentStep === BotStep.TASK_DELIVERY;
    const professionValid = !!userState.selectedProfession;
    
    console.log('🔍🔍🔍 TaskHandler.validateState: superValid =', superValid);
    console.log('🔍🔍🔍 TaskHandler.validateState: stepValid =', stepValid);
    console.log('🔍🔍🔍 TaskHandler.validateState: professionValid =', professionValid);
    console.log('🔍🔍🔍 TaskHandler.validateState: загальний результат =', superValid && stepValid && professionValid);
    
    return superValid && stepValid && professionValid;
  }
}

module.exports = TaskHandler;