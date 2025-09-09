/**
 * TaskFlow - Flow для обробки завдань
 */

const BaseFlow = require('./BaseFlow');
const { BotStep } = require('../types');
const MessageTemplates = require('../templates/messages');
const KeyboardTemplates = require('../templates/keyboards');

class TaskFlow extends BaseFlow {
  constructor(services) {
    super(services);
    this.userStateService = services.userStateService;
    this.contactService = services.contactService;
    this.taskService = services.taskService;
    this.webhookService = services.webhookService;
    this.log('Ініціалізація TaskFlow');
  }

  async canHandle(ctx) {
    const userState = ctx.state.userState;
    if (!userState) return false;
    
    // Обробляємо коли користувач на кроці TASK_DELIVERY
    return userState.currentStep === BotStep.TASK_DELIVERY;
  }

  async canHandleCallback(ctx) {
    const userState = ctx.state.userState;
    if (!userState) return false;
    
    // Обробляємо callback для здачі завдання
    return ctx.callbackQuery?.data === 'submit_task';
  }

  async handle(ctx) {
    this.log('Обробка завдання');
    
    try {
      const userState = ctx.state.userState;
      if (!userState) {
        await this.safeReply(ctx, MessageTemplates.getErrorMessage());
        return;
      }

      // Перевіряємо, чи вибрана професія
      if (!userState.selectedProfession) {
        this.log('Професія не вибрана');
        await this.safeReply(ctx, 'Помилка: професія не вибрана. Спробуйте /start');
        return;
      }

      // Отримуємо інформацію про завдання
      const taskInfo = this.taskService.getTaskInfo(userState.selectedProfession);
      if (!taskInfo) {
        this.log('Інформація про завдання не знайдена');
        await this.safeReply(ctx, 'Помилка: завдання для цієї професії не знайдено');
        return;
      }

      // Перевіряємо, чи існує файл завдання
      const fileExists = await this.taskService.taskFileExists(userState.selectedProfession);
      if (!fileExists) {
        this.log('Файл завдання не існує');
        await this.safeReply(ctx, 'Помилка: файл завдання не знайдено');
        return;
      }

      // Отримуємо шлях до файлу
      const filePath = this.taskService.getTaskFilePath(userState.selectedProfession);
      this.log('Відправляємо файл:', filePath);

      // Пауза 2.5 секунди перед відправкою файлу
      this.log('Пауза 2.5 секунди перед відправкою файлу');
      await new Promise(resolve => setTimeout(resolve, 2500));

      // Відправляємо файл
      await ctx.replyWithDocument(
        { source: filePath },
        {
          caption: `📋 ${taskInfo.title}\n\n${taskInfo.description}\n\n⏰ Термін виконання: ${taskInfo.deadline}\n\nВіримо в тебе — вперед до перемоги! 🚀`
        }
      );

      this.log('Файл відправлено успішно');

      // Оновлюємо стан користувача
      await this.userStateService.markTaskSent(userState.telegramId);
      this.log('Стан користувача оновлено');
      
      // Відправляємо webhook про відправку завдання
      try {
        const updatedUserState = await this.userStateService.getState(userState.telegramId);
        const taskData = {
          profession: userState.selectedProfession,
          title: taskInfo.title,
          deadline: taskInfo.deadline
        };
        await this.webhookService.notifyTaskSent(updatedUserState, taskData);
        this.log('Webhook про відправку завдання відправлено');
      } catch (webhookError) {
        console.error('❌ TaskFlow: Помилка відправки webhook:', webhookError);
        // Не зупиняємо виконання через помилку webhook
      }

      // Відправляємо повідомлення з кнопкою через 10 секунд
      this.log('Плануємо відправку кнопки через 10 секунд');
      setTimeout(async () => {
        try {
          await ctx.reply(
            MessageTemplates.getTaskSubmissionPromptMessage(),
            KeyboardTemplates.getTaskCompletionKeyboard()
          );
          this.log('Кнопка здачі завдання відправлена');
        } catch (error) {
          console.error('❌ TaskFlow: Помилка відправки кнопки:', error);
        }
      }, 10000); // 10 секунд

    } catch (error) {
      console.error('❌ TaskFlow: Помилка обробки завдання:', error);
      await this.safeReply(ctx, 'Вибачте, сталася помилка при відправці завдання. Спробуйте ще раз.');
    }
  }

  async handleCallback(ctx) {
    this.log('Обробка callback здачі завдання');
    
    try {
      const userState = ctx.state.userState;
      if (!userState) {
        await this.safeReply(ctx, MessageTemplates.getErrorMessage());
        return;
      }

      // Тут має бути логіка здачі завдання
      await this.safeReply(ctx, 'Дякую за здачу завдання! Ми зв\'яжемося з вами незабаром.');
      
      // Оновлюємо крок на завершений
      await this.userStateService.updateStep(userState.telegramId, BotStep.COMPLETED);
      
      this.log('Завдання здано успішно');
      
    } catch (error) {
      console.error('❌ TaskFlow: Помилка здачі завдання:', error);
      await this.safeReply(ctx, MessageTemplates.getErrorMessage());
    }
  }
}

module.exports = TaskFlow;
