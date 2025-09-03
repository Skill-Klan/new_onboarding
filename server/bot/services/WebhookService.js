// Сервіс для відправки повідомлень в Discord через webhook
const axios = require('axios');

class WebhookService {
  constructor() {
    this.webhookUrl = 'https://discord.com/api/webhooks/1412903925694332998/XDyrZ3asQ80y_NAdv_3lErNylvFUTru2pjZyzpjAm38XLs102DQ-LnUEZXNiPtmUuPWm';
    this.colors = {
      info: 0x3498db,      // Синій - інформаційні повідомлення
      success: 0x2ecc71,   // Зелений - успішні дії
      warning: 0xf39c12,   // Помаранчевий - попередження
      danger: 0xe74c3c,    // Червоний - критичні події
      primary: 0x9b59b6    // Фіолетовий - основні події
    };
  }

  /**
   * Відправка повідомлення в Discord
   */
  async sendMessage(embed) {
    try {
      const payload = {
        embeds: [embed]
      };

      console.log('🔍🔍🔍 WebhookService.sendMessage: відправляємо в Discord:', JSON.stringify(payload, null, 2));

      const response = await axios.post(this.webhookUrl, payload, {
        headers: {
          'Content-Type': 'application/json'
        },
        timeout: 10000 // 10 секунд таймаут
      });

      console.log('✅ WebhookService.sendMessage: повідомлення відправлено в Discord, статус:', response.status);
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
   * Повідомлення про надання контактних даних
   */
  async notifyContactProvided(userData, contactData) {
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
}

module.exports = WebhookService;
