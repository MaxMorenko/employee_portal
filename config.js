const path = require('path');

const dbFilename = process.env.DB_FILENAME || 'employee_portal.sqlite';

module.exports = {
  port: parseInt(process.env.PORT || '4000', 10),
  appBaseUrl: process.env.APP_BASE_URL || 'http://localhost:5173',
  db: {
    filename: dbFilename,
  },
  smtp: {
    host: process.env.SMTP_HOST || '',
    port: parseInt(process.env.SMTP_PORT || '587', 10),
    secure: process.env.SMTP_SECURE === 'true',
    user: process.env.SMTP_USER || '',
    pass: process.env.SMTP_PASS || '',
    from: process.env.SMTP_FROM || 'no-reply@company.com',
  },
  registration: {
    tokenHours: parseInt(process.env.REG_TOKEN_HOURS || '24', 10),
  },
  paths: {
    projectRoot: __dirname,
    dbDir: path.join(__dirname, 'db'),
  },
};
