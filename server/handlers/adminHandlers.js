const { formatISODateToUA, serializeTags } = require('../utils/formatters');

function createAdminHandlers({ db, parseBody, sendJson, dataService, formatUserRow, mapNewsRowToItem }) {
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

  function handleUpdateProject(req, res, projectId) {
    parseBody(req)
      .then((parsed) => {
        const existing = db
          .prepare('SELECT id, name, owner, status, due_date AS dueDate, progress FROM projects WHERE id = ?')
          .get(projectId);

        if (!existing) {
          return sendJson(res, { message: 'Проєкт не знайдено' }, 404);
        }

        const {
          name = existing.name,
          owner = existing.owner,
          status = existing.status,
          dueDate = existing.dueDate,
          progress = existing.progress,
        } = parsed || {};

        if (!name || !owner || !dueDate) {
          return sendJson(res, { message: 'Поля name, owner та dueDate є обов’язковими' }, 400);
        }

        const numericProgress = Math.min(100, Math.max(0, Number(progress) || 0));

        db
          .prepare('UPDATE projects SET name = ?, owner = ?, status = ?, due_date = ?, progress = ? WHERE id = ?')
          .run(name, owner, status, dueDate, numericProgress, projectId);

        return sendJson(res, {
          id: projectId,
          name,
          owner,
          status,
          progress: numericProgress,
          dueDate: formatISODateToUA(dueDate),
        });
      })
      .catch((error) => sendJson(res, { message: 'Не вдалося оновити проєкт', error: String(error) }, 400));
  }

  function handleDeleteProject(res, projectId) {
    const existing = db.prepare('SELECT id FROM projects WHERE id = ?').get(projectId);

    if (!existing) {
      return sendJson(res, { message: 'Проєкт не знайдено' }, 404);
    }

    db.prepare('DELETE FROM projects WHERE id = ?').run(projectId);
    return sendJson(res, { deleted: true });
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
          viewCount: 0,
        };

        return sendJson(res, created, 201);
      })
      .catch((error) => sendJson(res, { message: 'Не вдалося створити новину', error: String(error) }, 400));
  }

  function handleUpdateNews(req, res, id) {
    parseBody(req)
      .then((parsed) => {
        const { title, excerpt, category, author, image, featured = false } = parsed || {};

        if (!title || !excerpt || !category || !author) {
          return sendJson(res, { message: 'Поля title, excerpt, category та author є обов’язковими' }, 400);
        }

        const existing = db
          .prepare(
            `SELECT id, title, excerpt, category, author, published_at, image_url, featured, view_count
             FROM news WHERE id = ?`
          )
          .get(id);

        if (!existing) {
          return sendJson(res, { message: 'Новину не знайдено' }, 404);
        }

        const imageUrl = image || existing.image_url;
        db
          .prepare(
            `UPDATE news SET title = ?, excerpt = ?, category = ?, author = ?, image_url = ?, featured = ?
             WHERE id = ?`
          )
          .run(title, excerpt, category, author, imageUrl, featured ? 1 : 0, id);

        const updated = mapNewsRowToItem({
          ...existing,
          title,
          excerpt,
          category,
          author,
          image_url: imageUrl,
          featured,
        });

        return sendJson(res, updated);
      })
      .catch((error) => sendJson(res, { message: 'Не вдалося оновити новину', error: String(error) }, 400));
  }

  function handleDeleteNews(res, id) {
    const existing = db.prepare('SELECT id FROM news WHERE id = ?').get(id);
    if (!existing) {
      return sendJson(res, { message: 'Новину не знайдено' }, 404);
    }

    db.prepare('DELETE FROM news WHERE id = ?').run(id);
    return sendJson(res, { deleted: true });
  }

  function handleCreateUser(req, res) {
    parseBody(req)
      .then((body) => {
        const {
          name,
          email,
          department,
          password,
          is_admin = false,
          jobTitle = '',
          phone = '',
          location = '',
          bio = '',
          tags = [],
          status = 'Активний',
        } = body;

        if (!name || !email || !password) {
          return sendJson(res, { message: 'Поля name, email та password є обов’язковими' }, 400);
        }

        const existing = db.prepare('SELECT id FROM users WHERE LOWER(email) = LOWER(?)').get(email.toLowerCase());
        if (existing) {
          return sendJson(res, { message: 'Користувач з таким email вже існує' }, 409);
        }

        const result = db
          .prepare(
            `INSERT INTO users (name, email, department, password, is_admin, job_title, phone, location, bio, tags, status)
             VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
          )
          .run(
            name,
            email.toLowerCase(),
            department || '',
            password,
            is_admin ? 1 : 0,
            jobTitle,
            phone,
            location,
            bio,
            serializeTags(tags),
            status
          );

        const created = db
          .prepare(
            `SELECT id, name, email, department, is_admin, job_title AS jobTitle, phone, location, bio, tags, status, last_login_at AS lastLoginAt
             FROM users WHERE id = ?`
          )
          .get(result.lastInsertRowid);

        return sendJson(res, formatUserRow(created), 201);
      })
      .catch((error) => sendJson(res, { message: 'Не вдалося створити користувача', error: String(error) }, 400));
  }

  function handleUpdateUser(req, res, userId) {
    parseBody(req)
      .then((body) => {
        const existing = db.prepare(`SELECT id FROM users WHERE id = ?`).get(userId);

        if (!existing) {
          return sendJson(res, { message: 'Користувача не знайдено' }, 404);
        }

        const { name, email, department, password, is_admin, jobTitle, phone, location, bio, tags, status } = body;

        const updater = db.prepare(
          `UPDATE users
           SET name = COALESCE(?, name),
               email = COALESCE(?, email),
               department = COALESCE(?, department),
               password = COALESCE(?, password),
               is_admin = CASE WHEN ? IS NULL THEN is_admin ELSE ? END,
               job_title = COALESCE(?, job_title),
               phone = COALESCE(?, phone),
               location = COALESCE(?, location),
               bio = COALESCE(?, bio),
               tags = COALESCE(?, tags),
               status = COALESCE(?, status)
           WHERE id = ?`
        );

        updater.run(
          name || null,
          email ? email.toLowerCase() : null,
          department || null,
          password || null,
          typeof is_admin === 'undefined' ? null : is_admin ? 1 : 0,
          typeof is_admin === 'undefined' ? null : is_admin ? 1 : 0,
          jobTitle || null,
          phone || null,
          location || null,
          bio || null,
          typeof tags === 'undefined' ? null : serializeTags(tags),
          status || null,
          userId
        );

        const updated = db
          .prepare(
            `SELECT id, name, email, department, is_admin, job_title AS jobTitle, phone, location, bio, tags, status, last_login_at AS lastLoginAt
             FROM users WHERE id = ?`
          )
          .get(userId);

        return sendJson(res, formatUserRow(updated));
      })
      .catch((error) => sendJson(res, { message: 'Не вдалося оновити користувача', error: String(error) }, 400));
  }

  function handleDeleteUser(res, userId) {
    const result = db.prepare('DELETE FROM users WHERE id = ?').run(userId);
    if (!result.changes) {
      return sendJson(res, { message: 'Користувача не знайдено' }, 404);
    }

    return sendJson(res, { deleted: true });
  }

  return {
    handleCreateProject,
    handleUpdateProject,
    handleDeleteProject,
    handleCreateNews,
    handleUpdateNews,
    handleDeleteNews,
    handleCreateUser,
    handleUpdateUser,
    handleDeleteUser,
    getAdminOverview: dataService.getAdminOverview,
  };
}

module.exports = { createAdminHandlers };
