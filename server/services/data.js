const { parseTags, formatISODateToUA, formatUADate } = require('../utils/formatters');

function ensureDefaultUsers(db) {
  const defaults = [
    {
      name: 'Олексій',
      email: 'employee@company.com',
      department: 'Розробка',
      password: 'password123',
      is_admin: 0,
    },
    {
      name: 'Адміністратор',
      email: 'admin@company.com',
      department: 'Адміністрування',
      password: 'admin12345',
      is_admin: 1,
    },
  ];

  const findUser = db.prepare('SELECT id FROM users WHERE LOWER(email) = LOWER(?)');
  const insertUser = db.prepare('INSERT INTO users (name, email, department, password, is_admin) VALUES (?, ?, ?, ?, ?)');

  defaults.forEach((user) => {
    const existing = findUser.get(user.email);
    if (!existing) {
      insertUser.run(user.name, user.email.toLowerCase(), user.department, user.password, user.is_admin);
    }
  });
}

function formatUserRow(user) {
  return {
    ...user,
    is_admin: Boolean(user.is_admin),
    tags: parseTags(user.tags),
  };
}

function mapNewsRowToItem(row) {
  return {
    id: row.id,
    title: row.title,
    excerpt: row.excerpt,
    category: row.category,
    author: row.author,
    image: row.image || row.image_url,
    featured: Boolean(row.featured),
    date: formatISODateToUA(row.published_at),
    viewCount: row.view_count ?? row.viewCount ?? 0,
  };
}

function createDataService(db) {
  function getDemoUser() {
    const user = db.prepare('SELECT id, name, email, department, is_admin FROM users WHERE id = 1').get();
    return user ? { ...user, is_admin: Boolean(user.is_admin) } : null;
  }

  function getDashboardData() {
    const user = getDemoUser();
    const stats = db.prepare('SELECT label, value, icon, color FROM dashboard_stats ORDER BY id').all();

    const upcomingEvents = db
      .prepare(
        `SELECT id, title, strftime('%H:%M', event_time) AS time, event_date AS date
         FROM events
         ORDER BY event_date ASC, event_time ASC
         LIMIT 5`
      )
      .all()
      .map((event) => ({ ...event, date: formatISODateToUA(event.date) }));

    const recentNews = db
      .prepare(
        `SELECT id, title, strftime('%d %m %Y', published_at) AS date, category
         FROM news
         ORDER BY published_at DESC
         LIMIT 3`
      )
      .all()
      .map((item) => ({
        ...item,
        date: formatUADate(item.date),
      }));

    const tasks = db.prepare('SELECT id, title, completed FROM tasks ORDER BY id').all();

    return {
      greeting: user?.name || 'Співробітник',
      stats,
      upcomingEvents,
      recentNews,
      tasks: tasks.map((task) => ({ ...task, completed: Boolean(task.completed) })),
    };
  }

  function getNewsData() {
    const items = db
      .prepare(
        `SELECT id, title, excerpt, category, author, published_at, image_url AS image, featured, view_count AS viewCount
         FROM news
         ORDER BY published_at DESC, id DESC`
      )
      .all()
      .map(mapNewsRowToItem);

    const categories = ['Всі', ...new Set(items.map((i) => i.category))];
    return { items, categories };
  }

  function getDocumentData() {
    const folders = db
      .prepare(
        `SELECT f.id, f.name, COALESCE(COUNT(d.id), 0) AS files
         FROM document_folders f
         LEFT JOIN documents d ON d.folder_id = f.id
         GROUP BY f.id
         ORDER BY f.name`
      )
      .all()
      .map((folder) => ({ ...folder, icon: 'folder' }));

    const recentDocuments = db
      .prepare(
        `SELECT id, name, type, size, modified_at, category
         FROM documents
         ORDER BY modified_at DESC, id DESC
         LIMIT 20`
      )
      .all()
      .map((doc) => ({
        ...doc,
        modified: formatISODateToUA(doc.modified_at),
      }));

    return { folders, recentDocuments };
  }

  function getProjects() {
    return db
      .prepare(
        `SELECT id, name, owner, status, due_date AS dueDate, progress
         FROM projects
         ORDER BY due_date ASC, id ASC`
      )
      .all()
      .map((project) => ({
        ...project,
        progress: Number(project.progress) || 0,
        dueDate: formatISODateToUA(project.dueDate),
      }));
  }

  function getAllUsers() {
    return db
      .prepare(
        `SELECT id, name, email, department, is_admin, job_title AS jobTitle, phone, location, bio, tags, status, last_login_at AS lastLoginAt
         FROM users
         ORDER BY id ASC`
      )
      .all()
      .map(formatUserRow);
  }

  function getAdminOverview() {
    const stats = {
      newsViews: db.prepare('SELECT COALESCE(SUM(view_count), 0) as total FROM news').get().total,
      activeUsers: db.prepare('SELECT COUNT(*) as total FROM sessions').get().total,
      lastLogin: db.prepare('SELECT MAX(last_login_at) as lastLogin FROM users').get().lastLogin,
      departments: db.prepare('SELECT COUNT(*) as total FROM departments').get().total,
      newDocuments: db.prepare("SELECT COUNT(*) as total FROM documents WHERE modified_at >= date('now', '-7 day')").get().total,
      hiring: db.prepare('SELECT COUNT(*) as total FROM candidates').get().total,
    };

    const projects = getProjects();
    const users = getAllUsers();

    const news = db
      .prepare(
        `SELECT id, title, excerpt, category, author, published_at, image_url, featured, view_count
         FROM news
         ORDER BY published_at DESC, id DESC
         LIMIT 10`
      )
      .all()
      .map(mapNewsRowToItem);

    return { stats, projects, users, news };
  }

  return {
    getDashboardData,
    getNewsData,
    getDocumentData,
    getProjects,
    getAllUsers,
    getAdminOverview,
  };
}

module.exports = {
  ensureDefaultUsers,
  createDataService,
  formatUserRow,
  mapNewsRowToItem,
};
