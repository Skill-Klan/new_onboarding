/**
 * OnboardingFlow - Основний flow для онбордингу користувачів
 * 
 * Відповідає за:
 * - Початок взаємодії (/start)
 * - Вибір професії (QA/BA)
 * - Перехід до готовності спробувати
 */

const BaseFlow = require('./BaseFlow');
const { BotStep, Profession } = require('../types');
const MessageTemplates = require('../templates/messages');
const KeyboardTemplates = require('../templates/keyboards');

class OnboardingFlow extends BaseFlow {
  constructor(databaseService, webhookService) {
    super(databaseService, webhookService);
    this.log('Ініціалізація OnboardingFlow');
  }

  /**
   * Перевіряє чи може обробити повідомлення
   */
  async canHandle(ctx) {
    const message = ctx.message?.text;
    
    // Обробляємо команду /start
    if (message === '/start') {
      this.log('Може обробити: команда /start');
      return true;
    }
    
    return false;
  }

  /**
   * Перевіряє чи може обробити callback query
   */
  async canHandleCallback(ctx) {
    const callbackData = ctx.callbackQuery?.data;
    this.log('canHandleCallback: callbackData =', callbackData);
    this.log('canHandleCallback: ctx.callbackQuery =', ctx.callbackQuery);
    
    // Обробляємо вибір професії
    if (callbackData?.startsWith('profession_')) {
      this.log('✅ Може обробити callback: вибір професії');
      return true;
    }
    
    // Обробляємо готовність спробувати
    if (callbackData === 'ready_to_try') {
      this.log('✅ Може обробити callback: готовність спробувати');
      return true;
    }
    
    this.log('❌ Не може обробити callback:', callbackData);
    return false;
  }

  /**
   * Обробляє повідомлення
   */
  async handle(ctx) {
    this.log('Обробка повідомлення');
    
    const message = ctx.message?.text;
    
    if (message === '/start') {
      await this.handleStart(ctx);
    }
  }

  /**
   * Обробляє callback query
   */
  async handleCallback(ctx) {
    this.log('Обробка callback query');
    
    const callbackData = ctx.callbackQuery?.data;
    
    if (callbackData?.startsWith('profession_')) {
      await this.handleProfessionSelection(ctx, callbackData);
    } else if (callbackData === 'ready_to_try') {
      await this.handleReadyToTry(ctx);
    }
    
    // Підтверджуємо callback
    await this.safeAnswerCbQuery(ctx);
  }

  /**
   * Обробка команди /start
   */
  async handleStart(ctx) {
    this.log('Обробка команди /start');
    
    try {
      // Отримуємо інформацію про користувача
      const userInfo = this.getUserInfo(ctx);
      this.log('Отримано інформацію про користувача:', userInfo);
      
      if (!userInfo) {
        this.log('❌ Інформація про користувача не знайдена');
        await this.safeReply(ctx, MessageTemplates.getErrorMessage());
        return;
      }
      
      // Отримуємо або створюємо користувача
      let userState = ctx.userState;
      if (!userState) {
        this.log('⚠️ userState відсутній, створюємо користувача...');
        userState = await this.getOrCreateUser(userInfo);
        this.log('Створено/знайдено користувача:', userState);
      }
      
      // Оновлюємо інформацію про користувача в стані та зберігаємо в БД
      if (userState) {
        userState.username = userInfo.username;
        userState.userId = userInfo.id;
        
        // Зберігаємо оновлену інформацію в БД
        await this.databaseService.updateUser(userState.telegram_id, {
          username: userInfo.username
        });
        this.log('Інформація користувача збережена в БД');
      }
      
      // Відправляємо webhook про початок взаємодії
      try {
        const webhookData = {
          telegramId: userState?.telegram_id || userInfo.id,
          username: userInfo.username,
          firstName: userInfo.first_name,
          lastName: userInfo.last_name
        };
        await this.webhookService.notifyUserStarted(webhookData);
        this.log('Webhook про початок взаємодії відправлено');
      } catch (webhookError) {
        console.error('❌ OnboardingFlow: Помилка відправки webhook:', webhookError);
        // Не зупиняємо виконання через помилку webhook
      }
      
      // Відправляємо привітальне повідомлення
      const message = MessageTemplates.getWelcomeMessage();
      const keyboard = KeyboardTemplates.getProfessionKeyboard();
      
      await this.safeReply(ctx, message, keyboard);
      
      // Оновлюємо крок користувача
      if (userState) {
        await this.updateUserStep(userState.telegram_id, BotStep.PROFESSION_SELECTION);
      } else {
        this.log('⚠️ userState відсутній, не можемо оновити крок');
      }
      
      this.log('Команда /start оброблена успішно');
      
    } catch (error) {
      console.error('❌ OnboardingFlow: Помилка обробки /start:', error);
      await this.safeReply(ctx, MessageTemplates.getErrorMessage());
    }
  }

