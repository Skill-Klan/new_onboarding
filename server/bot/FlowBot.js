/**
 * FlowBot - Головний фасад для обробки повідомлень бота
 * 
 * Цей клас є єдиною точкою входу для взаємодії з ботом.
 * Він приймає оновлення і делегує їх обробникам через Chain of Responsibility.
 * 
 * Архітектура:
 * - Фасад: приховує внутрішню реалізацію
 * - Chain of Responsibility: кожен flow вирішує чи обробляти повідомлення
 * - Dependency Injection: гнучке підключення компонентів
 */

const { Telegraf } = require('telegraf');

// Імпорт flows
const OnboardingFlow = require('./flows/OnboardingFlow');
const HelpFlow = require('./flows/HelpFlow');
const ContactFlow = require('./flows/ContactFlow');
const TaskFlow = require('./flows/TaskFlow');

// Імпорт middleware
const AuthMiddleware = require('./middleware/AuthMiddleware');
const StateMiddleware = require('./middleware/StateMiddleware');
const LoggingMiddleware = require('./middleware/LoggingMiddleware');

// Імпорт сервісів
const DatabaseService = require('../shared/database/DatabaseService');
const WebhookService = require('./services/WebhookService');

// Імпорт конфігурації
const BotConfig = require('./config/BotConfig');

class FlowBot {
  constructor() {
    console.log('🏗️ FlowBot: Ініціалізація фасаду...');
    
    // Ініціалізація Telegraf
    this.bot = new Telegraf(process.env.TELEGRAM_BOT_TOKEN);
    
    // Ініціалізація сервісів
    this.databaseService = new DatabaseService();
    this.webhookService = new WebhookService();
    
    // Ініціалізація flows
    this.flows = this.initializeFlows();
    
    // Ініціалізація middleware
    this.middleware = this.initializeMiddleware();
    
    // Налаштування обробників
    this.setupHandlers();
    
    console.log('✅ FlowBot: Фасад ініціалізовано');
  }

  /**
   * Ініціалізація flows через DI
   */
  initializeFlows() {
    console.log('🔄 FlowBot: Ініціалізація flows...');
    
    const flows = [
      new OnboardingFlow(this.databaseService, this.webhookService),
      new HelpFlow(this.databaseService, this.webhookService),
      new ContactFlow(this.databaseService, this.webhookService),
      new TaskFlow(this.databaseService, this.webhookService)
    ];
    
    console.log(`✅ FlowBot: Ініціалізовано ${flows.length} flows`);
    return flows;
  }

  /**
   * Ініціалізація middleware
   */
  initializeMiddleware() {
    console.log('🔄 FlowBot: Ініціалізація middleware...');
    
    const middleware = [
      new LoggingMiddleware(),
      new AuthMiddleware(this.databaseService),
      new StateMiddleware(this.databaseService)
    ];
    
    console.log(`✅ FlowBot: Ініціалізовано ${middleware.length} middleware`);
    return middleware;
  }

  /**
   * Налаштування обробників повідомлень
   */
  setupHandlers() {
    console.log('🔄 FlowBot: Налаштування обробників...');
    
    // Обробник всіх повідомлень
    this.bot.on('message', async (ctx) => {
      await this.handleMessage(ctx);
    });
    
    // Обробник callback queries
    this.bot.on('callback_query', async (ctx) => {
      await this.handleCallbackQuery(ctx);
    });
    
    console.log('✅ FlowBot: Обробники налаштовано');
  }

  /**
   * Головний метод обробки повідомлень
   * Реалізує Chain of Responsibility
   */
  async handleMessage(ctx) {
    console.log('🔄 FlowBot: Обробка повідомлення...');
    
    try {
      // Застосування middleware
      for (const middleware of this.middleware) {
        const result = await middleware.process(ctx);
        if (!result.continue) {
          console.log('🛑 FlowBot: Middleware зупинив обробку');
          return;
        }
      }
      
      // Пошук відповідного flow
      for (const flow of this.flows) {
        if (await flow.canHandle(ctx)) {
          console.log(`✅ FlowBot: Знайдено flow: ${flow.constructor.name}`);
          await flow.handle(ctx);
          return;
        }
      }
      
      // Якщо жоден flow не може обробити
      console.log('⚠️ FlowBot: Жоден flow не може обробити повідомлення');
      await this.handleUnknownMessage(ctx);
      
    } catch (error) {
      console.error('❌ FlowBot: Помилка обробки повідомлення:', error);
      await this.handleError(ctx, error);
    }
  }

