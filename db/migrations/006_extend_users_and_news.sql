ALTER TABLE users ADD COLUMN job_title TEXT DEFAULT '';
ALTER TABLE users ADD COLUMN phone TEXT DEFAULT '';
ALTER TABLE users ADD COLUMN location TEXT DEFAULT '';
ALTER TABLE users ADD COLUMN bio TEXT DEFAULT '';
ALTER TABLE users ADD COLUMN tags TEXT DEFAULT '[]';
ALTER TABLE users ADD COLUMN status TEXT DEFAULT 'Активний';
ALTER TABLE users ADD COLUMN last_login_at TEXT;

ALTER TABLE news ADD COLUMN view_count INTEGER NOT NULL DEFAULT 0;

UPDATE users SET job_title = COALESCE(job_title, ''),
  phone = COALESCE(phone, ''),
  location = COALESCE(location, ''),
  bio = COALESCE(bio, ''),
  tags = COALESCE(tags, '[]'),
  status = COALESCE(status, 'Активний')
WHERE 1=1;

UPDATE news SET view_count = COALESCE(view_count, 0) WHERE 1=1;
