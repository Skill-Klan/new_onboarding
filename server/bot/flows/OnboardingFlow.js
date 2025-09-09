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
const BotConfig = require('../config/BotConfig');

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
    
    // Обробляємо вибір професії
    if (callbackData?.startsWith('profession_')) {
      this.log('Може обробити callback: вибір професії');
      return true;
    }
    
    // Обробляємо готовність спробувати
    if (callbackData === 'ready_to_try') {
      this.log('Може обробити callback: готовність спробувати');
      return true;
    }
    
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
      
      // Оновлюємо інформацію про користувача в стані та зберігаємо в БД
      const userState = ctx.state.userState;
      if (userState) {
        userState.username = userInfo.username;
        userState.userId = userInfo.id;
        
        // Зберігаємо оновлену інформацію в БД
        await this.userStateService.updateState(userState.telegramId, {
          username: userInfo.username,
          userId: userInfo.id
        });
        this.log('Інформація користувача збережена в БД');
      }
      
      // Відправляємо webhook про початок взаємодії
      try {
        const webhookData = {
          telegramId: userState?.telegramId || userInfo.id,
          username: userInfo.username,
          firstName: userInfo.firstName,
          lastName: userInfo.lastName
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
        await this.updateUserStep(userState.telegramId, BotStep.PROFESSION_SELECTION);
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
    this.log('Обробка вибору професії:', callbackData);
    
    try {
      // Витягуємо професію з callback_data
      const profession = this.extractProfession(callbackData);
      
      if (!profession) {
        await this.safeReply(ctx, MessageTemplates.getErrorMessage());
        return;
      }
      
      // Отримуємо користувача
      const userState = ctx.state.userState;
      if (!userState) {
        await this.safeReply(ctx, MessageTemplates.getErrorMessage());
        return;
      }
      
      // Оновлюємо професію
      await this.userStateService.setProfession(userState.telegramId, profession);
      this.log('Професія збережена в БД:', profession);
      
      // Відправляємо опис професії
      const description = this.getProfessionDescription(profession);
      const keyboard = KeyboardTemplates.getReadyToTryKeyboard();
      
      await this.safeReply(ctx, description, keyboard);
      
      this.log('Професія обрана успішно:', profession);
      
    } catch (error) {
      console.error('❌ OnboardingFlow: Помилка вибору професії:', error);
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
      const userState = ctx.state.userState;
      if (!userState) {
        await this.safeReply(ctx, MessageTemplates.getErrorMessage());
        return;
      }
      
      if (!userState.selectedProfession) {
        this.log('Професія не вибрана');
        await this.safeReply(ctx, MessageTemplates.getErrorMessage());
        return;
      }
      
      // Перевіряємо наявність контакту
      this.log('Перевіряємо наявність контакту...');
      const hasContact = await this.contactService.hasContact(userState.telegramId);
      this.log('hasContact =', hasContact);

      if (hasContact) {
        // Якщо контакт вже є, одразу надсилаємо завдання
        this.log('Контакт вже є, надсилаємо завдання');
        await this.safeReply(ctx, 'Надсилаю для тебе тестове завдання.');
        
        // Оновлюємо крок на TASK_DELIVERY
        await this.userStateService.updateStep(userState.telegramId, BotStep.TASK_DELIVERY);
        
        // Відправляємо завдання
        const TaskHandler = require('../handlers/TaskHandler');
        const taskHandler = new TaskHandler(this.userStateService, this.contactService, this.taskService, this.webhookService);
        await taskHandler.execute(ctx, userState);
      } else {
        // Якщо контакту немає, запитуємо його
        this.log('Контакт відсутній, запитуємо');
        
        // Оновлюємо крок користувача
        this.log('Оновлюємо крок на CONTACT_REQUEST');
        await this.userStateService.updateStep(userState.telegramId, BotStep.CONTACT_REQUEST);

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
    return {
      id: ctx.from.id,
      username: ctx.from.username,
      first_name: ctx.from.first_name,
      last_name: ctx.from.last_name
    };
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
    if (callbackData === 'profession_QA') {
      return Profession.QA;
    } else if (callbackData === 'profession_BA') {
      return Profession.BA;
    }
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