  /**
   * Обробка вибору професії
   */
  async handleProfessionSelection(ctx, callbackData) {
    this.log('🔍 handleProfessionSelection: callbackData =', callbackData);
    this.log('🔍 handleProfessionSelection: ctx.callbackQuery =', ctx.callbackQuery);
    this.log('🔍 handleProfessionSelection: ctx.state =', ctx.state);
    
    try {
      // Витягуємо професію з callback_data
      this.log('🔍 Витягуємо професію з callback_data...');
      const profession = this.extractProfession(callbackData);
      this.log('🔍 Витягнута професія:', profession);
      
      if (!profession) {
        this.log('❌ Професія не знайдена, відправляємо помилку');
        await this.safeReply(ctx, MessageTemplates.getErrorMessage());
        return;
      }
      
      // Отримуємо користувача
      this.log('🔍 Отримуємо стан користувача...');
      this.log('🔍 ctx.userState =', ctx.userState);
      this.log('🔍 ctx.state =', ctx.state);
      this.log('🔍 ctx =', Object.keys(ctx));
      let userState = ctx.userState;
      this.log('🔍 Стан користувача:', userState);
      
      if (!userState) {
        this.log('⚠️ Стан користувача не знайдено, створюємо користувача...');
        const userInfo = this.getUserInfo(ctx);
        if (userInfo) {
          userState = await this.getOrCreateUser(userInfo);
          this.log('Створено/знайдено користувача:', userState);
        } else {
          this.log('❌ Не вдалося отримати інформацію про користувача');
          await this.safeReply(ctx, MessageTemplates.getErrorMessage());
          return;
        }
      }
      
      // Оновлюємо професію
      this.log('🔍 Оновлюємо професію в БД...');
      await this.databaseService.updateUser(userState.telegram_id, { 
        selected_profession: profession,
        last_activity: new Date()
      });
      this.log('✅ Професія збережена в БД:', profession);
      
      // Оновлюємо крок користувача на PROFESSION_SELECTION
      this.log('🔍 Оновлюємо крок користувача...');
      await this.databaseService.updateUser(userState.telegram_id, { 
        current_step: BotStep.PROFESSION_SELECTION,
        last_activity: new Date()
      });
      this.log('✅ Крок користувача оновлено на PROFESSION_SELECTION');
      
      // Відправляємо опис професії
      this.log('Отримуємо опис професії...');
      const description = this.getProfessionDescription(profession);
      this.log('Опис професії:', description.substring(0, 100) + '...');
      
      this.log('Отримуємо клавіатуру...');
      const keyboard = KeyboardTemplates.getReadyToTryKeyboard();
      this.log('Клавіатура:', JSON.stringify(keyboard, null, 2));
      
      this.log('Відправляємо повідомлення з клавіатурою...');
      await this.safeReply(ctx, description, keyboard);
      this.log('✅ Повідомлення відправлено успішно');
      
      this.log('✅ Професія обрана успішно:', profession);
      
    } catch (error) {
      console.error('❌ OnboardingFlow: Помилка вибору професії:', error);
      console.error('❌ Stack trace:', error.stack);
      await this.safeReply(ctx, MessageTemplates.getErrorMessage());
    }
  }

