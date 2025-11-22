const http = require('http');
const { URL } = require('url');
const path = require('path');
const crypto = require('crypto');
const nodemailer = require('nodemailer');
const { getDb, runMigrations, DB_PATH } = require('./db');
const config = require('./config');

const port = config.port;

const normalizePath = (pathname = '') => {
  if (!pathname) return '/';
  const trimmed = pathname.replace(/\/+$/, '');
  return trimmed || '/';
};

runMigrations();
const db = getDb();

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
    'Access-Control-Allow-Headers': 'Content-Type',
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
  const user = db.prepare('SELECT id, name, email, department FROM users WHERE id = 1').get();
  return user || null;
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
       ORDER BY published_at DESC`
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

function handleLogin(req, res) {
  parseBody(req)
    .then((parsed) => {
      const { email, password } = parsed;

      if (!email || !password) {
        return sendJson(res, { message: 'Потрібні email та пароль' }, 400);
      }

      const user = db
        .prepare('SELECT id, name, email, department FROM users WHERE email = ? AND password = ?')
        .get(email.toLowerCase(), password);

      if (!user) {
        return sendJson(res, { message: 'Невірні облікові дані' }, 401);
      }

      return sendJson(res, { token: `demo-token-${user.id}`, user });
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

      const token = crypto.randomBytes(24).toString('hex');
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

      const message = {
        from: config.smtp.from,
        to: email,
        subject: 'Завершення реєстрації в корпоративному порталі',
        text: `Вітаємо${name ? `, ${name}` : ''}!

Щоб завершити реєстрацію, перейдіть за посиланням та встановіть пароль:
${confirmationLink}

Посилання дійсне до ${expiresAt}.`,
      };

      await emailTransport.sendMail(message);

      return sendJson(res, {
        message: 'Лист із підтвердженням надіслано. Перевірте пошту, щоб завершити реєстрацію.',
        confirmationLink: emailTransport.options.jsonTransport ? confirmationLink : undefined,
        expiresAt,
      });
    })
    .catch((error) => sendJson(res, { message: 'Помилка запиту', error: String(error) }, 400));
}

function handleCompleteRegistration(req, res) {
  parseBody(req)
    .then((parsed) => {
      const { token, password, confirmPassword } = parsed;

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
        `INSERT INTO users (name, email, department, password) VALUES (?, ?, ?, ?)`
      );

      const name = tokenRow.name || tokenRow.email.split('@')[0];
      const department = tokenRow.department || 'Співробітник';

      const transaction = db.transaction(() => {
        const result = insertUser.run(name, tokenRow.email.toLowerCase(), department, password);
        db
          .prepare('UPDATE registration_tokens SET used = 1, used_at = datetime("now") WHERE token = ?')
          .run(token);
        return result.lastInsertRowid;
      });

      const userId = transaction();
      const user = db
        .prepare('SELECT id, name, email, department FROM users WHERE id = ?')
        .get(userId);

      return sendJson(res, { token: `demo-token-${user.id}`, user });
    })
    .catch((error) => sendJson(res, { message: 'Помилка реєстрації', error: String(error) }, 400));
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

  if (req.method === 'POST' && pathname === '/api/auth/login') {
    return handleLogin(req, res);
  }

  if (req.method === 'POST' && pathname === '/api/auth/register-request') {
    return handleRegisterRequest(req, res);
  }

  if (req.method === 'POST' && pathname === '/api/auth/complete-registration') {
    return handleCompleteRegistration(req, res);
  }

  sendJson(res, { message: 'Not found' }, 404);
});

server.listen(port, () => {
  console.log(`API server running on port ${port}`);
});
