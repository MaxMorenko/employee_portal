const http = require('http');
const { URL } = require('url');
const path = require('path');
const crypto = require('crypto');
const nodemailer = require('nodemailer');
const { getDb, runMigrations, DB_PATH } = require('./db');
const config = require('./config');

const port = config.port;

const normalizePath = (pathname = '') => {
  const safePath = pathname ? decodeURIComponent(pathname) : '';
  const trimmed = safePath.replace(/\/+$/, '');
  if (!trimmed) return '/';
  return trimmed.startsWith('/') ? trimmed : `/${trimmed}`;
};

runMigrations();
const db = getDb();

function ensureDefaultUsers() {
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

ensureDefaultUsers();

function createSession(userId) {
  const insert = db.prepare('INSERT INTO sessions (token, user_id) VALUES (?, ?)');

  let attempts = 0;
  while (attempts < 5) {
    const token = `session-${crypto.randomBytes(16).toString('hex')}`;

    try {
      insert.run(token, userId);
      return token;
    } catch (error) {
      if (error.code !== 'SQLITE_CONSTRAINT_PRIMARYKEY') {
        throw error;
      }
    }

    attempts += 1;
  }

  const fallbackToken = `session-${crypto.randomBytes(16).toString('hex')}`;
  insert.run(fallbackToken, userId);
  return fallbackToken;
}

function revokeSession(token) {
  if (!token) return false;

  const result = db.prepare('DELETE FROM sessions WHERE token = ?').run(token);
  return result.changes > 0;
}

function getSessionUser(token) {
  if (!token) return null;
  const user = db
    .prepare(
      `SELECT u.id, u.name, u.email, u.department, u.is_admin
       FROM sessions s
       JOIN users u ON u.id = s.user_id
       WHERE s.token = ?`
    )
    .get(token);
  if (!user) return null;
  return { ...user, is_admin: Boolean(user.is_admin) };
}

function getSessionToken(req) {
  const headerToken = req.headers['x-session-token'];
  if (headerToken && !Array.isArray(headerToken)) {
    return String(headerToken);
  }

  const authHeader = req.headers.authorization;
  if (authHeader && !Array.isArray(authHeader)) {
    const [, bearerToken] = authHeader.match(/^Bearer\s+(.+)$/i) || [];
    if (bearerToken) {
      return bearerToken.trim();
    }
  }

  return null;
}

function requireAdmin(req, res) {
  const token = getSessionToken(req);
  if (!token) {
    sendJson(res, { message: 'Потрібен токен сесії адміністратора' }, 401);
    return null;
  }

  const user = getSessionUser(token);
  if (!user) {
    sendJson(res, { message: 'Сесію не знайдено' }, 401);
    return null;
  }

  if (!user.is_admin) {
    sendJson(res, { message: 'Доступ дозволено лише адміністраторам' }, 403);
    return null;
  }

  return user;
}

const emailTransport = config.smtp.host
  ? nodemailer.createTransport({
      host: config.smtp.host,
      port: config.smtp.port,
      secure: config.smtp.secure,
      auth: config.smtp.user
        ? {
            user: config.smtp.user,
            pass: config.smtp.pass,
          }
        : undefined,
    })
  : nodemailer.createTransport({
      jsonTransport: true,
    });

function sendJson(res, data, status = 200) {
  res.writeHead(status, {
    'Content-Type': 'application/json',
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type, X-Session-Token',
    'Access-Control-Allow-Methods': 'GET,POST,OPTIONS',
  });
  res.end(JSON.stringify(data));
}

function parseBody(req) {
  return new Promise((resolve, reject) => {
    let body = '';
    req.on('data', (chunk) => {
      body += chunk;
    });
    req.on('end', () => {
      try {
        resolve(body ? JSON.parse(body) : {});
      } catch (error) {
        reject(error);
      }
    });
    req.on('error', reject);
  });
}

function getDemoUser() {
  const user = db
    .prepare('SELECT id, name, email, department, is_admin FROM users WHERE id = 1')
    .get();
  return user ? { ...user, is_admin: Boolean(user.is_admin) } : null;
}

function getDashboardData() {
  const user = getDemoUser();
  const stats = db
    .prepare('SELECT label, value, icon, color FROM dashboard_stats ORDER BY id')
    .all();

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

function formatUADate(dateString) {
  if (!dateString) return dateString;
  const [day, month, year] = dateString.split(' ');
  const months = [
    'січня',
    'лютого',
    'березня',
    'квітня',
    'травня',
    'червня',
    'липня',
    'серпня',
    'вересня',
    'жовтня',
    'листопада',
    'грудня',
  ];
  const monthIndex = parseInt(month, 10) - 1;
  return `${parseInt(day, 10)} ${months[monthIndex]} ${year}`;
}

function formatISODateToUA(isoDate) {
  if (!isoDate) return isoDate;
  const parts = isoDate.split('-');
  if (parts.length !== 3) return isoDate;
  const [year, month, day] = parts;
  return formatUADate(`${day} ${month} ${year}`);
}

function getNewsData() {
  const items = db
    .prepare(
      `SELECT id, title, excerpt, category, author, published_at, image_url AS image, featured
       FROM news
       ORDER BY published_at DESC, id DESC`
    )
    .all()
    .map((item) => ({
      ...item,
      featured: Boolean(item.featured),
      date: formatISODateToUA(item.published_at),
    }));

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
    .prepare('SELECT id, name, email, department, is_admin FROM users ORDER BY id ASC')
    .all()
    .map((user) => ({ ...user, is_admin: Boolean(user.is_admin) }));
}

function handleLogin(req, res) {
  parseBody(req)
    .then((parsed) => {
      const { email, password } = parsed;

      if (!email || !password) {
        return sendJson(res, { message: 'Потрібні email та пароль' }, 400);
      }

      const user = db
        .prepare('SELECT id, name, email, department, is_admin FROM users WHERE email = ? AND password = ?')
        .get(email.toLowerCase(), password);

      if (!user) {
        return sendJson(res, { message: 'Невірні облікові дані' }, 401);
      }

      const token = createSession(user.id);

      return sendJson(res, { token, user: { ...user, is_admin: Boolean(user.is_admin) } });
    })
    .catch((error) => sendJson(res, { message: 'Неправильний формат запиту', error: String(error) }, 400));
}

function handleRegisterRequest(req, res) {
  parseBody(req)
    .then(async (parsed) => {
      const { email, name = '', department = '' } = parsed;

      if (!email) {
        return sendJson(res, { message: 'Потрібен email для реєстрації' }, 400);
      }

      const existing = db
        .prepare('SELECT id FROM users WHERE LOWER(email) = LOWER(?)')
        .get(email.toLowerCase());

      if (existing) {
        return sendJson(res, { message: 'Користувач з таким email вже існує' }, 409);
      }

      const token = generateNumericToken();
      const expiresAt = new Date(Date.now() + config.registration.tokenHours * 60 * 60 * 1000)
        .toISOString()
        .replace('T', ' ')
        .replace('Z', '');

      const upsertToken = db.prepare(
        `INSERT INTO registration_tokens (email, name, department, token, expires_at, used)
         VALUES (@email, @name, @department, @token, @expiresAt, 0)
         ON CONFLICT(email) DO UPDATE SET token=@token, expires_at=@expiresAt, name=@name, department=@department, used=0, used_at=NULL`
      );

      upsertToken.run({ email: email.toLowerCase(), name, department, token, expiresAt });

      const confirmationLink = `${config.appBaseUrl}/register?token=${token}&email=${encodeURIComponent(email)}`;

      const emailSubject = 'Завершення реєстрації в корпоративному порталі';

      const messageText = `Вітаємо${name ? `, ${name}` : ''}!

Ваш код підтвердження: ${token}

Скопіюйте код у форму завершення реєстрації або скористайтеся посиланням нижче:
${confirmationLink}

Посилання дійсне до ${expiresAt}.`;

      const messageHtml = buildRegistrationEmailHtml({
        name,
        token,
        confirmationLink,
        expiresAt,
      });

      const message = {
        from: config.smtp.from,
        to: email,
        subject: emailSubject,
        text: messageText,
        html: messageHtml,
      };

      await emailTransport.sendMail(message);

      return sendJson(res, {
        message: 'Лист із підтвердженням надіслано. Перевірте пошту, щоб завершити реєстрацію.',
        confirmationLink: emailTransport.options.jsonTransport ? confirmationLink : undefined,
        tokenPreview: emailTransport.options.jsonTransport ? token : undefined,
        expiresAt,
      });
    })
    .catch((error) => sendJson(res, { message: 'Помилка запиту', error: String(error) }, 400));
}

function normalizeIncomingToken(rawToken = '') {
  if (!rawToken) return '';

  const trimmed = String(rawToken).trim();

  try {
    const parsedUrl = new URL(trimmed);
    const searchToken = parsedUrl.searchParams.get('token');
    if (searchToken) return searchToken;
  } catch (_) {
    // Not a URL, fall back to manual parsing
  }

  const tokenMatch = trimmed.match(/token=([^&]+)/i);
  if (tokenMatch?.[1]) {
    try {
      return decodeURIComponent(tokenMatch[1]);
    } catch (_) {
      return tokenMatch[1];
    }
  }

  return trimmed;
}

function handleCompleteRegistration(req, res) {
  parseBody(req)
    .then((parsed) => {
      const { token: rawToken, password, confirmPassword } = parsed;
      const token = normalizeIncomingToken(rawToken);

      if (!token) {
        return sendJson(res, { message: 'Відсутній токен підтвердження' }, 400);
      }

      if (!password || password.length < 8) {
        return sendJson(res, { message: 'Пароль має містити щонайменше 8 символів' }, 400);
      }

      if (password !== confirmPassword) {
        return sendJson(res, { message: 'Паролі не співпадають' }, 400);
      }

      const tokenRow = db
        .prepare('SELECT * FROM registration_tokens WHERE token = ?')
        .get(token);

      if (!tokenRow) {
        return sendJson(res, { message: 'Токен не знайдено' }, 404);
      }

      if (tokenRow.used) {
        return sendJson(res, { message: 'Токен вже використано' }, 400);
      }

      const expiresAt = new Date(`${tokenRow.expires_at.replace(' ', 'T')}Z`).getTime();
      if (Date.now() > expiresAt) {
        return sendJson(res, { message: 'Термін дії токена вичерпано' }, 400);
      }

      const existingUser = db
        .prepare('SELECT id FROM users WHERE LOWER(email) = LOWER(?)')
        .get(tokenRow.email.toLowerCase());

      if (existingUser) {
        return sendJson(res, { message: 'Користувач уже активований' }, 409);
      }

      const insertUser = db.prepare(
        `INSERT INTO users (name, email, department, password, is_admin) VALUES (?, ?, ?, ?, 0)`
      );

      const name = tokenRow.name || tokenRow.email.split('@')[0];
      const department = tokenRow.department || 'Співробітник';

      const transaction = db.transaction(() => {
        const result = insertUser.run(name, tokenRow.email.toLowerCase(), department, password);
        db
          .prepare("UPDATE registration_tokens SET used = 1, used_at = datetime('now') WHERE token = ?")
          .run(token);
        return result.lastInsertRowid;
      });

      const userId = transaction();
      const user = db
        .prepare('SELECT id, name, email, department, is_admin FROM users WHERE id = ?')
        .get(userId);

      const sessionToken = createSession(user.id);
      return sendJson(res, { token: sessionToken, user: { ...user, is_admin: Boolean(user.is_admin) } });
    })
    .catch((error) => sendJson(res, { message: 'Помилка реєстрації', error: String(error) }, 400));
}

function handleLogout(req, res) {
  parseBody(req)
    .then((parsed) => {
      const { token } = parsed || {};
      const revoked = revokeSession(token);

      return sendJson(res, {
        message: 'Сесію завершено',
        revoked,
      });
    })
    .catch((error) => sendJson(res, { message: 'Не вдалося завершити сесію', error: String(error) }, 400));
}

function handleCreateProject(req, res) {
  parseBody(req)
    .then((parsed) => {
      const { name, owner, status = 'В роботі', dueDate, progress = 0 } = parsed || {};

      if (!name || !owner || !dueDate) {
        return sendJson(res, { message: 'Необхідні поля: name, owner, dueDate' }, 400);
      }

      const numericProgress = Math.min(100, Math.max(0, Number(progress) || 0));

      const result = db
        .prepare('INSERT INTO projects (name, owner, status, due_date, progress) VALUES (?, ?, ?, ?, ?)')
        .run(name, owner, status, dueDate, numericProgress);

      const project = {
        id: result.lastInsertRowid,
        name,
        owner,
        status,
        progress: numericProgress,
        dueDate: formatISODateToUA(dueDate),
      };

      return sendJson(res, project, 201);
    })
    .catch((error) => sendJson(res, { message: 'Не вдалося створити проєкт', error: String(error) }, 400));
}

function handleCreateNews(req, res) {
  parseBody(req)
    .then((parsed) => {
      const { title, excerpt, category, author, image, featured = false } = parsed || {};

      if (!title || !excerpt || !category || !author) {
        return sendJson(res, { message: 'Поля title, excerpt, category та author є обов’язковими' }, 400);
      }

      const publishedAt = new Date().toISOString().split('T')[0];
      const imageUrl = image || 'https://images.unsplash.com/photo-1474631245212-32dc3c8310c6?w=600&h=300&fit=crop';

      const result = db
        .prepare(
          `INSERT INTO news (title, excerpt, category, author, published_at, image_url, featured)
           VALUES (?, ?, ?, ?, ?, ?, ?)`
        )
        .run(title, excerpt, category, author, publishedAt, imageUrl, featured ? 1 : 0);

      const created = {
        id: result.lastInsertRowid,
        title,
        excerpt,
        category,
        author,
        image: imageUrl,
        featured: Boolean(featured),
        date: formatISODateToUA(publishedAt),
      };

      return sendJson(res, created, 201);
    })
    .catch((error) => sendJson(res, { message: 'Не вдалося створити новину', error: String(error) }, 400));
}

function getAdminOverview() {
  return {
    users: getAllUsers(),
    projects: getProjects(),
    news: getNewsData().items,
  };
}

function generateNumericToken() {
  let token = '';
  let attempts = 0;

  while (!token && attempts < 5) {
    const candidate = crypto.randomInt(0, 100000000).toString().padStart(8, '0');
    const existing = db.prepare('SELECT 1 FROM registration_tokens WHERE token = ?').get(candidate);

    if (!existing) {
      token = candidate;
    }

    attempts += 1;
  }

  if (!token) {
    token = crypto.randomInt(0, 100000000).toString().padStart(8, '0');
  }

  return token;
}

function buildRegistrationEmailHtml({ name = '', token, confirmationLink, expiresAt }) {
  const greetingName = name ? `, ${name}` : '';

  return `
    <div style="font-family: 'Inter', 'Segoe UI', system-ui, -apple-system, sans-serif; background:#f5f7fb; padding:24px;">
      <div style="max-width:560px; margin:0 auto; background:#ffffff; border-radius:16px; box-shadow:0 10px 30px rgba(15,23,42,0.08); padding:28px;">
        <h1 style="font-size:20px; color:#0f172a; margin:0 0 12px 0;">Вітаємо${greetingName}!</h1>
        <p style="color:#475569; margin:0 0 16px 0; line-height:1.6;">
          Ось ваш код підтвердження для завершення реєстрації. Скопіюйте його або використайте кнопку нижче.
        </p>

        <div style="background:#f8fafc; border:1px solid #e2e8f0; border-radius:12px; padding:16px; text-align:center; margin-bottom:20px;">
          <div style="font-size:14px; color:#475569; letter-spacing:0.4px; margin-bottom:6px;">Ваш код</div>
          <div style="font-size:28px; font-weight:700; color:#0f172a; letter-spacing:6px;">${token}</div>
        </div>

        <a href="${confirmationLink}" style="display:inline-block; background:#2563eb; color:#ffffff; padding:12px 20px; border-radius:12px; text-decoration:none; font-weight:600; box-shadow:0 10px 20px rgba(37,99,235,0.18);">
          Завершити реєстрацію
        </a>

        <p style="color:#475569; margin:16px 0 8px 0; line-height:1.6;">
          Або скопіюйте посилання й відкрийте його в браузері:
        </p>
        <div style="background:#f8fafc; border:1px dashed #cbd5e1; border-radius:10px; padding:12px 14px; font-size:13px; color:#0f172a; word-break:break-all;">
          ${confirmationLink}
        </div>

        <p style="color:#475569; margin:16px 0 0 0; font-size:13px;">Код дійсний до ${expiresAt}.</p>
      </div>
    </div>
  `;
}

const server = http.createServer((req, res) => {
  const url = new URL(req.url || '', `http://${req.headers.host}`);
  const pathname = normalizePath(url.pathname);

  if (req.method === 'OPTIONS') {
    return sendJson(res, { status: 'ok' });
  }

  if (req.method === 'GET' && pathname === '/api/health') {
    return sendJson(res, { status: 'ok', database: path.basename(DB_PATH) });
  }

  if (req.method === 'GET' && pathname === '/api/dashboard') {
    return sendJson(res, getDashboardData());
  }

  if (req.method === 'GET' && pathname === '/api/news') {
    return sendJson(res, getNewsData());
  }

  if (req.method === 'GET' && pathname === '/api/documents') {
    return sendJson(res, getDocumentData());
  }

  if (pathname.startsWith('/api/admin')) {
    const adminUser = requireAdmin(req, res);
    if (!adminUser) return;

    if (req.method === 'GET' && pathname === '/api/admin/overview') {
      return sendJson(res, getAdminOverview());
    }

    if (req.method === 'POST' && pathname === '/api/admin/projects') {
      return handleCreateProject(req, res);
    }

    if (req.method === 'POST' && pathname === '/api/admin/news') {
      return handleCreateNews(req, res);
    }
  }

  if (req.method === 'POST' && pathname === '/api/auth/login') {
    return handleLogin(req, res);
  }

  if (req.method === 'POST' && pathname === '/api/auth/register-request') {
    return handleRegisterRequest(req, res);
  }

  if (req.method === 'POST' && pathname === '/api/auth/complete-registration') {
    return handleCompleteRegistration(req, res);
  }

  if (req.method === 'POST' && pathname === '/api/auth/logout') {
    return handleLogout(req, res);
  }

  sendJson(res, { message: 'Not found' }, 404);
});

server.listen(port, () => {
  console.log(`API server running on port ${port}`);
});
