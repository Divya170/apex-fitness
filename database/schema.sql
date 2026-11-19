-- Apex Fitness Club — SQLite schema (idempotent; applied by the backend on start-up)
PRAGMA foreign_keys = ON;

CREATE TABLE IF NOT EXISTS settings (
  key   TEXT PRIMARY KEY,
  value TEXT NOT NULL DEFAULT ''
);

-- Training programs (Strength, Cardio, Group, Personal + any further confirmed ones)
CREATE TABLE IF NOT EXISTS programs (
  id             INTEGER PRIMARY KEY AUTOINCREMENT,
  slug           TEXT NOT NULL UNIQUE,
  name           TEXT NOT NULL,
  summary        TEXT NOT NULL DEFAULT '',
  details        TEXT NOT NULL DEFAULT '',     -- format / who it's for, once confirmed
  benefits       TEXT NOT NULL DEFAULT '[]',   -- JSON array, only confirmed benefits
  image          TEXT NOT NULL DEFAULT '/art/scene-space.svg',
  accent         TEXT NOT NULL DEFAULT 'lime', -- lime | orange
  sort_order     INTEGER NOT NULL DEFAULT 0,
  is_placeholder INTEGER NOT NULL DEFAULT 0,
  published      INTEGER NOT NULL DEFAULT 1,
  created_at     TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ','now')),
  updated_at     TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ','now'))
);

-- Membership plans. price_cents stays NULL until the club supplies pricing.
CREATE TABLE IF NOT EXISTS plans (
  id             INTEGER PRIMARY KEY AUTOINCREMENT,
  slug           TEXT NOT NULL UNIQUE,
  name           TEXT NOT NULL,
  price_cents    INTEGER,
  billing        TEXT NOT NULL DEFAULT '',     -- e.g. "per month"
  facilities     TEXT NOT NULL DEFAULT '[]',   -- JSON arrays
  services       TEXT NOT NULL DEFAULT '[]',
  benefits       TEXT NOT NULL DEFAULT '[]',
  sort_order     INTEGER NOT NULL DEFAULT 0,
  is_placeholder INTEGER NOT NULL DEFAULT 0,
  published      INTEGER NOT NULL DEFAULT 1,
  created_at     TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ','now')),
  updated_at     TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ','now'))
);

-- Membership benefits (only confirmed ones should be published)
CREATE TABLE IF NOT EXISTS benefits (
  id             INTEGER PRIMARY KEY AUTOINCREMENT,
  title          TEXT NOT NULL,
  detail         TEXT NOT NULL DEFAULT '',
  icon           TEXT NOT NULL DEFAULT 'access',  -- access | group | clock | coach
  sort_order     INTEGER NOT NULL DEFAULT 0,
  is_placeholder INTEGER NOT NULL DEFAULT 0,
  published      INTEGER NOT NULL DEFAULT 1,
  created_at     TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ','now')),
  updated_at     TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ','now'))
);

-- Weekly training schedule (empty until the club supplies it)
CREATE TABLE IF NOT EXISTS sessions (
  id           INTEGER PRIMARY KEY AUTOINCREMENT,
  day          INTEGER NOT NULL CHECK (day BETWEEN 0 AND 6), -- 0 = Monday
  start_time   TEXT NOT NULL,                                -- HH:MM (24h)
  end_time     TEXT NOT NULL DEFAULT '',
  title        TEXT NOT NULL,
  program_id   INTEGER REFERENCES programs(id) ON DELETE SET NULL,
  level        TEXT NOT NULL DEFAULT '',
  coach        TEXT NOT NULL DEFAULT '',
  info         TEXT NOT NULL DEFAULT '',
  published    INTEGER NOT NULL DEFAULT 1,
  created_at   TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ','now')),
  updated_at   TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ','now'))
);

CREATE TABLE IF NOT EXISTS facilities (
  id             INTEGER PRIMARY KEY AUTOINCREMENT,
  name           TEXT NOT NULL,
  description    TEXT NOT NULL DEFAULT '',
  image          TEXT NOT NULL DEFAULT '/art/scene-space.svg',
  sort_order     INTEGER NOT NULL DEFAULT 0,
  is_placeholder INTEGER NOT NULL DEFAULT 0,
  published      INTEGER NOT NULL DEFAULT 1,
  created_at     TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ','now')),
  updated_at     TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ','now'))
);

