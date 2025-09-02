import { TelegramContact } from './telegram';

// ===== ТИПИ =====

export interface ContactData {
  name: string;
  phone: string;
  email?: string;
  profession: string;
  telegram_id: number;
  contact_source: 'telegram' | 'manual';
}

export interface UserCheckResult {
  exists: boolean;
  user: {
    id: number;
    name: string;
    phone: string;
    email: string;
  } | null;
}

// ===== API ФУНКЦІЇ =====

/**
 * Перевірка існування користувача в базі даних
 */
export const checkUserInDatabase = async (telegramId: number): Promise<UserCheckResult> => {
  try {
    const response = await fetch(`/api/check-user/${telegramId}`);
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    return await response.json();
  } catch (error) {
    console.error('Помилка перевірки користувача:', error);
    throw error;
  }
};

/**
 * Збереження контактів в базу даних
 */
export const saveContactToDatabase = async (contactData: ContactData): Promise<{ success: boolean; message: string; user_id: number }> => {
  try {
    const response = await fetch('/api/test-task-request', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(contactData),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error('Помилка збереження контактів:', error);
    throw error;
  }
};

/**
 * Оновлення статусу тестового завдання
 */
export const updateTestTaskStatus = async (telegramId: number, profession: string, status: string): Promise<void> => {
  try {
    const response = await fetch('/api/update-test-task-status', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        telegram_id: telegramId,
        profession,
        status,
      }),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
  } catch (error) {
    console.error('Помилка оновлення статусу:', error);
    throw error;
  }
};

// ===== УТІЛІТИ =====

/**
 * Конвертація Telegram контактів в ContactData
 */
export const convertTelegramContactToContactData = (
  telegramContact: TelegramContact,
  profession: string,
  telegramId: number
): ContactData => {
  return {
    name: `${telegramContact.first_name}${telegramContact.last_name ? ` ${telegramContact.last_name}` : ''}`,
    phone: telegramContact.phone_number,
    email: '',
    profession,
    telegram_id: telegramId,
    contact_source: 'telegram',
  };
};

/**
 * Валідація контактних даних
 */
export const validateContactData = (contactData: ContactData): boolean => {
  return Boolean(
    contactData.name?.trim() &&
    contactData.phone?.trim() &&
    contactData.profession &&
    contactData.telegram_id
  );
};

/**
 * Завантаження тестового завдання
 */
export const downloadTestTask = (profession: string): void => {
  try {
    const pdfPath = `/src/data/test-tasks/${profession}-test-task.pdf`;
    const link = document.createElement('a');
    link.href = pdfPath;
    link.download = `${profession.toUpperCase()}-test-task.pdf`;
    
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  } catch (error) {
    console.error('Помилка завантаження тестового завдання:', error);
    throw error;
  }
};

/**
 * Надсилання повідомлення про успішне отримання тестового завдання
 */
export const sendSuccessMessage = (profession: string): void => {
  try {
    const message = `✅ Дякуємо! Ваше тестове завдання для професії ${profession.toUpperCase()} готове до завантаження.`;
    console.log('📤 Надсилаємо повідомлення:', message);
    
    // Показуємо повідомлення користувачу
    alert(message);
  } catch (error) {
    console.error('Помилка надсилання повідомлення:', error);
  }
};
