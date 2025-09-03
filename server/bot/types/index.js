// Типи для стану користувача та бота

/**
 * Кроки в флоу бота
 */
const BotStep = {
  START: 'start',
  PROFESSION_SELECTION: 'profession_selection',
  CONTACT_REQUEST: 'contact_request',
  TASK_DELIVERY: 'task_delivery',
  COMPLETED: 'completed'
};

/**
 * Доступні професії
 */
const Profession = {
  QA: 'QA',
  BA: 'BA'
};

/**
 * Стан користувача в боті
 */
class UserState {
  constructor(userId, telegramId, username = null) {
    this.userId = userId;
    this.telegramId = telegramId;
    this.username = username;
    this.currentStep = BotStep.START;
    this.selectedProfession = null;
    this.contactData = null;
    this.taskSent = false;
    this.taskSentAt = null; // Коли було відправлено завдання
    this.taskDeadline = null; // Дедлайн завдання (9 робочих днів)
    this.remindersSent = []; // Які нагадування вже відправлені
    this.lastActivity = new Date();
    this.createdAt = new Date();
  }

  updateStep(step) {
    this.currentStep = step;
    this.lastActivity = new Date();
  }

  selectProfession(profession) {
    this.selectedProfession = profession;
    this.lastActivity = new Date();
  }

  setContactData(contactData) {
    this.contactData = contactData;
    this.lastActivity = new Date();
  }

  markTaskSent() {
    this.taskSent = true;
    this.taskSentAt = new Date();
    this.taskDeadline = this.calculateDeadline();
    this.lastActivity = new Date();
  }

  calculateDeadline() {
    const sentDate = new Date(this.taskSentAt);
    let deadline = new Date(sentDate);
    let workingDays = 0;
    
    // Додаємо 9 робочих днів (без вихідних)
    while (workingDays < 9) {
      deadline.setDate(deadline.getDate() + 1);
      const dayOfWeek = deadline.getDay();
      // Пропускаємо суботу (6) та неділю (0)
      if (dayOfWeek !== 0 && dayOfWeek !== 6) {
        workingDays++;
      }
    }
    
    return deadline;
  }

  toJSON() {
    return {
      userId: this.userId,
      telegramId: this.telegramId,
      username: this.username,
      currentStep: this.currentStep,
      selectedProfession: this.selectedProfession,
      contactData: this.contactData,
      taskSent: this.taskSent,
      taskSentAt: this.taskSentAt,
      taskDeadline: this.taskDeadline,
      remindersSent: this.remindersSent,
      lastActivity: this.lastActivity,
      createdAt: this.createdAt
    };
  }

  static fromJSON(data) {
    const state = new UserState(data.id, data.telegram_id, data.username);
    state.currentStep = data.current_step || BotStep.START;
    state.selectedProfession = data.selected_profession;
    
    // contact_data може бути як об'єктом, так і JSON рядком
    if (data.contact_data) {
      if (typeof data.contact_data === 'string') {
        state.contactData = JSON.parse(data.contact_data);
      } else {
        state.contactData = data.contact_data;
      }
    } else {
      state.contactData = null;
    }
    
    state.taskSent = data.task_sent || false;
    state.taskSentAt = data.task_sent_at ? new Date(data.task_sent_at) : null;
    state.taskDeadline = data.task_deadline ? new Date(data.task_deadline) : null;
    // Безпечний парсинг reminders_sent
    if (data.reminders_sent) {
      if (typeof data.reminders_sent === 'string') {
        try {
          state.remindersSent = JSON.parse(data.reminders_sent);
        } catch (error) {
          console.error('🔍🔍🔍 UserState.fromJSON: помилка парсингу reminders_sent:', error);
          state.remindersSent = [];
        }
      } else {
        state.remindersSent = data.reminders_sent;
      }
    } else {
      state.remindersSent = [];
    }
    state.lastActivity = new Date(data.last_activity);
    state.createdAt = new Date(data.created_at);
    return state;
  }
}

/**
 * Дані контакту
 */
class ContactData {
  constructor(phoneNumber, firstName, lastName = null) {
    this.phoneNumber = phoneNumber;
    this.firstName = firstName;
    this.lastName = lastName;
    this.createdAt = new Date();
  }

  toJSON() {
    return {
      phoneNumber: this.phoneNumber,
      firstName: this.firstName,
      lastName: this.lastName,
      createdAt: this.createdAt
    };
  }

  static fromJSON(data) {
    const contact = new ContactData(data.phoneNumber, data.firstName, data.lastName);
    contact.createdAt = new Date(data.createdAt);
    return contact;
  }
}

/**
 * Дані завдання
 */
class TaskData {
  constructor(profession, title, description, content) {
    this.profession = profession;
    this.title = title;
    this.description = description;
    this.content = content;
    this.createdAt = new Date();
  }

  toJSON() {
    return {
      profession: this.profession,
      title: this.title,
      description: this.description,
      content: this.content,
      createdAt: this.createdAt
    };
  }
}

module.exports = {
  BotStep,
  Profession,
  UserState,
  ContactData,
  TaskData
};
