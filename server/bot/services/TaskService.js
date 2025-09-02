// Сервіс для роботи з завданнями

const { TaskData, Profession } = require('../types');

class TaskService {
  constructor(databaseService) {
    this.databaseService = databaseService;
    this.taskTemplates = this.initializeTaskTemplates();
  }

  /**
   * Ініціалізація шаблонів завдань
   */
  initializeTaskTemplates() {
    return {
      [Profession.QA]: {
        title: 'Тестове завдання QA Engineer',
        description: 'Практичне завдання для перевірки навичок тестування',
        content: `# Тестове завдання QA Engineer

## Завдання 1: Тестування веб-додатку

Протестуйте наступний веб-сайт: https://example.com

### Що потрібно зробити:

1. **Функціональне тестування**
   - Перевірте всі основні функції сайту
   - Знайдіть та опишіть знайдені баги
   - Протестуйте різні сценарії використання

2. **Тестування інтерфейсу**
   - Перевірте відображення на різних пристроях
   - Протестуйте навігацію
   - Перевірте доступність

3. **Документування**
   - Створіть звіт про тестування
   - Опишіть знайдені проблеми
   - Запропонуйте покращення

### Формат звіту:
- Назва бага
- Кроки для відтворення
- Очікуваний результат
- Фактичний результат
- Пріоритет

**Термін виконання:** 3 дні
**Формат здачі:** Текстовий звіт або скріншоти`

      },
      [Profession.BA]: {
        title: 'Тестове завдання Business Analyst',
        description: 'Практичне завдання для перевірки аналітичних навичок',
        content: `# Тестове завдання Business Analyst

## Завдання: Аналіз бізнес-процесу

Проаналізуйте процес онлайн-замовлення в ресторані.

### Що потрібно зробити:

1. **Аналіз поточного процесу**
   - Опишіть покроково процес замовлення
   - Визначте учасників процесу
   - Знайдіть проблемні місця

2. **Збір вимог**
   - Визначіть функціональні вимоги
   - Визначіть нефункціональні вимоги
   - Пріоритизуйте вимоги

3. **Пропозиції покращень**
   - Запропонуйте оптимізацію процесу
   - Опишіть новий процес
   - Оцініть ефективність

### Формат звіту:
- Діаграма поточного процесу
- Список вимог з пріоритетами
- Діаграма нового процесу
- Обґрунтування змін

**Термін виконання:** 3 дні
**Формат здачі:** Документ з діаграмами`
      }
    };
  }

  /**
   * Генерація завдання для професії
   */
  generateTask(profession) {
    const template = this.taskTemplates[profession];
    if (!template) {
      throw new Error(`Невідома професія: ${profession}`);
    }

    return new TaskData(
      profession,
      template.title,
      template.description,
      template.content
    );
  }

  /**
   * Відправка завдання користувачу
   */
  async sendTask(ctx, taskData) {
    try {
      // Відправляємо заголовок
      await ctx.reply(`📄 **${taskData.title}**\n\n${taskData.description}`);

      // Відправляємо контент завдання
      await ctx.reply(taskData.content, { parse_mode: 'Markdown' });

      // Відправляємо повідомлення про завершення
      const { MessageTemplates } = require('../templates/messages');
      await ctx.reply(MessageTemplates.getTaskDeliveryMessage());

      // Додаємо кнопку для здачі завдання
      const { KeyboardTemplates } = require('../templates/keyboards');
      await ctx.reply('Готові здати завдання?', KeyboardTemplates.getTaskCompletionKeyboard());

      return true;
    } catch (error) {
      console.error('Помилка відправки завдання:', error);
      throw error;
    }
  }

  /**
   * Збереження інформації про відправлене завдання
   */
  async trackTaskDelivery(userId, taskData) {
    try {
      await this.databaseService.saveTaskDelivery(userId, taskData);
    } catch (error) {
      console.error('Помилка збереження інформації про завдання:', error);
      throw error;
    }
  }

  /**
   * Отримання статистики завдань
   */
  async getTaskStatistics() {
    try {
      return await this.databaseService.getTaskStatistics();
    } catch (error) {
      console.error('Помилка отримання статистики завдань:', error);
      throw error;
    }
  }

  /**
   * Оновлення шаблону завдання
   */
  updateTaskTemplate(profession, newTemplate) {
    if (!this.taskTemplates[profession]) {
      throw new Error(`Невідома професія: ${profession}`);
    }

    this.taskTemplates[profession] = {
      ...this.taskTemplates[profession],
      ...newTemplate
    };
  }

  /**
   * Отримання списку доступних професій
   */
  getAvailableProfessions() {
    return Object.keys(this.taskTemplates);
  }
}

module.exports = TaskService;
