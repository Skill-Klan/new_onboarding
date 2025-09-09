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
      
      // Створюємо або оновлюємо користувача в БД
      const userState = await this.getOrCreateUser(userInfo);
      
      // Відправляємо привітальне повідомлення
      const message = BotConfig.getWelcomeMessage();
      const keyboard = BotConfig.getProfessionKeyboard();
      
      await this.safeReply(ctx, message, keyboard);
      
      // Оновлюємо крок користувача
      await this.updateUserStep(userState.telegramId, BotStep.PROFESSION_SELECTION);
      
      this.log('Команда /start оброблена успішно');
      
    } catch (error) {
      console.error('❌ OnboardingFlow: Помилка обробки /start:', error);
      await this.handleError(ctx, error);
    }
  }

  /**
   * Обробка вибору професії
   */
  async handleProfessionSelection(ctx, callbackData) {
    this.log('Обробка вибору професії:', callbackData);
    
    try {
      // Витягуємо професію з callback_data
      const profession = callbackData.replace('profession_', '');
      
      if (!Object.values(Profession).includes(profession)) {
        throw new Error(`Невідома професія: ${profession}`);
      }
      
      // Отримуємо користувача
      const userState = await this.getUserByTelegramId(ctx.from.id);
      
      // Оновлюємо професію
      await this.updateUserProfession(userState.telegramId, profession);
      
      // Відправляємо опис професії
      const description = this.getProfessionDescription(profession);
      const keyboard = BotConfig.getReadyToTryKeyboard();
      
      await this.safeReply(ctx, description, keyboard);
      
      this.log('Професія обрана успішно:', profession);
      
    } catch (error) {
      console.error('❌ OnboardingFlow: Помилка вибору професії:', error);
      await this.handleError(ctx, error);
    }
  }

  /**
   * Обробка готовності спробувати
   */
  async handleReadyToTry(ctx) {
    this.log('Обробка готовності спробувати');
    
    try {
      // Отримуємо користувача
      const userState = await this.getUserByTelegramId(ctx.from.id);
      
      if (!userState.selectedProfession) {
        await this.safeReply(ctx, BotConfig.getErrorMessage());
        return;
      }
      
      // Перевіряємо наявність контакту
      const hasContact = await this.hasUserContact(userState.telegramId);
      
      if (hasContact) {
        // Якщо контакт є, одразу переходимо до завдання
        await this.safeReply(ctx, 'Надсилаю для тебе тестове завдання.');
        await this.transitionToTaskFlow(ctx, userState);
      } else {
        // Якщо контакту немає, запитуємо його
        await this.safeReply(ctx, BotConfig.getContactRequestMessage(), BotConfig.getContactKeyboard());
        await this.updateUserStep(userState.telegramId, BotStep.CONTACT_REQUEST);
      }
      
      this.log('Готовність спробувати оброблена успішно');
      
    } catch (error) {
      console.error('❌ OnboardingFlow: Помилка готовності спробувати:', error);
      await this.handleError(ctx, error);
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
   * Отримання опису професії
   */
  getProfessionDescription(profession) {
    const descriptions = {
      [Profession.QA]: 'QA (Quality Assurance) - це тестування програмного забезпечення. Ти будеш перевіряти якість продукту, знаходити баги та забезпечувати стабільність роботи додатків.',
      [Profession.BA]: 'Business Analyst - це аналіз бізнес-процесів та вимог. Ти будеш спілкуватися з клієнтами, збирати вимоги та перекладати їх на технічні завдання для розробників.'
    };
    
    return descriptions[profession] || 'Невідома професія';
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
