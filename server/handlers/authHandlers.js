const crypto = require('crypto');
const { parseTags } = require('../utils/formatters');

function createAuthHandlers({ db, parseBody, sendJson, sessionService, emailTransport, config }) {
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

  function handleLogin(req, res) {
    parseBody(req)
      .then((parsed) => {
        const { email, password } = parsed;

        if (!email || !password) {
          return sendJson(res, { message: 'Потрібні email та пароль' }, 400);
        }

        const user = db
          .prepare(
            `SELECT id, name, email, department, is_admin, job_title AS jobTitle, phone, location, bio, tags, status, last_login_at AS lastLoginAt
             FROM users
             WHERE email = ? AND password = ?`
          )
          .get(email.toLowerCase(), password);

        if (!user) {
          return sendJson(res, { message: 'Невірні облікові дані' }, 401);
        }

        db.prepare("UPDATE users SET last_login_at = datetime('now') WHERE id = ?").run(user.id);
        const token = sessionService.createSession(user.id);

        return sendJson(res, {
          token,
          user: {
            ...user,
            is_admin: Boolean(user.is_admin),
            tags: parseTags(user.tags),
          },
        });
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

        const existing = db.prepare('SELECT id FROM users WHERE LOWER(email) = LOWER(?)').get(email.toLowerCase());

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

  function handleCompleteRegistration(req, res) {
    parseBody(req)
      .then((parsed) => {
        const { email, token: rawToken, password } = parsed;
        if (!email || !rawToken || !password) {
          return sendJson(res, { message: 'Потрібні email, token та password' }, 400);
        }

        const token = normalizeIncomingToken(rawToken);
        const tokenRow = db
          .prepare(
            `SELECT email, name, department, token, expires_at, used
             FROM registration_tokens
             WHERE LOWER(email) = LOWER(?) AND token = ?`
          )
          .get(email.toLowerCase(), token);

        if (!tokenRow) {
          return sendJson(res, { message: 'Невірний токен або email' }, 400);
        }

        const now = new Date();
        if (tokenRow.used) {
          return sendJson(res, { message: 'Токен уже використано' }, 409);
        }

        if (new Date(tokenRow.expires_at.replace(' ', 'T')) < now) {
          return sendJson(res, { message: 'Токен прострочений' }, 410);
        }

        const existingUser = db.prepare('SELECT id FROM users WHERE LOWER(email) = LOWER(?)').get(tokenRow.email.toLowerCase());

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
          db.prepare("UPDATE registration_tokens SET used = 1, used_at = datetime('now') WHERE token = ?").run(token);
          return result.lastInsertRowid;
        });

        const userId = transaction();
        const user = db.prepare('SELECT id, name, email, department, is_admin FROM users WHERE id = ?').get(userId);

        const sessionToken = sessionService.createSession(user.id);
        return sendJson(res, { token: sessionToken, user: { ...user, is_admin: Boolean(user.is_admin) } });
      })
      .catch((error) => sendJson(res, { message: 'Помилка реєстрації', error: String(error) }, 400));
  }

  function handleLogout(req, res) {
    parseBody(req)
      .then((parsed) => {
        const { token } = parsed || {};
        const revoked = sessionService.revokeSession(token);

        return sendJson(res, {
          message: 'Сесію завершено',
          revoked,
        });
      })
      .catch((error) => sendJson(res, { message: 'Не вдалося завершити сесію', error: String(error) }, 400));
  }

  return {
    handleLogin,
    handleRegisterRequest,
    handleCompleteRegistration,
    handleLogout,
  };
}

module.exports = { createAuthHandlers };
