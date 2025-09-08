// Сервіс для відправки повідомлень в Discord через webhook
const axios = require('axios');
const webhookConfig = require('../../config/webhook.config');

class WebhookService {
  constructor() {
    this.config = webhookConfig;
    this.webhookUrl = this.config.webhookUrl;
    this.colors = this.config.colors;
    this.enabled = this.config.enabled;
    this.timeout = this.config.timeout;
    this.notifications = this.config.notifications;
    this.logging = this.config.logging;
    
    // Логування початкової конфігурації
    if (this.logging.enabled) {
      console.log('🔧 WebhookService: Конфігурація завантажена');
      console.log(`🔧 WebhookService: Webhook ${this.enabled ? 'увімкнено' : 'вимкнено'}`);
      console.log(`🔧 WebhookService: URL: ${this.webhookUrl ? 'встановлено' : 'не встановлено'}`);
    }
  }

  /**
   * Відправка повідомлення в Discord
   */
  async sendMessage(embed) {
    // Перевіряємо, чи увімкнено webhook
    if (!this.enabled) {
      if (this.logging.enabled && this.logging.logLevel === 'debug') {
        console.log('🔧 WebhookService.sendMessage: Webhook вимкнено, повідомлення не відправляється');
      }
      return true; // Повертаємо true, щоб не впливати на роботу бота
    }

    // Перевіряємо наявність URL
    if (!this.webhookUrl) {
      console.warn('⚠️ WebhookService.sendMessage: Webhook URL не встановлено');
      return false;
    }

    try {
      const payload = {
        embeds: [embed]
      };

      if (this.logging.enabled && this.logging.logLevel === 'debug') {
        console.log('🔍 WebhookService.sendMessage: відправляємо в Discord:', JSON.stringify(payload, null, 2));
      }

      const response = await axios.post(this.webhookUrl, payload, {
        headers: {
          'Content-Type': 'application/json'
        },
        timeout: this.timeout
      });

      if (this.logging.enabled) {
        console.log('✅ WebhookService.sendMessage: повідомлення відправлено в Discord, статус:', response.status);
      }
      return true;
    } catch (error) {
      console.error('❌ WebhookService.sendMessage: помилка відправки в Discord:', error.message);
      if (error.response) {
        console.error('❌ WebhookService.sendMessage: статус відповіді:', error.response.status);
        console.error('❌ WebhookService.sendMessage: дані відповіді:', error.response.data);
      }
      return false;
    }
  }

  /**
   * Повідомлення про початок взаємодії з ботом
   */
  async notifyUserStarted(userData) {
    // Перевіряємо, чи увімкнено це повідомлення
    if (!this.notifications.userStarted) {
      if (this.logging.enabled && this.logging.logLevel === 'debug') {
        console.log('🔧 WebhookService.notifyUserStarted: Повідомлення про початок взаємодії вимкнено');
      }
      return true;
    }

    const embed = {
      title: '🚀 Новий користувач почав взаємодію з ботом',
      color: this.colors.info,
      fields: [
        {
          name: '👤 Користувач',
          value: `**Ім'я:** ${userData.firstName || 'Не вказано'}\n**Username:** @${userData.username || 'Не вказано'}\n**Telegram ID:** \`${userData.telegramId}\``,
          inline: true
        },
        {
          name: '⏰ Час',
          value: `<t:${Math.floor(Date.now() / 1000)}:F>`,
          inline: true
        }
      ],
      footer: {
        text: 'SkillKlan Onboarding Bot'
      },
      timestamp: new Date().toISOString()
    };

    return await this.sendMessage(embed);
  }

