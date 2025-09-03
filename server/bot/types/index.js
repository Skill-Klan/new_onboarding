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
    this.lastActivity = new Date();
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
