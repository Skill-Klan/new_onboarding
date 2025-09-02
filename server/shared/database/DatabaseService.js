// Сервіс для роботи з базою даних

const { Pool } = require('pg');
const { UserState, ContactData, TaskData } = require('../../bot/types');

class DatabaseService {
  constructor() {
    this.pool = new Pool({
      host: process.env.DB_HOST || 'localhost',
      port: process.env.DB_PORT || 5432,
      database: process.env.DB_NAME || 'skillklan',
      user: process.env.DB_USER || 'postgres',
      password: process.env.DB_PASSWORD || 'password',
    });
  }

  /**
   * Отримання користувача за Telegram ID
   */
  async getUserByTelegramId(telegramId) {
    try {
      const query = `
        SELECT * FROM users 
        WHERE telegram_id = $1
      `;
      const result = await this.pool.query(query, [telegramId]);
      return result.rows[0] || null;
    } catch (error) {
      console.error('Помилка отримання користувача:', error);
      return null; // Не кидаємо помилку
    }
  }

  /**
   * Отримання стану користувача за Telegram ID
   */
  async getUserState(telegramId) {
    try {
      const query = `
        SELECT u.*, us.current_step, us.data, us.updated_at as state_updated_at
        FROM users u
        LEFT JOIN user_states us ON u.id = us.user_id
        WHERE u.telegram_id = $1
      `;
      const result = await this.pool.query(query, [telegramId]);
      return result.rows[0] || null;
    } catch (error) {
      console.error('Помилка отримання стану користувача:', error);
      return null; // Не кидаємо помилку
    }
  }

  /**
   * Збереження стану користувача
   */
  async saveUserState(userState) {
    try {
      // Спочатку створюємо/оновлюємо користувача в таблиці users
      const userQuery = `
        INSERT INTO users (
          telegram_id, username, name, created_at, updated_at
        ) VALUES ($1, $2, $3, $4, $5)
        ON CONFLICT (telegram_id) 
        DO UPDATE SET
          username = EXCLUDED.username,
          name = EXCLUDED.name,
          updated_at = EXCLUDED.updated_at
        RETURNING id
      `;
      
      const userValues = [
        userState.telegramId,
        userState.username,
        userState.username, // name = username
        new Date(),
        new Date()
      ];

      const userResult = await this.pool.query(userQuery, userValues);
      const userId = userResult.rows[0].id;

      // Тепер зберігаємо стан в таблиці user_states
      const stateQuery = `
        INSERT INTO user_states (
          user_id, current_step, data, created_at, updated_at
        ) VALUES ($1, $2, $3, $4, $5)
        ON CONFLICT (user_id) 
        DO UPDATE SET
          current_step = EXCLUDED.current_step,
          data = EXCLUDED.data,
          updated_at = EXCLUDED.updated_at
        RETURNING *
      `;
      
      const stateValues = [
        userId,
        userState.currentStep,
        JSON.stringify({
          selectedProfession: userState.selectedProfession,
          contactData: userState.contactData,
          taskSent: userState.taskSent
        }),
        new Date(),
        new Date()
      ];

      const stateResult = await this.pool.query(stateQuery, stateValues);
      return { ...stateResult.rows[0], userId };
    } catch (error) {
      console.error('Помилка збереження стану користувача:', error);
      // Не кидаємо помилку, щоб бот продовжував працювати
      return null;
    }
  }

  /**
   * Збереження контакту
   */
  async saveContact(userId, contactData) {
    try {
      const query = `
        INSERT INTO bot_contacts (
          user_id, phone_number, first_name, last_name, created_at, updated_at
        ) VALUES ($1, $2, $3, $4, $5, $6)
        ON CONFLICT (user_id) 
        DO UPDATE SET
          phone_number = EXCLUDED.phone_number,
          first_name = EXCLUDED.first_name,
          last_name = EXCLUDED.last_name,
          updated_at = EXCLUDED.updated_at
        RETURNING *
      `;
      
      const values = [
        userId,
        contactData.phoneNumber,
        contactData.firstName,
        contactData.lastName,
        new Date(),
        new Date()
      ];

      const result = await this.pool.query(query, values);
      return result.rows[0];
    } catch (error) {
      console.error('Помилка збереження контакту:', error);
      return null; // Не кидаємо помилку
    }
  }

  /**
   * Отримання контакту за ID користувача
   */
  async getContactByUserId(userId) {
    try {
      const query = `
        SELECT * FROM bot_contacts 
        WHERE user_id = $1
      `;
      const result = await this.pool.query(query, [userId]);
      return result.rows[0] || null;
    } catch (error) {
      console.error('Помилка отримання контакту:', error);
      return null; // Не кидаємо помилку
    }
  }

  /**
   * Збереження інформації про доставку завдання
   */
  async saveTaskDelivery(userId, taskData) {
    try {
      const query = `
        INSERT INTO bot_task_deliveries (
          user_id, profession, task_title, task_description, 
          task_content, delivered_at, created_at, updated_at
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
        RETURNING *
      `;
      
      const values = [
        userId,
        taskData.profession,
        taskData.title,
        taskData.description,
        taskData.content,
        new Date(),
        new Date(),
        new Date()
      ];

      const result = await this.pool.query(query, values);
      return result.rows[0];
    } catch (error) {
      console.error('Помилка збереження доставки завдання:', error);
      return null; // Не кидаємо помилку
    }
  }

  /**
   * Отримання статистики завдань
   */
  async getTaskStatistics() {
    try {
      const query = `
        SELECT 
          profession,
          COUNT(*) as total_deliveries,
          COUNT(DISTINCT user_id) as unique_users,
          DATE(delivered_at) as delivery_date
        FROM bot_task_deliveries 
        GROUP BY profession, DATE(delivered_at)
        ORDER BY delivery_date DESC
      `;
      
      const result = await this.pool.query(query);
      return result.rows;
    } catch (error) {
      console.error('Помилка отримання статистики:', error);
      return []; // Повертаємо пустий масив замість кидання помилки
    }
  }

  /**
   * Очищення застарілих станів
   */
  async cleanupOldStates(cutoffTime) {
    try {
      const query = `
        DELETE FROM user_states 
        WHERE updated_at < $1 
        AND current_step != 'completed'
      `;
      
      const result = await this.pool.query(query, [cutoffTime]);
      return result.rowCount;
    } catch (error) {
      console.error('Помилка очищення застарілих станів:', error);
      return 0; // Повертаємо 0 замість кидання помилки
    }
  }

  /**
   * Тест з'єднання з БД
   */
  async testConnection() {
    try {
      const result = await this.pool.query('SELECT NOW()');
      console.log('✅ З\'єднання з БД успішне:', result.rows[0].now);
      return true;
    } catch (error) {
      console.error('❌ Помилка з\'єднання з БД:', error);
      return false;
    }
  }

  /**
   * Закриття з'єднання з БД
   */
  async close() {
    try {
      await this.pool.end();
      console.log('✅ З\'єднання з БД закрито');
    } catch (error) {
      console.error('❌ Помилка закриття з\'єднання з БД:', error);
    }
  }
}

module.exports = DatabaseService;
