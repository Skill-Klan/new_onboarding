// Основний файл Telegram бота

const { Telegraf } = require('telegraf');
const { BotStep } = require('./types');

// Імпорт сервісів
const DatabaseService = require('../shared/database/DatabaseService');
const UserStateService = require('./services/UserStateService');
const ContactService = require('./services/ContactService');
const TaskService = require('./services/TaskService');

// Імпорт обробників
const StartHandler = require('./handlers/StartHandler');
const ProfessionHandler = require('./handlers/ProfessionHandler');
const ReadyToTryHandler = require('./handlers/ReadyToTryHandler');
const ContactHandler = require('./handlers/ContactHandler');
const TaskHandler = require('./handlers/TaskHandler');
const TaskSubmissionHandler = require('./handlers/TaskSubmissionHandler');

const RestartHandler = require('./handlers/RestartHandler');
const UnknownHandler = require('./handlers/UnknownHandler');

class SkillKlanBot {
  constructor() {
    this.bot = new Telegraf(process.env.TELEGRAM_BOT_TOKEN);
    this.databaseService = new DatabaseService();
    this.userStateService = new UserStateService(this.databaseService);
    this.contactService = new ContactService(this.databaseService);
    this.taskService = new TaskService(this.databaseService);
    
    this.setupHandlers();
    this.setupMiddleware();
  }

  /**
   * Налаштування обробників
   */
  setupHandlers() {
    // Створюємо обробники
    const startHandler = new StartHandler(this.userStateService, this.contactService, this.taskService);
    const professionHandler = new ProfessionHandler(this.userStateService, this.contactService, this.taskService);
    const readyToTryHandler = new ReadyToTryHandler(this.userStateService, this.contactService, this.taskService);
    const contactHandler = new ContactHandler(this.userStateService, this.contactService, this.taskService);
    const taskHandler = new TaskHandler(this.userStateService, this.contactService, this.taskService);
    const taskSubmissionHandler = new TaskSubmissionHandler(this.userStateService, this.contactService, this.taskService);

    const restartHandler = new RestartHandler(this.userStateService, this.contactService, this.taskService);
    const unknownHandler = new UnknownHandler(this.userStateService, this.contactService, this.taskService);

    // Команда /start
    this.bot.start(async (ctx) => {
      console.log('🔍 bot.js: Отримуємо userState для', ctx.from.id);
      const userState = await this.userStateService.getState(ctx.from.id);
      console.log('🔍 bot.js: userState =', userState);
      console.log('🔍 bot.js: Викликаємо startHandler.handle');
      await startHandler.handle(ctx, userState);
    });

    // Callback обробники
    this.bot.action('profession_QA', async (ctx) => {
      const userState = await this.userStateService.getState(ctx.from.id);
      await professionHandler.handle(ctx, userState);
    });

    this.bot.action('profession_BA', async (ctx) => {
      const userState = await this.userStateService.getState(ctx.from.id);
      await professionHandler.handle(ctx, userState);
    });

    this.bot.action('ready_to_try', async (ctx) => {
      const userState = await this.userStateService.getState(ctx.from.id);
      await readyToTryHandler.handle(ctx, userState);
    });

    this.bot.action('submit_task', async (ctx) => {
      const userState = await this.userStateService.getState(ctx.from.id);
      await taskSubmissionHandler.handle(ctx, userState);
    });



    this.bot.action('restart', async (ctx) => {
      const userState = await this.userStateService.getState(ctx.from.id);
      await restartHandler.handle(ctx, userState);
    });

    // Обробка контактів
    this.bot.on('contact', async (ctx) => {
      const userState = await this.userStateService.getState(ctx.from.id);
      await contactHandler.handle(ctx, userState);
    });

    // Обробка текстових повідомлень
    this.bot.on('text', async (ctx) => {
      const userState = await this.userStateService.getState(ctx.from.id);
      
      // Перевіряємо, чи потрібно відправити завдання
      if (userState.currentStep === BotStep.TASK_DELIVERY && 
          userState.contactData && 
          !userState.taskSent) {
        await taskHandler.handle(ctx, userState);
      } else {
        await unknownHandler.handle(ctx, userState);
      }
    });

    // Обробка всіх інших повідомлень
    this.bot.on('message', async (ctx) => {
      const userState = await this.userStateService.getState(ctx.from.id);
      await unknownHandler.handle(ctx, userState);
    });
  }

  /**
   * Налаштування middleware
   */
  setupMiddleware() {
    // Логування всіх запитів
    this.bot.use(async (ctx, next) => {
      const start = Date.now();
      console.log(`📨 Вхідний запит: ${ctx.updateType} від ${ctx.from?.id}`);
      
      await next();
      
      const duration = Date.now() - start;
      console.log(`⏱️ Обробка зайняла: ${duration}ms`);
    });

    // Обробка помилок
    this.bot.catch((err, ctx) => {
      console.error('❌ Помилка в боті:', err);
      
      const { MessageTemplates } = require('./templates/messages');
      ctx.reply(MessageTemplates.getErrorMessage()).catch(console.error);
    });
  }

  /**
   * Запуск бота
   */
  async start() {
    try {
      // Тестуємо з'єднання з БД
      await this.databaseService.testConnection();
      
      // Запускаємо бота
      await this.bot.launch();
      console.log('🤖 SkillKlan Bot запущено успішно!');
      
      // Налаштовуємо graceful shutdown
      process.once('SIGINT', () => this.stop('SIGINT'));
      process.once('SIGTERM', () => this.stop('SIGTERM'));
      
    } catch (error) {
      console.error('❌ Помилка запуску бота:', error);
      throw error;
    }
  }

  /**
   * Зупинка бота
   */
  async stop(signal) {
    console.log(`🛑 Отримано сигнал ${signal}, зупиняємо бота...`);
    
    try {
      this.bot.stop(signal);
      await this.databaseService.close();
      console.log('✅ Бот зупинено успішно');
    } catch (error) {
      console.error('❌ Помилка зупинки бота:', error);
    }
  }

  /**
   * Отримання статистики
   */
  async getStats() {
    try {
      return await this.taskService.getTaskStatistics();
    } catch (error) {
      console.error('❌ Помилка отримання статистики:', error);
      return [];
    }
  }
}

module.exports = SkillKlanBot;
