const http = require('http');
const nodemailer = require('nodemailer');
const path = require('path');
const { getDb, runMigrations, DB_PATH } = require('./db');
const config = require('./config');

const { normalizePath, sendJson, parseBody } = require('./server/utils/http');
const { createSessionService } = require('./server/services/sessions');
const { ensureDefaultUsers, createDataService, formatUserRow, mapNewsRowToItem } = require('./server/services/data');
const { createAuthHandlers } = require('./server/handlers/authHandlers');
const { createAdminHandlers } = require('./server/handlers/adminHandlers');
const { createProfileHandlers } = require('./server/handlers/profileHandlers');
const { createPublicHandlers } = require('./server/handlers/publicHandlers');

runMigrations();
const db = getDb();
ensureDefaultUsers(db);

const sessionService = createSessionService(db);
const dataService = createDataService(db);

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

const authHandlers = createAuthHandlers({
  db,
  parseBody,
  sendJson,
  sessionService,
  emailTransport,
  config,
});

const adminHandlers = createAdminHandlers({
  db,
  parseBody,
  sendJson,
  dataService,
  formatUserRow,
  mapNewsRowToItem,
});

const profileHandlers = createProfileHandlers({
  db,
  parseBody,
  sendJson,
  sessionService,
});

const publicHandlers = createPublicHandlers({
  sendJson,
  dataService,
});

const port = config.port;

const server = http.createServer((req, res) => {
  const url = new URL(req.url || '', `http://${req.headers.host}`);
  const pathname = normalizePath(url.pathname);

  if (req.method === 'OPTIONS') {
    return sendJson(res, { status: 'ok' });
  }

  if (req.method === 'GET' && pathname === '/api/health') {
    return publicHandlers.handleHealth(res, path.basename(DB_PATH));
  }

  if (req.method === 'GET' && pathname === '/api/dashboard') {
    return publicHandlers.handleDashboard(res);
  }

  if (req.method === 'GET' && pathname === '/api/news') {
    return publicHandlers.handleNews(res);
  }

  if (req.method === 'GET' && pathname === '/api/documents') {
    return publicHandlers.handleDocuments(res);
  }

  if (pathname.startsWith('/api/admin')) {
    const adminUser = sessionService.requireAdmin(req, res);
    if (!adminUser) return;

    if (req.method === 'GET' && pathname === '/api/admin/overview') {
      return sendJson(res, adminHandlers.getAdminOverview());
    }

    if (req.method === 'GET' && pathname === '/api/admin/users') {
      return sendJson(res, dataService.getAllUsers());
    }

    if (req.method === 'POST' && pathname === '/api/admin/users') {
      return adminHandlers.handleCreateUser(req, res);
    }

    const userMatch = pathname.match(/^\/api\/admin\/users\/(\d+)$/);
    if (userMatch && req.method === 'PUT') {
      return adminHandlers.handleUpdateUser(req, res, Number(userMatch[1]));
    }

    if (userMatch && req.method === 'DELETE') {
      return adminHandlers.handleDeleteUser(res, Number(userMatch[1]));
    }

    if (req.method === 'POST' && pathname === '/api/admin/projects') {
      return adminHandlers.handleCreateProject(req, res);
    }

    const projectMatch = pathname.match(/^\/api\/admin\/projects\/(\d+)$/);
    if (projectMatch && req.method === 'PUT') {
      return adminHandlers.handleUpdateProject(req, res, Number(projectMatch[1]));
    }

    if (projectMatch && req.method === 'DELETE') {
      return adminHandlers.handleDeleteProject(res, Number(projectMatch[1]));
    }

    if (req.method === 'POST' && pathname === '/api/admin/news') {
      return adminHandlers.handleCreateNews(req, res);
    }

    const newsMatch = pathname.match(/^\/api\/admin\/news\/(\d+)$/);
    if (newsMatch && req.method === 'PUT') {
      return adminHandlers.handleUpdateNews(req, res, Number(newsMatch[1]));
    }

    if (newsMatch && req.method === 'DELETE') {
      return adminHandlers.handleDeleteNews(res, Number(newsMatch[1]));
    }
  }

  if (req.method === 'GET' && pathname === '/api/profile') {
    return profileHandlers.handleGetProfile(req, res);
  }

  if (req.method === 'POST' && pathname === '/api/profile/status') {
    return profileHandlers.handleUpdateProfileStatus(req, res);
  }

  if (req.method === 'POST' && pathname === '/api/auth/login') {
    return authHandlers.handleLogin(req, res);
  }

  if (req.method === 'POST' && pathname === '/api/auth/register-request') {
    return authHandlers.handleRegisterRequest(req, res);
  }

  if (req.method === 'POST' && pathname === '/api/auth/complete-registration') {
    return authHandlers.handleCompleteRegistration(req, res);
  }

  if (req.method === 'POST' && pathname === '/api/auth/logout') {
    return authHandlers.handleLogout(req, res);
  }

  return sendJson(res, { message: 'Not found' }, 404);
});

server.listen(port, () => {
  console.log(`API server running on port ${port}`);
});
