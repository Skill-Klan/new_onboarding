// Сервіс для роботи з контактами

const { ContactData } = require('../types');

class ContactService {
  constructor(databaseService) {
    this.databaseService = databaseService;
  }

  /**
   * Валідація контактних даних
   */
  validateContact(contact) {
    if (!contact) {
      return { isValid: false, error: 'Контакт не надано' };
    }

    if (!contact.phone_number) {
      return { isValid: false, error: 'Номер телефону не надано' };
    }

    if (!contact.first_name) {
      return { isValid: false, error: 'Ім\'я не надано' };
    }

    // Базова валідація номера телефону
    const phoneRegex = /^\+?[1-9]\d{1,14}$/;
    if (!phoneRegex.test(contact.phone_number.replace(/\s/g, ''))) {
      return { isValid: false, error: 'Невірний формат номера телефону' };
    }

    return { isValid: true };
  }

  /**
   * Конвертація Telegram контакту в ContactData
   */
  convertTelegramContact(telegramContact) {
    return new ContactData(
      telegramContact.phone_number,
      telegramContact.first_name,
      telegramContact.last_name || null
    );
  }

  /**
   * Збереження контакту в БД
   */
  async saveContact(userId, contactData) {
    try {
      const validation = this.validateContact(contactData);
      if (!validation.isValid) {
        throw new Error(validation.error);
      }

      const contact = this.convertTelegramContact(contactData);
      
      // Зберігаємо в БД
      await this.databaseService.saveContact(userId, contact);
      
      return contact;
    } catch (error) {
      console.error('Помилка збереження контакту:', error);
      throw error;
    }
  }

  /**
   * Отримання контакту користувача
   */
  async getContactByUserId(userId) {
    try {
      return await this.databaseService.getContactByUserId(userId);
    } catch (error) {
      console.error('Помилка отримання контакту:', error);
      throw error;
    }
  }

  /**
   * Перевірка, чи є контакт у користувача
   */
  async hasContact(userId) {
    try {
      const contact = await this.getContactByUserId(userId);
      return contact !== null;
    } catch (error) {
      console.error('Помилка перевірки контакту:', error);
      return false;
    }
  }

  /**
   * Форматування номера телефону для відображення
   */
  formatPhoneNumber(phoneNumber) {
    // Прибираємо всі символи крім цифр та +
    const cleaned = phoneNumber.replace(/[^\d+]/g, '');
    
    // Додаємо + якщо його немає
    if (!cleaned.startsWith('+')) {
      return '+' + cleaned;
    }
    
    return cleaned;
  }

  /**
   * Маскування номера телефону для логів
   */
  maskPhoneNumber(phoneNumber) {
    if (!phoneNumber || phoneNumber.length < 4) {
      return '***';
    }
    
    const cleaned = phoneNumber.replace(/[^\d+]/g, '');
    const start = cleaned.substring(0, 3);
    const end = cleaned.substring(cleaned.length - 2);
    const middle = '*'.repeat(cleaned.length - 5);
    
    return start + middle + end;
  }
}

module.exports = ContactService;