  /**
   * Повідомлення про готовність користувача спробувати
   */
  async notifyUserReady(userData) {
    // Перевіряємо, чи увімкнено це повідомлення
    if (!this.notifications.userReady) {
      if (this.logging.enabled && this.logging.logLevel === 'debug') {
        console.log('🔧 WebhookService.notifyUserReady: Повідомлення про готовність вимкнено');
      }
      return true;
    }

    const embed = {
      title: '🚀 Користувач готовий спробувати',
      color: this.colors.info,
      fields: [
        {
          name: '👤 Користувач',
          value: `**Ім'я:** ${userData.firstName || 'Не вказано'}\n**Username:** @${userData.username || 'Не вказано'}\n**Telegram ID:** \`${userData.telegramId}\``,
          inline: true
        },
        {
          name: '🎯 Напрямок',
          value: `**Професія:** ${userData.selectedProfession === 'QA' ? 'QA Engineer' : 'Business Analyst'}`,
          inline: true
        },
        {
          name: '⏰ Час',
          value: `<t:${Math.floor(Date.now() / 1000)}:F>`,
          inline: true
        }
      ],
      footer: {
        text: 'SkillKlan Onboarding Bot'
      },
      timestamp: new Date().toISOString()
    };

    return await this.sendMessage(embed);
  }

  /**
   * Повідомлення про надання контактних даних
   */
  async notifyContactProvided(userData, contactData) {
    // Перевіряємо, чи увімкнено це повідомлення
    if (!this.notifications.contactProvided) {
      if (this.logging.enabled && this.logging.logLevel === 'debug') {
        console.log('🔧 WebhookService.notifyContactProvided: Повідомлення про контакти вимкнено');
      }
      return true;
    }

    const embed = {
      title: '📞 Користувач надав контактні дані',
      color: this.colors.success,
      fields: [
        {
          name: '👤 Користувач',
          value: `**Ім'я:** ${contactData.firstName || 'Не вказано'}\n**Username:** @${userData.username || 'Не вказано'}\n**Telegram ID:** \`${userData.telegramId}\``,
          inline: true
        },
        {
          name: '📱 Контакт',
          value: `**Телефон:** \`${contactData.phoneNumber}\`\n**Прізвище:** ${contactData.lastName || 'Не вказано'}`,
          inline: true
        },
        {
          name: '🎯 Напрямок',
          value: `**Професія:** ${userData.selectedProfession === 'QA' ? 'QA Engineer' : 'Business Analyst'}`,
          inline: true
        }
      ],
      footer: {
        text: 'SkillKlan Onboarding Bot'
      },
      timestamp: new Date().toISOString()
    };

    return await this.sendMessage(embed);
  }

  /**
   * Повідомлення про відправку тестового завдання
   */
  async notifyTaskSent(userData, taskData) {
    // Перевіряємо, чи увімкнено це повідомлення
    if (!this.notifications.taskSent) {
      if (this.logging.enabled && this.logging.logLevel === 'debug') {
        console.log('🔧 WebhookService.notifyTaskSent: Повідомлення про відправку завдання вимкнено');
      }
      return true;
    }

    const professionName = userData.selectedProfession === 'QA' ? 'QA Engineer' : 'Business Analyst';
    const deadline = new Date(userData.taskDeadline);
    const deadlineTimestamp = Math.floor(deadline.getTime() / 1000);

    const embed = {
      title: '📋 Тестове завдання відправлено',
      color: this.colors.primary,
      fields: [
        {
          name: '👤 Користувач',
          value: `**Ім'я:** ${userData.contactData?.firstName || 'Не вказано'}\n**Username:** @${userData.username || 'Не вказано'}\n**Telegram ID:** \`${userData.telegramId}\``,
          inline: true
        },
        {
          name: '🎯 Завдання',
          value: `**Напрямок:** ${professionName}\n**Відправлено:** <t:${Math.floor(Date.now() / 1000)}:R>`,
          inline: true
        },
        {
          name: '⏰ Дедлайн',
          value: `**Кінець:** <t:${deadlineTimestamp}:F>\n**Залишилось:** <t:${deadlineTimestamp}:R>`,
          inline: true
        }
      ],
      footer: {
        text: 'SkillKlan Onboarding Bot'
      },
      timestamp: new Date().toISOString()
    };

    return await this.sendMessage(embed);
  }

