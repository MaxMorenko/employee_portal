CREATE TABLE IF NOT EXISTS departments (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL UNIQUE,
  headcount INTEGER NOT NULL DEFAULT 0
);

INSERT OR IGNORE INTO departments (id, name, headcount) VALUES
  (1, 'Менеджмент', 1),
  (2, 'Розробка', 18),
  (3, 'Дизайн', 8),
  (4, 'Маркетинг', 12),
  (5, 'HR', 5),
  (6, 'Продажі', 4);
