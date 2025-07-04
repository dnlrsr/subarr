const Database = require('better-sqlite3');
const db = new Database('youtubarr.db');

// Create tables if they don't exist
db.exec(`
CREATE TABLE IF NOT EXISTS playlists (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  playlist_id TEXT NOT NULL,
  title TEXT,
  check_interval_minutes INTEGER DEFAULT 60,
  regex_filter TEXT,
  last_checked TEXT,
  thumbnail TEXT
);

CREATE TABLE IF NOT EXISTS videos (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  playlist_id INTEGER,
  video_id TEXT,
  title TEXT,
  published_at TEXT,
  notified INTEGER DEFAULT 0,
  thumbnail TEXT
);

CREATE TABLE IF NOT EXISTS settings (
  key TEXT PRIMARY KEY,
  value TEXT
);
`);

module.exports = db;