  /**
   * Повідомлення про залишок 1 дня до дедлайну
   */
  async notifyDeadlineWarning(userData) {
    // Перевіряємо, чи увімкнено це повідомлення
    if (!this.notifications.deadlineWarning) {
      if (this.logging.enabled && this.logging.logLevel === 'debug') {
        console.log('🔧 WebhookService.notifyDeadlineWarning: Повідомлення про попередження дедлайну вимкнено');
      }
      return true;
    }

    const professionName = userData.selectedProfession === 'QA' ? 'QA Engineer' : 'Business Analyst';
    const deadline = new Date(userData.taskDeadline);
    const deadlineTimestamp = Math.floor(deadline.getTime() / 1000);

    const embed = {
      title: '⚠️ Залишився 1 день до дедлайну!',
      color: this.colors.warning,
      fields: [
        {
          name: '👤 Користувач',
          value: `**Ім'я:** ${userData.contactData?.firstName || 'Не вказано'}\n**Username:** @${userData.username || 'Не вказано'}\n**Telegram ID:** \`${userData.telegramId}\``,
          inline: true
        },
        {
          name: '🎯 Завдання',
          value: `**Напрямок:** ${professionName}\n**Телефон:** \`${userData.contactData?.phoneNumber || 'Не вказано'}\``,
          inline: true
        },
        {
          name: '⏰ Дедлайн',
          value: `**Кінець:** <t:${deadlineTimestamp}:F>\n**Залишилось:** <t:${deadlineTimestamp}:R>`,
          inline: true
        }
      ],
      footer: {
        text: 'SkillKlan Onboarding Bot • Рекомендується зв\'язатися з кандидатом'
      },
      timestamp: new Date().toISOString()
    };

    return await this.sendMessage(embed);
  }

  /**
   * Повідомлення про останній день дедлайну
   */
  async notifyDeadlineToday(userData) {
    // Перевіряємо, чи увімкнено це повідомлення
    if (!this.notifications.deadlineToday) {
      if (this.logging.enabled && this.logging.logLevel === 'debug') {
        console.log('🔧 WebhookService.notifyDeadlineToday: Повідомлення про останній день дедлайну вимкнено');
      }
      return true;
    }

    const professionName = userData.selectedProfession === 'QA' ? 'QA Engineer' : 'Business Analyst';
    const deadline = new Date(userData.taskDeadline);
    const deadlineTimestamp = Math.floor(deadline.getTime() / 1000);

    const embed = {
      title: '🚨 СЬОГОДНІ ОСТАННІЙ ДЕНЬ ДЕДЛАЙНУ!',
      color: this.colors.danger,
      fields: [
        {
          name: '👤 Користувач',
          value: `**Ім'я:** ${userData.contactData?.firstName || 'Не вказано'}\n**Username:** @${userData.username || 'Не вказано'}\n**Telegram ID:** \`${userData.telegramId}\``,
          inline: true
        },
        {
          name: '🎯 Завдання',
          value: `**Напрямок:** ${professionName}\n**Телефон:** \`${userData.contactData?.phoneNumber || 'Не вказано'}\``,
          inline: true
        },
        {
          name: '⏰ Дедлайн',
          value: `**Кінець:** <t:${deadlineTimestamp}:F>\n**Залишилось:** <t:${deadlineTimestamp}:R>`,
          inline: true
        }
      ],
      footer: {
        text: 'SkillKlan Onboarding Bot • НЕГАЙНО зв\'яжіться з кандидатом!'
      },
      timestamp: new Date().toISOString()
    };

    return await this.sendMessage(embed);
  }

