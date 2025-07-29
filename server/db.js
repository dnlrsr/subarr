const path = require('path');
const Database = require('better-sqlite3');

const dbPath = path.join(__dirname, 'youtubarr.db'); // Always use youtubarr.db from the server folder
const db = new Database(dbPath);

// Create tables if they don't exist
db.exec(`
CREATE TABLE IF NOT EXISTS playlists (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  playlist_id TEXT NOT NULL UNIQUE,
  author_name TEXT,
  author_uri TEXT,
  title TEXT,
  check_interval_minutes INTEGER DEFAULT 60,
  regex_filter TEXT,
  last_checked TEXT,
  thumbnail TEXT,
  source TEXT DEFAULT 'manual'
);

CREATE TABLE IF NOT EXISTS videos (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  playlist_id INTEGER,
  video_id TEXT NOT NULL UNIQUE,
  title TEXT,
  published_at TEXT,
  thumbnail TEXT
);

CREATE TABLE IF NOT EXISTS activity (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  datetime TEXT NOT NULL,
  playlist_id TEXT,
  title TEXT,
  url TEXT,
  message TEXT,
  icon TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS settings (
  key TEXT PRIMARY KEY,
  value TEXT
);

CREATE TABLE IF NOT EXISTS post_processors (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  type TEXT NOT NULL,
  target TEXT NOT NULL,
  data TEXT NOT NULL
);
`);

module.exports = db;