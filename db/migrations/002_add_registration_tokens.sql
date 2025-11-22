CREATE TABLE IF NOT EXISTS registration_tokens (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  email TEXT NOT NULL,
  name TEXT,
  department TEXT,
  token TEXT NOT NULL UNIQUE,
  expires_at TEXT NOT NULL,
  used INTEGER NOT NULL DEFAULT 0,
  used_at TEXT
);

CREATE INDEX IF NOT EXISTS idx_registration_tokens_email ON registration_tokens(email);
