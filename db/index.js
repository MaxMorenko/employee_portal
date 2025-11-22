const path = require('path');
const fs = require('fs');
const Database = require('better-sqlite3');
const config = require('../config');

const DB_FILENAME = config.db.filename;
const DB_PATH = path.isAbsolute(DB_FILENAME)
  ? DB_FILENAME
  : path.join(__dirname, DB_FILENAME);
const MIGRATIONS_DIR = path.join(__dirname, 'migrations');

let dbInstance;

function ensureMigrationsTable(db) {
  db.prepare(
    `CREATE TABLE IF NOT EXISTS migrations (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL UNIQUE,
      run_at TEXT NOT NULL DEFAULT (datetime('now'))
    )`
  ).run();
}

function getPendingMigrations(db) {
  const applied = new Set(
    db.prepare('SELECT name FROM migrations ORDER BY id').all().map((row) => row.name)
  );
  return fs
    .readdirSync(MIGRATIONS_DIR)
    .filter((file) => file.endsWith('.sql'))
    .sort()
    .filter((file) => !applied.has(file));
}

function applyMigration(db, fileName) {
  const fullPath = path.join(MIGRATIONS_DIR, fileName);
  const sql = fs.readFileSync(fullPath, 'utf8');
  const statements = sql
    .split(/;\s*(?:\n|$)/g)
    .map((stmt) => stmt.trim())
    .filter((stmt) => stmt.length);

  const transaction = db.transaction(() => {
    statements.forEach((statement) => {
      db.prepare(statement).run();
    });
    db.prepare('INSERT INTO migrations (name) VALUES (?)').run(fileName);
  });

  transaction();
  return fileName;
}

function runMigrations() {
  const dbDir = path.dirname(DB_PATH);
  if (!fs.existsSync(dbDir)) {
    fs.mkdirSync(dbDir, { recursive: true });
  }

  if (!fs.existsSync(DB_PATH)) {
    fs.closeSync(fs.openSync(DB_PATH, 'w'));
  }

  const db = getDb();
  ensureMigrationsTable(db);

  const pending = getPendingMigrations(db);
  pending.forEach((migration) => {
    applyMigration(db, migration);
    console.log(`Applied migration: ${migration}`);
  });
}

function getDb() {
  if (!dbInstance) {
    dbInstance = new Database(DB_PATH);
    dbInstance.pragma('foreign_keys = ON');
  }
  return dbInstance;
}

module.exports = {
  getDb,
  runMigrations,
  DB_PATH,
};
