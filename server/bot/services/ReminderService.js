// Сервіс для відправки нагадувань про тестові завдання

class ReminderService {
  constructor(databaseService, bot, webhookService = null) {
    this.databaseService = databaseService;
    this.bot = bot;
    this.webhookService = webhookService;
    this.reminderTypes = {
      DAY_3: 'day_3',
      DAY_7: 'day_7', 
      DAY_9: 'day_9'
    };
  }

  /**
   * Відправити нагадування користувачу
   */
  async sendReminder(telegramId, reminderType) {
    try {
      const message = this.getReminderMessage(reminderType);
      await this.bot.telegram.sendMessage(telegramId, message);
      
      console.log(`🔍🔍🔍 ReminderService: відправлено нагадування ${reminderType} користувачу ${telegramId}`);
      
      // Відправляємо webhook для менеджерів
      if (this.webhookService) {
        try {
          const userData = await this.databaseService.getUserByTelegramId(telegramId);
          if (userData) {
            const userState = await this.databaseService.getUserState(telegramId);
            if (userState) {
              if (reminderType === this.reminderTypes.DAY_9) {
                // Останній день - критичне повідомлення
                await this.webhookService.notifyDeadlineToday(userState);
              } else if (reminderType === this.reminderTypes.DAY_7) {
                // 7-й день - попередження
                await this.webhookService.notifyDeadlineWarning(userState);
              }
              console.log(`✅ ReminderService: Webhook для ${reminderType} відправлено`);
            }
          }
        } catch (webhookError) {
          console.error(`❌ ReminderService: Помилка відправки webhook для ${reminderType}:`, webhookError);
        }
      }
      
      return true;
    } catch (error) {
      console.error(`🔍🔍🔍 ReminderService: помилка відправки нагадування ${reminderType} користувачу ${telegramId}:`, error);
      return false;
    }
  }

  /**
   * Отримати текст нагадування
   */
  getReminderMessage(reminderType) {
    const messages = {
      [this.reminderTypes.DAY_3]: `Привіт! 👋

Сподіваюся, у тебе все йде по плану з тестовим завданням! 

Якщо виникли питання, на які ти не можеш рухатися далі, то обов'язково напиши нашому адміністратору — він допоможе! 

📞 @num1221

Ти молодець, що взявся за завдання! 💪`,
      
      [this.reminderTypes.DAY_7]: `Привіт! 👋

Сьогодні вже 7-й день з моменту отримання тестового завдання. 

Якщо у тебе є питання або потрібна допомога, не соромся звертатися до нашого адміністратора:

📞 @num1221

Ти впораєшся! Ми в тебе віримо! 🚀`,
      
      [this.reminderTypes.DAY_9]: `Привіт! 👋

Сьогодні останній день для здачі тестового завдання! 

Чекаємо на тебе! Якщо щось не встигаєш або є питання — швидко пиши адміністратору:

📞 @num1221

Ти майже на фініші! 💪`
    };

    return messages[reminderType] || 'Нагадування про тестове завдання';
  }

  /**
   * Перевірити, чи потрібно відправити нагадування
   */
  shouldSendReminder(userState, reminderType) {
    if (!userState.taskSent || !userState.taskSentAt) {
      return false;
    }

    const sentDate = new Date(userState.taskSentAt);
    const today = new Date();
    const daysPassed = this.getWorkingDaysPassed(sentDate, today);

    // Перевіряємо, чи вже відправляли це нагадування
    if (userState.remindersSent.includes(reminderType)) {
      return false;
    }

    // Перевіряємо, чи настав час для нагадування
    switch (reminderType) {
      case this.reminderTypes.DAY_3:
        return daysPassed >= 3;
      case this.reminderTypes.DAY_7:
        return daysPassed >= 7;
      case this.reminderTypes.DAY_9:
        return daysPassed >= 9;
      default:
        return false;
    }
  }

  /**
   * Підрахувати кількість робочих днів між датами
   */
  getWorkingDaysPassed(startDate, endDate) {
    let count = 0;
    const current = new Date(startDate);
    
    while (current <= endDate) {
      const dayOfWeek = current.getDay();
      // Пропускаємо суботу (6) та неділю (0)
      if (dayOfWeek !== 0 && dayOfWeek !== 6) {
        count++;
      }
      current.setDate(current.getDate() + 1);
    }
    
    return count - 1; // Віднімаємо 1, бо початок не рахується
  }

  /**
   * Позначити нагадування як відправлене
   */
  async markReminderSent(telegramId, reminderType) {
    try {
      const userState = await this.databaseService.getUserByTelegramId(telegramId);
      if (!userState) {
        console.error(`🔍🔍🔍 ReminderService: користувач ${telegramId} не знайдений`);
        return false;
      }

      if (!userState.remindersSent.includes(reminderType)) {
        userState.remindersSent.push(reminderType);
        await this.databaseService.saveUserState(userState);
        console.log(`🔍🔍🔍 ReminderService: позначено нагадування ${reminderType} як відправлене для користувача ${telegramId}`);
      }

      return true;
    } catch (error) {
      console.error(`🔍🔍🔍 ReminderService: помилка позначення нагадування ${reminderType} для користувача ${telegramId}:`, error);
      return false;
    }
  }

  /**
   * Перевірити всіх користувачів та відправити нагадування
   */
  async checkAndSendReminders() {
    try {
      console.log('🔍🔍🔍 ReminderService: початок перевірки нагадувань');
      
      // Отримуємо всіх користувачів, яким відправлено завдання
      const users = await this.databaseService.getUsersWithTasks();
      
      for (const user of users) {
        const userState = await this.databaseService.getUserByTelegramId(user.telegram_id);
        if (!userState) continue;

        // Перевіряємо кожен тип нагадування
        for (const reminderType of Object.values(this.reminderTypes)) {
          if (this.shouldSendReminder(userState, reminderType)) {
            const sent = await this.sendReminder(user.telegram_id, reminderType);
            if (sent) {
              await this.markReminderSent(user.telegram_id, reminderType);
            }
          }
        }
      }
      
      console.log('🔍🔍🔍 ReminderService: завершено перевірку нагадувань');
    } catch (error) {
      console.error('🔍🔍🔍 ReminderService: помилка перевірки нагадувань:', error);
    }
  }

  /**
   * Запустити cron job для перевірки нагадувань
   */
  startReminderCron() {
    // Перевіряємо кожен день о 12:00 за київським часом
    const cron = require('node-cron');
    
    // 12:00 за київським часом (UTC+2 або UTC+3 залежно від літнього часу)
    // Використовуємо 10:00 UTC для літнього часу (UTC+3) та 11:00 UTC для зимового (UTC+2)
    const cronExpression = '0 10 * * 1-5'; // Пн-Пт о 10:00 UTC (12:00 за київським часом)
    
    cron.schedule(cronExpression, () => {
      console.log('🔍🔍🔍 ReminderService: запуск cron job для нагадувань');
      this.checkAndSendReminders();
    });
    
    console.log('🔍🔍🔍 ReminderService: cron job для нагадувань запущено');
  }
}

module.exports = ReminderService;