  /**
   * Обробка готовності спробувати
   */
  async handleReadyToTry(ctx) {
    this.log('Обробка готовності спробувати');
    
    try {
      // Отримуємо користувача
      let userState = ctx.userState;
      if (!userState) {
        this.log('⚠️ Стан користувача не знайдено, створюємо користувача...');
        const userInfo = this.getUserInfo(ctx);
        if (userInfo) {
          userState = await this.getOrCreateUser(userInfo);
          this.log('Створено/знайдено користувача:', userState);
        } else {
          this.log('❌ Не вдалося отримати інформацію про користувача');
          await this.safeReply(ctx, MessageTemplates.getErrorMessage());
          return;
        }
      }
      
      if (!userState.selected_profession) {
        this.log('Професія не вибрана');
        await this.safeReply(ctx, MessageTemplates.getErrorMessage());
        return;
      }
      
      // Перевіряємо наявність контакту
      this.log('Перевіряємо наявність контакту...');
      const hasContact = await this.hasUserContact(userState.telegram_id);
      this.log('hasContact =', hasContact);

      if (hasContact) {
        // Якщо контакт вже є, одразу надсилаємо завдання
        this.log('Контакт вже є, надсилаємо завдання');
        await this.safeReply(ctx, 'Надсилаю тобі тестове завдання. У тебе є 9 робочих днів, щоб його виконати.\n\nЦе завдання створене не для перевірки знань, а щоб ми побачили, як ти вмієш:\n— швидко вчитись,\n— грамотно шукати інформацію (Google, YouTube),\n— і доводити справу до кінця.\n\n❗️Не використовуй ChatGPT або інші ШІ — вони корисні тільки тоді, коли вже вмієш. Нам важливо побачити саме твій спосіб мислення.');
        
        // Оновлюємо крок на TASK_DELIVERY
        await this.updateUserStep(userState.telegram_id, BotStep.TASK_DELIVERY);
        
        // Відправляємо завдання через TaskFlow
        const TaskFlow = require('./TaskFlow');
        const taskFlow = new TaskFlow(this.databaseService, this.webhookService);
        await taskFlow.handleTaskDelivery(ctx, userState);
      } else {
        // Якщо контакту немає, запитуємо його
        this.log('Контакт відсутній, запитуємо');
        
        // Оновлюємо крок користувача
        this.log('Оновлюємо крок на CONTACT_REQUEST');
        await this.updateUserStep(userState.telegram_id, BotStep.CONTACT_REQUEST);

        // Відправляємо запит контакту
        this.log('Відправляємо запит контакту');
        await this.safeReply(
          ctx, 
          MessageTemplates.getContactRequestMessage(),
          KeyboardTemplates.getContactKeyboard()
        );
      }
      
      this.log('Готовність спробувати оброблена успішно');
      
    } catch (error) {
      console.error('❌ OnboardingFlow: Помилка готовності спробувати:', error);
      await this.safeReply(ctx, MessageTemplates.getErrorMessage());
    }
  }

  /**
   * Перехід до TaskFlow
   */
  async transitionToTaskFlow(ctx, userState) {
    this.log('Перехід до TaskFlow');
    
    // Оновлюємо крок
    await this.updateUserStep(userState.telegramId, BotStep.TASK_DELIVERY);
    
    // Тут має бути логіка переходу до TaskFlow
    // Поки що просто відправляємо повідомлення
    await this.safeReply(ctx, 'Завдання буде надіслано незабаром.');
  }