CREATE TABLE IF NOT EXISTS gallery_images (
  id             INTEGER PRIMARY KEY AUTOINCREMENT,
  title          TEXT NOT NULL,
  category       TEXT NOT NULL,   -- Gym Equipment | Strength Training | Cardio | Group Activities | Training Environment
  image          TEXT NOT NULL,
  alt            TEXT NOT NULL DEFAULT '',
  ratio          TEXT NOT NULL DEFAULT '4 / 3',
  featured       INTEGER NOT NULL DEFAULT 0,
  sort_order     INTEGER NOT NULL DEFAULT 0,
  is_placeholder INTEGER NOT NULL DEFAULT 0,
  published      INTEGER NOT NULL DEFAULT 1,
  created_at     TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ','now')),
  updated_at     TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ','now'))
);

-- Business hours rows; value NULL means "not supplied yet"
CREATE TABLE IF NOT EXISTS hours (
  id          INTEGER PRIMARY KEY AUTOINCREMENT,
  label       TEXT NOT NULL,     -- e.g. "Monday – Friday"
  value       TEXT,              -- e.g. "5:00 AM – 10:00 PM"
  sort_order  INTEGER NOT NULL DEFAULT 0,
  created_at  TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ','now')),
  updated_at  TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ','now'))
);

-- Verified trainers only — the Home section is hidden while this is empty
CREATE TABLE IF NOT EXISTS trainers (
  id             INTEGER PRIMARY KEY AUTOINCREMENT,
  name           TEXT NOT NULL,
  role           TEXT NOT NULL DEFAULT '',
  bio            TEXT NOT NULL DEFAULT '',
  qualifications TEXT NOT NULL DEFAULT '',
  photo          TEXT NOT NULL DEFAULT '',
  sort_order     INTEGER NOT NULL DEFAULT 0,
  published      INTEGER NOT NULL DEFAULT 1,
  created_at     TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ','now')),
  updated_at     TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ','now'))
);

-- Testimonials: publishable only with confirmed member permission
CREATE TABLE IF NOT EXISTS testimonials (
  id                INTEGER PRIMARY KEY AUTOINCREMENT,
  quote             TEXT NOT NULL,
  attribution       TEXT NOT NULL DEFAULT '',
  consent_confirmed INTEGER NOT NULL DEFAULT 0,
  sort_order        INTEGER NOT NULL DEFAULT 0,
  published         INTEGER NOT NULL DEFAULT 0,
  created_at        TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ','now')),
  updated_at        TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ','now'))
);

CREATE TABLE IF NOT EXISTS membership_inquiries (
  id            INTEGER PRIMARY KEY AUTOINCREMENT,
  reference     TEXT NOT NULL UNIQUE,
  name          TEXT NOT NULL,
  email         TEXT NOT NULL,
  phone         TEXT NOT NULL DEFAULT '',
  plan_id       INTEGER REFERENCES plans(id) ON DELETE SET NULL,
  plan_name     TEXT NOT NULL DEFAULT '',
  program_id    INTEGER REFERENCES programs(id) ON DELETE SET NULL,
  program_name  TEXT NOT NULL DEFAULT '',
  message       TEXT NOT NULL DEFAULT '',
  consent       INTEGER NOT NULL DEFAULT 0,
  status        TEXT NOT NULL DEFAULT 'new',   -- new | contacted | joined | closed
  notes         TEXT NOT NULL DEFAULT '',
  ip_hash       TEXT NOT NULL DEFAULT '',
  created_at    TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ','now')),
  updated_at    TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ','now'))
);

CREATE TABLE IF NOT EXISTS contact_messages (
  id         INTEGER PRIMARY KEY AUTOINCREMENT,
  reference  TEXT NOT NULL UNIQUE,
  name       TEXT NOT NULL,
  email      TEXT NOT NULL,
  phone      TEXT NOT NULL DEFAULT '',
  topic      TEXT NOT NULL,
  message    TEXT NOT NULL,
  consent    INTEGER NOT NULL DEFAULT 0,
  status     TEXT NOT NULL DEFAULT 'new',     -- new | replied | closed
  notes      TEXT NOT NULL DEFAULT '',
  ip_hash    TEXT NOT NULL DEFAULT '',
  created_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ','now')),
  updated_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ','now'))
);

CREATE INDEX IF NOT EXISTS idx_programs_pub  ON programs(published, sort_order);
CREATE INDEX IF NOT EXISTS idx_plans_pub     ON plans(published, sort_order);
CREATE INDEX IF NOT EXISTS idx_sessions_day  ON sessions(published, day, start_time);
CREATE INDEX IF NOT EXISTS idx_gallery_cat   ON gallery_images(published, category, sort_order);
CREATE INDEX IF NOT EXISTS idx_inq_status    ON membership_inquiries(status, created_at);
CREATE INDEX IF NOT EXISTS idx_inq_dupe      ON membership_inquiries(email, created_at);
CREATE INDEX IF NOT EXISTS idx_msg_status    ON contact_messages(status, created_at);
