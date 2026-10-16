-- Adda Live database (Cloudflare D1 / SQLite).
-- Apply: npx wrangler d1 execute adda-live --remote --file=server/schema.sql

CREATE TABLE IF NOT EXISTS admins (
  id          INTEGER PRIMARY KEY AUTOINCREMENT,
  username    TEXT NOT NULL UNIQUE,         -- the User ID typed at sign-in (stored lower-case)
  email       TEXT UNIQUE,
  name        TEXT NOT NULL,
  pass_hash   TEXT NOT NULL,              -- pbkdf2-sha256$<iterations>$<salt hex>$<hash hex>
  disabled    INTEGER NOT NULL DEFAULT 0, -- set to 1 to revoke an organiser without deleting history
  created_at  INTEGER NOT NULL DEFAULT (unixepoch() * 1000)
);

CREATE TABLE IF NOT EXISTS sessions (
  token_hash  TEXT PRIMARY KEY,           -- SHA-256 of the cookie value; the raw token is never stored
  admin_id    INTEGER NOT NULL REFERENCES admins(id) ON DELETE CASCADE,
  created_at  INTEGER NOT NULL,
  expires_at  INTEGER NOT NULL,
  ip          TEXT
);
CREATE INDEX IF NOT EXISTS sessions_expiry ON sessions(expires_at);

CREATE TABLE IF NOT EXISTS login_attempts (
  ip  TEXT NOT NULL,
  at  INTEGER NOT NULL
);
CREATE INDEX IF NOT EXISTS login_attempts_ip ON login_attempts(ip, at);

CREATE TABLE IF NOT EXISTS streams (
  id                TEXT PRIMARY KEY,
  title             TEXT NOT NULL,
  status            TEXT NOT NULL CHECK (status IN ('starting', 'live', 'ended', 'archived', 'failed')),
  started_by        INTEGER NOT NULL REFERENCES admins(id),
  started_at        INTEGER NOT NULL,     -- when the organiser pressed Start streaming (ms)
  went_live_at      INTEGER,              -- when video actually reached IVS
  last_seen_at      INTEGER,              -- last time IVS reported the channel broadcasting
  checked_at        INTEGER,
  ended_at          INTEGER,
  ended_reason      TEXT,                 -- ended-by-organiser | signal-lost | never-connected | broadcast-failed | replaced | conflict | ingest-error
  ivs_stream_id     TEXT,
  recording_prefix  TEXT,                 -- S3 key prefix from the IVS Recording State Change event
  duration_ms       INTEGER
);
CREATE INDEX IF NOT EXISTS streams_status ON streams(status, started_at DESC);
CREATE INDEX IF NOT EXISTS streams_ivs ON streams(ivs_stream_id);
