CREATE TABLE IF NOT EXISTS candidates (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  position TEXT NOT NULL,
  stage TEXT NOT NULL,
  applied_at TEXT NOT NULL
);

INSERT OR IGNORE INTO candidates (id, name, position, stage, applied_at) VALUES
  (1, 'Ірина Коваленко', 'Frontend Engineer', 'Phone Screen', '2025-11-18'),
  (2, 'Дмитро Сидоренко', 'Backend Engineer', 'Onsite', '2025-11-16'),
  (3, 'Олена Гнатюк', 'Product Designer', 'Offer', '2025-11-15'),
  (4, 'Максим Петренко', 'Data Analyst', 'Applied', '2025-11-13');
