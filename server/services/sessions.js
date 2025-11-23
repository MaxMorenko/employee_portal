const crypto = require('crypto');
const { parseTags } = require('../utils/formatters');
const { sendJson } = require('../utils/http');

function createSessionService(db) {
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
        `SELECT u.id, u.name, u.email, u.department, u.is_admin, u.job_title AS jobTitle, u.phone, u.location, u.bio, u.tags, u.status, u.last_login_at AS lastLoginAt
         FROM sessions s
         JOIN users u ON u.id = s.user_id
         WHERE s.token = ?`
      )
      .get(token);
    if (!user) return null;
    return {
      ...user,
      is_admin: Boolean(user.is_admin),
      tags: parseTags(user.tags),
    };
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

  function requireUser(req, res) {
    const token = getSessionToken(req);
    if (!token) {
      sendJson(res, { message: 'Потрібен токен сесії' }, 401);
      return null;
    }

    const user = getSessionUser(token);
    if (!user) {
      sendJson(res, { message: 'Сесію не знайдено' }, 401);
      return null;
    }

    return { user, token };
  }

  return {
    createSession,
    revokeSession,
    getSessionUser,
    getSessionToken,
    requireAdmin,
    requireUser,
  };
}

module.exports = {
  createSessionService,
};