  /**
   * Обробка callback queries
   */
  async handleCallbackQuery(ctx) {
    console.log('🔄 FlowBot: Обробка callback query...');
    console.log('🔍 Callback data:', ctx.callbackQuery?.data);
    console.log('🔍 User ID:', ctx.from?.id);
    
    try {
      // Застосування middleware
      console.log('🔄 FlowBot: Застосування middleware...');
      for (const middleware of this.middleware) {
        console.log(`🔄 FlowBot: Обробка middleware: ${middleware.constructor.name}`);
        const result = await middleware.process(ctx);
        console.log(`🔄 FlowBot: Результат middleware:`, result);
        if (!result.continue) {
          console.log('🔄 FlowBot: Middleware зупинив обробку');
          return;
        }
      }
      
      // Пошук відповідного flow
      console.log('🔄 FlowBot: Пошук відповідного flow...');
      for (const flow of this.flows) {
        console.log(`🔄 FlowBot: Перевірка flow: ${flow.constructor.name}`);
        const canHandle = await flow.canHandleCallback(ctx);
        console.log(`🔄 FlowBot: Може обробити: ${canHandle}`);
        
        if (canHandle) {
          console.log(`✅ FlowBot: Знайдено flow для callback: ${flow.constructor.name}`);
          await flow.handleCallback(ctx);
          return;
        }
      }
      
      // Якщо жоден flow не може обробити
      console.log('⚠️ FlowBot: Жоден flow не може обробити callback');
      await ctx.answerCbQuery('Невідома команда');
      
    } catch (error) {
      console.error('❌ FlowBot: Помилка обробки callback:', error);
      console.error('❌ Stack trace:', error.stack);
      await this.handleError(ctx, error);
    }
  }

  /**
   * Обробка невідомих повідомлень
   */
  async handleUnknownMessage(ctx) {
    console.log('🔄 FlowBot: Обробка невідомого повідомлення...');
    
    const message = BotConfig.getUnknownMessage();
    const keyboard = BotConfig.getMainKeyboard();
    
    await ctx.reply(message, keyboard);
  }

  /**
   * Обробка помилок
   */
  async handleError(ctx, error) {
    console.error('❌ FlowBot: Обробка помилки:', error);
    
    const message = BotConfig.getErrorMessage();
    await ctx.reply(message);
  }

  /**
   * Запуск бота
   */
  async start() {
    console.log('🚀 FlowBot: Запуск бота...');
    
    try {
      // Тестування з'єднання з БД
      await this.databaseService.connect();
      console.log('✅ FlowBot: З\'єднання з БД успішне');
      
      // Тестування токена
      const me = await this.bot.telegram.getMe();
      console.log(`✅ FlowBot: Бот підключений: ${me.first_name} (@${me.username})`);
      
      // Запуск бота
      await this.bot.launch();
      console.log('🤖 FlowBot: Бот запущено успішно!');
      
      // Graceful shutdown
      process.once('SIGINT', () => this.stop('SIGINT'));
      process.once('SIGTERM', () => this.stop('SIGTERM'));
      
    } catch (error) {
      console.error('❌ FlowBot: Помилка запуску:', error);
      throw error;
    }
  }

  /**
   * Зупинка бота
   */
  async stop(signal) {
    console.log(`🛑 FlowBot: Зупинка бота (${signal})...`);
    
    try {
      await this.bot.stop(signal);
      await this.databaseService.disconnect();
      console.log('✅ FlowBot: Бот зупинено успішно');
    } catch (error) {
      console.error('❌ FlowBot: Помилка зупинки:', error);
    }
  }

  /**
   * Отримання інформації про бота
   */
  getInfo() {
    return {
      flows: this.flows.map(flow => flow.constructor.name),
      middleware: this.middleware.map(mw => mw.constructor.name),
      status: 'running'
    };
  }
}

module.exports = FlowBot;
