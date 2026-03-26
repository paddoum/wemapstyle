-- D1 (SQLite) schema for WemapStyle
-- Deploy with: wrangler d1 execute wemapstyle --file=schema.d1.sql

CREATE TABLE IF NOT EXISTS sessions (
  id              INTEGER PRIMARY KEY AUTOINCREMENT,
  name            TEXT NOT NULL,
  prompt          TEXT,
  palette         TEXT,  -- JSON stored as TEXT
  thumbnail       TEXT,
  wemap_asset_id  TEXT,  -- Wemap asset ID after first push; used for updates
  created_at      TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at      TEXT NOT NULL DEFAULT (datetime('now'))
);