  /**
   * Повідомлення про завершення завдання користувачем
   */
  async notifyTaskCompleted(userData) {
    // Перевіряємо, чи увімкнено це повідомлення
    if (!this.notifications.taskCompleted) {
      if (this.logging.enabled && this.logging.logLevel === 'debug') {
        console.log('🔧 WebhookService.notifyTaskCompleted: Повідомлення про завершення завдання вимкнено');
      }
      return true;
    }

    const professionName = userData.selectedProfession === 'QA' ? 'QA Engineer' : 'Business Analyst';
    
    // Розраховуємо час виконання
    const completionTime = new Date();
    const taskSentTime = userData.taskSentAt ? new Date(userData.taskSentAt) : null;
    
    let executionTimeText = 'Не вказано';
    if (taskSentTime) {
      const timeDiffMs = completionTime.getTime() - taskSentTime.getTime();
      const timeDiffHours = Math.floor(timeDiffMs / (1000 * 60 * 60));
      const timeDiffDays = Math.floor(timeDiffHours / 24);
      
      if (timeDiffDays > 0) {
        executionTimeText = `${timeDiffDays} дн. ${timeDiffHours % 24} год.`;
      } else if (timeDiffHours > 0) {
        executionTimeText = `${timeDiffHours} год.`;
      } else {
        const timeDiffMinutes = Math.floor(timeDiffMs / (1000 * 60));
        executionTimeText = `${timeDiffMinutes} хв.`;
      }
    }

    const embed = {
      title: '✅ Користувач завершив тестове завдання',
      color: this.colors.success,
      fields: [
        {
          name: '👤 Користувач',
          value: `**Ім'я:** ${userData.contactData?.firstName || 'Не вказано'}\n**Username:** @${userData.username || 'Не вказано'}\n**Telegram ID:** \`${userData.telegramId}\``,
          inline: true
        },
        {
          name: '🎯 Завдання',
          value: `**Напрямок:** ${professionName}\n**Телефон:** \`${userData.contactData?.phoneNumber || 'Не вказано'}\``,
          inline: true
        },
        {
          name: '⏰ Час виконання',
          value: `**Завершено:** <t:${Math.floor(completionTime.getTime() / 1000)}:F>\n**Виконано за:** ${executionTimeText}`,
          inline: true
        }
      ],
      footer: {
        text: 'SkillKlan Onboarding Bot • Готово до перевірки'
      },
      timestamp: new Date().toISOString()
    };

    return await this.sendMessage(embed);
  }

  /**
   * Оновлення конфігурації webhook
   */
  updateConfig(newConfig) {
    this.config = { ...this.config, ...newConfig };
    this.enabled = this.config.enabled;
    this.webhookUrl = this.config.webhookUrl;
    this.timeout = this.config.timeout;
    this.notifications = this.config.notifications;
    this.logging = this.config.logging;
    
    if (this.logging.enabled) {
      console.log('🔧 WebhookService: Конфігурація оновлена');
      console.log(`🔧 WebhookService: Webhook ${this.enabled ? 'увімкнено' : 'вимкнено'}`);
    }
  }

  /**
   * Увімкнення/вимкнення webhook
   */
  setEnabled(enabled) {
    this.enabled = enabled;
    if (this.logging.enabled) {
      console.log(`🔧 WebhookService: Webhook ${enabled ? 'увімкнено' : 'вимкнено'}`);
    }
  }

  /**
   * Увімкнення/вимкнення конкретного типу повідомлень
   */
  setNotificationEnabled(type, enabled) {
    if (this.notifications.hasOwnProperty(type)) {
      this.notifications[type] = enabled;
      if (this.logging.enabled) {
        console.log(`🔧 WebhookService: Повідомлення ${type} ${enabled ? 'увімкнено' : 'вимкнено'}`);
      }
    } else {
      console.warn(`⚠️ WebhookService: Невідомий тип повідомлення: ${type}`);
    }
  }

  /**
   * Отримання поточного статусу webhook
   */
  getStatus() {
    return {
      enabled: this.enabled,
      webhookUrl: this.webhookUrl ? 'встановлено' : 'не встановлено',
      notifications: this.notifications,
      logging: this.logging
    };
  }
}

module.exports = WebhookService;
