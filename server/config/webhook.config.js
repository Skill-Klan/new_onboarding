// Конфігурація веб-хуків
// Цей файл містить налаштування для Discord webhook інтеграції

module.exports = {
  // Тогл для увімкнення/вимкнення webhook повідомлень
  enabled: true,
  
  // URL Discord webhook
  webhookUrl: process.env.DISCORD_WEBHOOK_URL || 'https://discord.com/api/webhooks/1412903925694332998/XDyrZ3asQ80y_NAdv_3lErNylvFUTru2pjZyzpjAm38XLs102DQ-LnUEZXNiPtmUuPWm',
  
  // Таймаут для webhook запитів (в мілісекундах)
  timeout: 10000,
  
  // Кольори для різних типів повідомлень
  colors: {
    info: 0x3498db,      // Синій - інформаційні повідомлення
    success: 0x2ecc71,   // Зелений - успішні дії
    warning: 0xf39c12,   // Помаранчевий - попередження
    danger: 0xe74c3c,    // Червоний - критичні події
    primary: 0x9b59b6    // Фіолетовий - основні події
  },
  
  // Налаштування для різних типів повідомлень
  notifications: {
    userStarted: true,        // Початок взаємодії з ботом
    userReady: true,          // Готовність користувача спробувати
    contactProvided: true,    // Надання контактних даних
    taskSent: true,           // Відправка тестового завдання
    taskCompleted: true,      // Завершення завдання
    deadlineWarning: true,    // Попередження про дедлайн
    deadlineToday: true       // Останній день дедлайну
  },
  
  // Логування webhook дій
  logging: {
    enabled: true,
    logLevel: 'info' // 'debug', 'info', 'warn', 'error'
  }
};
