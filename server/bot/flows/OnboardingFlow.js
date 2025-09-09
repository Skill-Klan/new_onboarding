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
    // Тут має бути логіка роботи з БД
    // Поки що повертаємо заглушку
    return {
      telegramId: userInfo.id,
      username: userInfo.username,
      currentStep: BotStep.START,
      selectedProfession: null
    };
  }

  /**
   * Отримання користувача за Telegram ID
   */
  async getUserByTelegramId(telegramId) {
    // Тут має бути логіка роботи з БД
    // Поки що повертаємо заглушку
    return {
      telegramId: telegramId,
      currentStep: BotStep.PROFESSION_SELECTION,
      selectedProfession: null
    };
  }

  /**
   * Оновлення кроку користувача
   */
  async updateUserStep(telegramId, step) {
    this.log('Оновлення кроку користувача:', step);
    // Тут має бути логіка оновлення в БД
  }

  /**
   * Оновлення професії користувача
   */
  async updateUserProfession(telegramId, profession) {
    this.log('Оновлення професії користувача:', profession);
    // Тут має бути логіка оновлення в БД
  }

  /**
   * Перевірка наявності контакту
   */
  async hasUserContact(telegramId) {
    // Тут має бути логіка перевірки в БД
    // Поки що повертаємо false
    return false;
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
