// Основний файл Telegram бота

const { Telegraf } = require('telegraf');
const { BotStep } = require('./types');

// Імпорт сервісів
const DatabaseService = require('../shared/database/DatabaseService');
const UserStateService = require('./services/UserStateService');
const ContactService = require('./services/ContactService');
const TaskService = require('./services/TaskService');
const ReminderService = require('./services/ReminderService');
const WebhookService = require('./services/WebhookService');

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
    console.log('🔍🔍🔍 SkillKlanBot constructor ВИКЛИКАНО');
    console.log('🔍🔍🔍 process.env.TELEGRAM_BOT_TOKEN:', process.env.TELEGRAM_BOT_TOKEN ? 'ПРИСУТНІЙ' : 'ВІДСУТНІЙ');
    console.log('🔍🔍🔍 Довжина токена в constructor:', process.env.TELEGRAM_BOT_TOKEN ? process.env.TELEGRAM_BOT_TOKEN.length : 0);
    console.log('🔍🔍🔍 Перші 10 символів токена:', process.env.TELEGRAM_BOT_TOKEN ? process.env.TELEGRAM_BOT_TOKEN.substring(0, 10) + '...' : 'НЕМАЄ');
    
    console.log('🔍🔍🔍 Створюємо Telegraf об\'єкт...');
    this.bot = new Telegraf(process.env.TELEGRAM_BOT_TOKEN);
    console.log('🔍🔍🔍 Telegraf об\'єкт створено');
    console.log('🔍🔍🔍 this.bot.token:', this.bot.token ? 'ПРИСУТНІЙ' : 'ВІДСУТНІЙ');
    
    console.log('🔍🔍🔍 Створюємо DatabaseService...');
    this.databaseService = new DatabaseService();
    console.log('🔍🔍🔍 DatabaseService створено');
    this.userStateService = new UserStateService(this.databaseService);
    this.contactService = new ContactService(this.databaseService);
    this.taskService = new TaskService(this.databaseService);
    this.webhookService = new WebhookService();
    this.reminderService = new ReminderService(this.databaseService, this.bot, this.webhookService);
    
    this.setupHandlers();
    this.setupMiddleware();
  }

  /**
   * Налаштування обробників
   */
  setupHandlers() {
    // Створюємо обробники
    const startHandler = new StartHandler(this.userStateService, this.contactService, this.taskService, this.webhookService);
    const professionHandler = new ProfessionHandler(this.userStateService, this.contactService, this.taskService, this.webhookService);
    const readyToTryHandler = new ReadyToTryHandler(this.userStateService, this.contactService, this.taskService, this.webhookService);
    const contactHandler = new ContactHandler(this.userStateService, this.contactService, this.taskService, this.webhookService);
    const taskHandler = new TaskHandler(this.userStateService, this.contactService, this.taskService, this.webhookService);
    const taskSubmissionHandler = new TaskSubmissionHandler(this.userStateService, this.contactService, this.taskService, this.webhookService);

    const restartHandler = new RestartHandler(this.userStateService, this.contactService, this.taskService, this.webhookService);
    const unknownHandler = new UnknownHandler(this.userStateService, this.contactService, this.taskService, this.webhookService);

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
      console.log('🔍🔍🔍 SkillKlanBot.start() ВИКЛИКАНО');
      console.log('🔍🔍🔍 Токен бота:', process.env.TELEGRAM_BOT_TOKEN ? 'ПРИСУТНІЙ' : 'ВІДСУТНІЙ');
      console.log('🔍🔍🔍 Довжина токена:', process.env.TELEGRAM_BOT_TOKEN ? process.env.TELEGRAM_BOT_TOKEN.length : 0);
      
      // Тестуємо з'єднання з БД
      console.log('🔍🔍🔍 Тестуємо з\'єднання з БД...');
      await this.databaseService.testConnection();
      console.log('🔍🔍🔍 З\'єднання з БД успішне');
      
      // Перевіряємо токен через API
      console.log('🔍🔍🔍 Перевіряємо токен через Telegram API...');
      const testUrl = `https://api.telegram.org/bot${process.env.TELEGRAM_BOT_TOKEN}/getMe`;
      console.log('🔍🔍🔍 URL для тестування:', testUrl);
      
      try {
        const response = await fetch(testUrl);
        const data = await response.json();
        console.log('🔍🔍🔍 Відповідь Telegram API:', JSON.stringify(data, null, 2));
        
        if (!data.ok) {
          console.error('❌❌❌ Telegram API повернув помилку:', data);
          throw new Error(`Telegram API error: ${data.description}`);
        }
        
        console.log('✅✅✅ Telegram API токен валідний');
      } catch (apiError) {
        console.error('❌❌❌ Помилка при перевірці токена через API:', apiError);
        throw apiError;
      }
      
      // Запускаємо бота
      console.log('🔍🔍🔍 Запускаємо Telegraf bot...');
      console.log('🔍🔍🔍 Telegraf bot об\'єкт:', typeof this.bot);
      console.log('🔍🔍🔍 Telegraf bot токен:', this.bot.token ? 'ПРИСУТНІЙ' : 'ВІДСУТНІЙ');
      
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
