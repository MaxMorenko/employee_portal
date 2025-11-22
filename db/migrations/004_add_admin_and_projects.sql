ALTER TABLE users ADD COLUMN is_admin INTEGER NOT NULL DEFAULT 0;

INSERT OR IGNORE INTO users (id, name, email, department, password, is_admin) VALUES
  (2, 'Адміністратор', 'admin@company.com', 'Адміністрування', 'admin12345', 1);

CREATE TABLE IF NOT EXISTS projects (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  owner TEXT NOT NULL,
  status TEXT NOT NULL,
  due_date TEXT NOT NULL,
  progress INTEGER NOT NULL DEFAULT 0
);

INSERT OR IGNORE INTO projects (id, name, owner, status, due_date, progress) VALUES
  (1, 'Перезапуск порталу', 'Олексій', 'В роботі', '2025-12-15', 45),
  (2, 'Мобільний застосунок', 'Марія', 'Планування', '2026-01-20', 25),
  (3, 'CRM інтеграція', 'Ігор', 'Тестування', '2025-12-05', 70);