  /**
   * Отримання інформації про користувача
   */
  getUserInfo(ctx) {
    this.log('getUserInfo: ctx.from =', ctx.from);
    this.log('getUserInfo: ctx.message =', ctx.message);
    this.log('getUserInfo: ctx.callbackQuery =', ctx.callbackQuery);
    
    const from = ctx.from || ctx.message?.from || ctx.callbackQuery?.from;
    this.log('getUserInfo: from =', from);
    
    if (!from) {
      this.log('❌ getUserInfo: from не знайдено');
      return null;
    }
    
    const userInfo = {
      id: from.id,
      username: from.username,
      first_name: from.first_name,
      last_name: from.last_name
    };
    
    this.log('getUserInfo: userInfo =', userInfo);
    return userInfo;
  }

  /**
   * Отримання або створення користувача
   */
  async getOrCreateUser(userInfo) {
    try {
      // Перевіряємо чи є користувач в БД
      const existingUser = await this.databaseService.getUserByTelegramId(userInfo.id);
      
      if (existingUser) {
        this.log('Користувач знайдено в БД');
        return existingUser;
      }
      
      // Створюємо нового користувача
      this.log('Створюємо нового користувача');
      const newUser = await this.databaseService.createUser({
        telegram_id: userInfo.id,
        username: userInfo.username,
        first_name: userInfo.first_name,
        last_name: userInfo.last_name,
        current_step: BotStep.START,
        selected_profession: null,
        contact_data: null,
        task_sent: false,
        last_activity: new Date(),
        created_at: new Date()
      });
      
      return newUser;
    } catch (error) {
      console.error('❌ OnboardingFlow: Помилка getOrCreateUser:', error);
      throw error;
    }
  }

  /**
   * Отримання користувача за Telegram ID
   */
  async getUserByTelegramId(telegramId) {
    try {
      return await this.databaseService.getUserByTelegramId(telegramId);
    } catch (error) {
      console.error('❌ OnboardingFlow: Помилка getUserByTelegramId:', error);
      throw error;
    }
  }

  /**
   * Оновлення кроку користувача
   */
  async updateUserStep(telegramId, step) {
    try {
      this.log('Оновлення кроку користувача:', step);
      await this.databaseService.updateUser(telegramId, { 
        current_step: step,
        last_activity: new Date()
      });
    } catch (error) {
      console.error('❌ OnboardingFlow: Помилка updateUserStep:', error);
      throw error;
    }
  }

  /**
   * Оновлення професії користувача
   */
  async updateUserProfession(telegramId, profession) {
    try {
      this.log('Оновлення професії користувача:', profession);
      await this.databaseService.updateUser(telegramId, { 
        selected_profession: profession,
        last_activity: new Date()
      });
    } catch (error) {
      console.error('❌ OnboardingFlow: Помилка updateUserProfession:', error);
      throw error;
    }
  }

  /**
   * Перевірка наявності контакту
   */
  async hasUserContact(telegramId) {
    try {
      const contact = await this.databaseService.getContactByUserId(telegramId);
      return contact !== null;
    } catch (error) {
      console.error('❌ OnboardingFlow: Помилка hasUserContact:', error);
      return false;
    }
  }

  /**
   * Витягування професії з callback_data
   */
  extractProfession(callbackData) {
    this.log('extractProfession: callbackData =', callbackData);
    this.log('extractProfession: typeof callbackData =', typeof callbackData);
    
    if (callbackData === 'profession_QA') {
      this.log('✅ Знайдено професію QA');
      return Profession.QA;
    } else if (callbackData === 'profession_BA') {
      this.log('✅ Знайдено професію BA');
      return Profession.BA;
    }
    
    this.log('❌ Професія не знайдена для callbackData:', callbackData);
    return null;
  }

  /**
   * Отримання опису професії
   */
  getProfessionDescription(profession) {
    switch (profession) {
      case Profession.QA:
        return MessageTemplates.getQADescription();
      case Profession.BA:
        return MessageTemplates.getBADescription();
      default:
        return MessageTemplates.getErrorMessage();
    }
  }

  /**
   * Обробка помилок
   */
  async handleError(ctx, error) {
    console.error('❌ OnboardingFlow: Помилка:', error);
    await this.safeReply(ctx, BotConfig.getErrorMessage());
  }
}

module.exports = OnboardingFlow;
