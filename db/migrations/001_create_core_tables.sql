CREATE TABLE IF NOT EXISTS users (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  email TEXT NOT NULL UNIQUE,
  department TEXT,
  password TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS dashboard_stats (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  label TEXT NOT NULL,
  value TEXT NOT NULL,
  icon TEXT NOT NULL,
  color TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS events (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  title TEXT NOT NULL,
  event_date TEXT NOT NULL,
  event_time TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS news (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  title TEXT NOT NULL,
  excerpt TEXT NOT NULL,
  category TEXT NOT NULL,
  author TEXT NOT NULL,
  published_at TEXT NOT NULL,
  image_url TEXT NOT NULL,
  featured INTEGER NOT NULL DEFAULT 0
);

CREATE TABLE IF NOT EXISTS document_folders (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS documents (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  type TEXT NOT NULL,
  size TEXT NOT NULL,
  modified_at TEXT NOT NULL,
  category TEXT NOT NULL,
  folder_id INTEGER NOT NULL,
  FOREIGN KEY (folder_id) REFERENCES document_folders(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS tasks (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  title TEXT NOT NULL,
  completed INTEGER NOT NULL DEFAULT 0
);

INSERT OR IGNORE INTO users (id, name, email, department, password) VALUES
  (1, 'Олексій', 'employee@company.com', 'Розробка', 'password123');

INSERT OR IGNORE INTO dashboard_stats (id, label, value, icon, color) VALUES
  (1, 'Активні проєкти', '12', 'trending-up', 'bg-blue-500'),
  (2, 'Зустрічі сьогодні', '3', 'calendar', 'bg-green-500'),
  (3, 'Нові документи', '8', 'file-text', 'bg-purple-500'),
  (4, 'Члени команди', '47', 'users', 'bg-orange-500');

INSERT OR IGNORE INTO events (id, title, event_date, event_time) VALUES
  (1, 'Планування спринту', '2025-11-21', '10:00'),
  (2, 'Презентація проєкту', '2025-11-21', '14:30'),
  (3, 'Зустріч команди', '2025-11-21', '16:00');

INSERT OR IGNORE INTO news (id, title, excerpt, category, author, published_at, image_url, featured) VALUES
  (1, 'Запуск нового продукту: AI Platform 2.0', 'Раді оголосити про запуск нашої нової платформи штучного інтелекту, яка допоможе клієнтам автоматизувати їх бізнес-процеси.', 'Продукт', 'Марія Петренко', '2025-11-21', 'https://images.unsplash.com/photo-1677442136019-21780ecad995?w=600&h=300&fit=crop', 1),
  (2, 'Корпоративний зимовий захід', 'Запрошуємо всіх співробітників на щорічний зимовий захід 15 грудня. Буде багато розваг, подарунків та сюрпризів!', 'Події', 'Андрій Коваль', '2025-11-20', 'https://images.unsplash.com/photo-1511795409834-ef04bbd61622?w=600&h=300&fit=crop', 0),
  (3, 'Оновлення політики відпусток', 'З 1 грудня набувають чинності нові правила оформлення та узгодження відпусток. Ознайомтесь з деталями.', 'HR', 'Олена Сидоренко', '2025-11-19', 'https://images.unsplash.com/photo-1506784983877-45594efa4cbe?w=600&h=300&fit=crop', 0),
  (4, 'Квартальні результати: рекордний ріст', 'Третій квартал виявився найуспішнішим в історії компанії. Дякуємо всім за вашу наполегливу працю!', 'Фінанси', 'Ігор Мельник', '2025-11-18', 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=600&h=300&fit=crop', 0),
  (5, 'Програма навчання для співробітників', 'Стартує нова програма професійного розвитку з курсами по лідерству, технологіям та soft skills.', 'Навчання', 'Тетяна Бойко', '2025-11-17', 'https://images.unsplash.com/photo-1524178232363-1fb2b075b655?w=600&h=300&fit=crop', 0),
  (6, 'Екологічні ініціативи компанії', 'Наша компанія приєдналась до програми Carbon Neutral. Дізнайтесь, як ми зменшуємо наш вплив на довкілля.', 'CSR', 'Максим Гончар', '2025-11-16', 'https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?w=600&h=300&fit=crop', 0);

INSERT OR IGNORE INTO document_folders (id, name) VALUES
  (1, 'Політики компанії'),
  (2, 'Шаблони документів'),
  (3, 'Презентації'),
  (4, 'Звіти');

INSERT OR IGNORE INTO documents (id, name, type, size, modified_at, category, folder_id) VALUES
  (1, 'Політика відпусток 2025', 'PDF', '2.4 MB', '2025-11-21', 'HR', 1),
  (2, 'Квартальний звіт Q3', 'XLSX', '5.1 MB', '2025-11-20', 'Фінанси', 4),
  (3, 'Презентація продукту', 'PPTX', '15.2 MB', '2025-11-19', 'Продукт', 3),
  (4, 'Інструкція з безпеки', 'PDF', '1.8 MB', '2025-11-18', 'HR', 1),
  (5, 'Шаблон договору', 'DOCX', '245 KB', '2025-11-17', 'Юридичні', 2),
  (6, 'Технічна документація API', 'PDF', '3.7 MB', '2025-11-16', 'Технічні', 3);

INSERT OR IGNORE INTO tasks (id, title, completed) VALUES
  (1, 'Завершити квартальний звіт', 0),
  (2, 'Переглянути PR команди', 1),
  (3, 'Підготувати презентацію', 0),
  (4, 'Оновити документацію', 0);
