-- Створення бази даних
CREATE DATABASE skillklan_db;

-- Підключення до бази даних
\c skillklan_db;

-- Таблиця користувачів
CREATE TABLE users (
  id SERIAL PRIMARY KEY,
  telegram_id BIGINT UNIQUE,
  name VARCHAR(100) NOT NULL,
  phone VARCHAR(20) NOT NULL,
  email VARCHAR(100),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Таблиця заявок на тестові завдання
CREATE TABLE test_task_requests (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
  profession VARCHAR(10) NOT NULL CHECK (profession IN ('qa', 'ba')),
  status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'sent', 'completed')),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  sent_at TIMESTAMP,
  completed_at TIMESTAMP
);

-- Індекси для швидкого пошуку
CREATE INDEX idx_users_telegram_id ON users(telegram_id);
CREATE INDEX idx_test_tasks_profession ON test_task_requests(profession);
CREATE INDEX idx_test_tasks_status ON test_task_requests(status);

-- Тригер для оновлення updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();