// Сервіс для роботи з тестовими завданнями

const path = require('path');

class TaskService {
  constructor() {
    this.tasksPath = path.join(__dirname, '../../assets/tasks');
  }

  /**
   * Отримати шлях до PDF файлу завдання для професії
   */
  getTaskFilePath(profession) {
    const fileName = profession === 'QA' ? 'qa-test-task.pdf' : 'ba-test-task.pdf';
    return path.join(this.tasksPath, fileName);
  }

  /**
   * Перевірити, чи існує файл завдання
   */
  async taskFileExists(profession) {
    const fs = require('fs');
    const filePath = this.getTaskFilePath(profession);
    
    try {
      await fs.promises.access(filePath, fs.constants.F_OK);
      return true;
    } catch (error) {
      return false;
    }
  }

  /**
   * Отримати інформацію про завдання
   */
  getTaskInfo(profession) {
    const tasks = {
      'QA': {
        title: 'Тестове завдання QA',
        description: 'Перевір веб-додаток і створи звіт про знайдені помилки — покажи, що ти профі!',
        deadline: '3 дні'
      },
      'BA': {
        title: 'Тестове завдання Business Analyst',
        description: 'Проаналізуй бізнес-процеси і створи технічне завдання — покажи свій аналітичний талант!',
        deadline: '5 днів'
      }
    };

    return tasks[profession] || null;
  }
}

module.exports = TaskService;