/**
 * TaskFlow - Flow для обробки завдань
 */

const BaseFlow = require('./BaseFlow');
const { BotStep } = require('../types');
const MessageTemplates = require('../templates/messages');
const KeyboardTemplates = require('../templates/keyboards');

class TaskFlow extends BaseFlow {
  constructor(databaseService, webhookService) {
    super(databaseService, webhookService);
    this.databaseService = databaseService;
    this.webhookService = webhookService;
    this.log('Ініціалізація TaskFlow');
  }

  async canHandle(ctx) {
    const userState = ctx.userState;
    if (!userState) return false;
    
    // Обробляємо коли користувач на кроці TASK_DELIVERY
    return userState.currentStep === BotStep.TASK_DELIVERY;
  }

  async canHandleCallback(ctx) {
    const userState = ctx.userState;
    if (!userState) return false;
    
    // Обробляємо callback для здачі завдання
    return ctx.callbackQuery?.data === 'submit_task';
  }

  async handle(ctx) {
    this.log('Обробка завдання');
    
    try {
      const userState = ctx.userState;
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

  /**
   * Обробка доставки завдання (викликається з OnboardingFlow)
   */
  async handleTaskDelivery(ctx, userState) {
    this.log('Обробка доставки завдання');
    
    try {
      if (!userState) {
        await this.safeReply(ctx, MessageTemplates.getErrorMessage());
        return;
      }

      // Перевіряємо, чи вибрана професія
      if (!userState.selected_profession) {
        this.log('Професія не вибрана');
        await this.safeReply(ctx, 'Помилка: професія не вибрана. Спробуйте /start');
        return;
      }

      // Отримуємо інформацію про завдання
      const taskInfo = this.getTaskInfo(userState.selected_profession);
      if (!taskInfo) {
        this.log('Інформація про завдання не знайдена');
        await this.safeReply(ctx, 'Помилка: завдання для цієї професії не знайдено');
        return;
      }

      // Перевіряємо, чи існує файл завдання
      const fileExists = await this.taskFileExists(userState.selected_profession);
      if (!fileExists) {
        this.log('Файл завдання не існує');
        await this.safeReply(ctx, 'Помилка: файл завдання не знайдено');
        return;
      }

      // Отримуємо шлях до файлу
      const filePath = this.getTaskFilePath(userState.selected_profession);
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
      await this.databaseService.updateUser(userState.telegram_id, {
        task_sent: true,
        task_sent_at: new Date(),
        task_deadline: new Date(Date.now() + 9 * 24 * 60 * 60 * 1000), // 9 днів
        last_activity: new Date()
      });
      this.log('Стан користувача оновлено');
      
      // Відправляємо webhook про відправку завдання
      try {
        const webhookData = {
          telegramId: userState.telegram_id,
          profession: userState.selected_profession,
          taskTitle: taskInfo.title,
          taskDeadline: taskInfo.deadline
        };
        await this.webhookService.notifyTaskSent(webhookData);
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
      const userState = ctx.userState;
      if (!userState) {
        await this.safeReply(ctx, MessageTemplates.getErrorMessage());
        return;
      }

      // Тут має бути логіка здачі завдання
      await this.safeReply(ctx, 'Дякую за здачу завдання! Ми зв\'яжемося з вами незабаром.');
      
      // Оновлюємо крок на завершений
      await this.databaseService.updateUser(userState.telegram_id, {
        current_step: BotStep.COMPLETED,
        last_activity: new Date()
      });
      
      this.log('Завдання здано успішно');
      
    } catch (error) {
      console.error('❌ TaskFlow: Помилка здачі завдання:', error);
      await this.safeReply(ctx, MessageTemplates.getErrorMessage());
    }
  }

  /**
   * Отримання інформації про завдання
   */
  getTaskInfo(profession) {
    const tasks = {
      'QA': {
        title: 'Тестове завдання QA',
        description: 'Проаналізуйте функціональність та створіть тест-кейси',
        deadline: '9 днів'
      },
      'BA': {
        title: 'Тестове завдання BA',
        description: 'Проаналізуйте бізнес-процеси та створіть технічне завдання',
        deadline: '9 днів'
      }
    };
    
    return tasks[profession] || null;
  }

  /**
   * Перевірка існування файлу завдання
   */
  async taskFileExists(profession) {
    const fs = require('fs').promises;
    const path = require('path');
    
    try {
      const filePath = this.getTaskFilePath(profession);
      await fs.access(filePath);
      return true;
    } catch (error) {
      return false;
    }
  }

  /**
   * Отримання шляху до файлу завдання
   */
  getTaskFilePath(profession) {
    const path = require('path');
    const fileName = profession === 'QA' ? 'qa-test-task.pdf' : 'ba-test-task.pdf';
    return path.join(__dirname, '../../assets/tasks', fileName);
  }
}

module.exports = TaskFlow;
