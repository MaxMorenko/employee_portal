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

const routes = [
  {
    method: 'OPTIONS',
    matcher: /.*/,
    handler: (_req, res) => sendJson(res, { status: 'ok' }),
  },
  {
    method: 'GET',
    matcher: '/api/health',
    handler: (_req, res) => publicHandlers.handleHealth(res, path.basename(DB_PATH)),
  },
  {
    method: 'GET',
    matcher: '/api/dashboard',
    handler: (_req, res) => publicHandlers.handleDashboard(res),
  },
  {
    method: 'GET',
    matcher: '/api/news',
    handler: (_req, res) => publicHandlers.handleNews(res),
  },
  {
    method: 'GET',
    matcher: '/api/documents',
    handler: (_req, res) => publicHandlers.handleDocuments(res),
  },
  {
    method: 'GET',
    matcher: '/api/profile',
    handler: (req, res) => profileHandlers.handleGetProfile(req, res),
  },
  {
    method: 'POST',
    matcher: '/api/profile/status',
    handler: (req, res) => profileHandlers.handleUpdateProfileStatus(req, res),
  },
  {
    method: 'POST',
    matcher: '/api/auth/login',
    handler: (req, res) => authHandlers.handleLogin(req, res),
  },
  {
    method: 'POST',
    matcher: '/api/auth/register-request',
    handler: (req, res) => authHandlers.handleRegisterRequest(req, res),
  },
  {
    method: 'POST',
    matcher: '/api/auth/complete-registration',
    handler: (req, res) => authHandlers.handleCompleteRegistration(req, res),
  },
  {
    method: 'POST',
    matcher: '/api/auth/logout',
    handler: (req, res) => authHandlers.handleLogout(req, res),
  },
  {
    method: 'GET',
    matcher: '/api/admin/overview',
    requireAdmin: true,
    handler: (_req, res) => sendJson(res, adminHandlers.getAdminOverview()),
  },
  {
    method: 'GET',
    matcher: '/api/admin/users',
    requireAdmin: true,
    handler: (_req, res) => sendJson(res, dataService.getAllUsers()),
  },
  {
    method: 'POST',
    matcher: '/api/admin/users',
    requireAdmin: true,
    handler: (req, res) => adminHandlers.handleCreateUser(req, res),
  },
  {
    method: 'PUT',
    matcher: /^\/api\/admin\/users\/(\d+)$/,
    requireAdmin: true,
    handler: (req, res, [userId]) => adminHandlers.handleUpdateUser(req, res, Number(userId)),
  },
  {
    method: 'DELETE',
    matcher: /^\/api\/admin\/users\/(\d+)$/,
    requireAdmin: true,
    handler: (_req, res, [userId]) => adminHandlers.handleDeleteUser(res, Number(userId)),
  },
  {
    method: 'POST',
    matcher: '/api/admin/projects',
    requireAdmin: true,
    handler: (req, res) => adminHandlers.handleCreateProject(req, res),
  },
  {
    method: 'PUT',
    matcher: /^\/api\/admin\/projects\/(\d+)$/,
    requireAdmin: true,
    handler: (req, res, [projectId]) => adminHandlers.handleUpdateProject(req, res, Number(projectId)),
  },
  {
    method: 'DELETE',
    matcher: /^\/api\/admin\/projects\/(\d+)$/,
    requireAdmin: true,
    handler: (_req, res, [projectId]) => adminHandlers.handleDeleteProject(res, Number(projectId)),
  },
  {
    method: 'POST',
    matcher: '/api/admin/news',
    requireAdmin: true,
    handler: (req, res) => adminHandlers.handleCreateNews(req, res),
  },
  {
    method: 'PUT',
    matcher: /^\/api\/admin\/news\/(\d+)$/,
    requireAdmin: true,
    handler: (req, res, [newsId]) => adminHandlers.handleUpdateNews(req, res, Number(newsId)),
  },
  {
    method: 'DELETE',
    matcher: /^\/api\/admin\/news\/(\d+)$/,
    requireAdmin: true,
    handler: (_req, res, [newsId]) => adminHandlers.handleDeleteNews(res, Number(newsId)),
  },
];

function findRoute(method, pathname) {
  for (const route of routes) {
    if (route.method !== method) continue;

    if (typeof route.matcher === 'string' && route.matcher === pathname) {
      return { route, params: [] };
    }

    if (route.matcher instanceof RegExp) {
      const match = pathname.match(route.matcher);
      if (match) {
        return { route, params: match.slice(1) };
      }
    }
  }

  return null;
}

const server = http.createServer((req, res) => {
  const url = new URL(req.url || '', `http://${req.headers.host}`);
  const pathname = normalizePath(url.pathname);

  const match = findRoute(req.method, pathname);

  if (!match) {
    return sendJson(res, { message: 'Not found' }, 404);
  }

  if (match.route.requireAdmin) {
    const adminUser = sessionService.requireAdmin(req, res);
    if (!adminUser) return;
  }

  return match.route.handler(req, res, match.params);
});

server.listen(port, () => {
  console.log(`API server running on port ${port}`);
});
