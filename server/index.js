const express = require('express');
const cors = require('cors');
const db = require('./db');
const { parseVideosFromFeed } = require('./rssParser');
const { schedulePolling, updateYtSubsPlaylists } = require('./polling');

const playlists = db.prepare('SELECT * FROM playlists').all();
for (const playlist of playlists) {
  schedulePolling(playlist);
}

// Schedule YTSubs.app polling
setInterval(() => {
  updateYtSubsPlaylists();
}, 60 * 60 * 1000); // YTSubs.app data only updates every 12 hours, but it might be changed to be less
updateYtSubsPlaylists(); // also run on startup

const app = express();
app.use(cors());
app.use(express.json());
const PORT = 3001; //Todo: update port in the future (this is probably a pretty common port). Maybe use a settings.json defined port?

app.get('/api/playlists', (req, res) => {
  const rows = db.prepare('SELECT * FROM playlists').all();
  res.json(rows);
});

app.post('/api/playlists', async (req, res) => {
  const { playlistId } = req.body;
  if (!/^(PL|UU|LL|FL)[\w-]{10,}$/.test(playlistId)) {
    return res.status(400).json({ error: 'Invalid playlist ID' });
  }

  const settings = Object.fromEntries(db.prepare('SELECT key, value FROM settings').all().map(row => [row.key, row.value]));
  const exclude_shorts = (settings.exclude_shorts ?? 'false') === 'true'; // SQLite can't store bool
  if (exclude_shorts) {
    playlistId = playlistId.replace(/^^UU(?!LF)/, 'UULF'); // Reference: other possible prefixes: https://stackoverflow.com/a/77816885
  }

  try {
    let playlistDbId = null;
    await parseVideosFromFeed(playlistId, playlist => {
      const stmt = db.prepare(`
        INSERT INTO playlists (playlist_id, author_name, author_uri, title, check_interval_minutes, regex_filter, last_checked, thumbnail, source)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'manual')
      `);
  
      const info = stmt.run(playlistId, playlist.author_name, playlist.author_uri, playlist.title, 60, '', null, playlist.thumbnail);
      playlistDbId = info.lastInsertRowid;

      db.prepare(`INSERT INTO activity (datetime, playlist_id, title, url, message, icon) VALUES (?, ?, ?, ?, ?, ?)`)
      .run(new Date().toISOString(), playlistId, playlist.title, `https://www.youtube.com/playlist?list=${playlistId}`, 'Playlist added (manual)', 'view-list');
  
      // Fetch newly added playlist to pass into schedulePolling
      const newPlaylist = db.prepare('SELECT * FROM playlists WHERE playlist_id = ?').get(playlistId);
      schedulePolling(newPlaylist);
    });

    res.status(201).json({ id: playlistDbId });
  } catch (err) {
    console.error('Failed to fetch RSS feed', err);
    res.status(500).json({ error: 'Failed to fetch playlist metadata' });
  }
});

app.get('/api/playlists/:id', (req, res) => {
  const playlist = db.prepare('SELECT * FROM playlists WHERE id = ?').get(req.params.id);
  if (!playlist) return res.status(404).json({ error: 'Not found' });

  const videos = db.prepare('SELECT * FROM videos WHERE playlist_id = ? ORDER BY published_at DESC').all(playlist.playlist_id);
  res.json({ playlist, videos });
});

app.put('/api/playlists/:id/settings', (req, res) => {
  const { check_interval_minutes, regex_filter } = req.body;
  const stmt = db.prepare(`
    UPDATE playlists
    SET check_interval_minutes = ?, regex_filter = ?
    WHERE id = ?
  `);
  stmt.run(check_interval_minutes, regex_filter, req.params.id);

  const updatedPlaylist = db.prepare('SELECT * FROM playlists WHERE id = ?').get(req.params.id);
  schedulePolling(updatedPlaylist); // reschedules with updated values

  res.json({ success: true });
});

app.delete('/api/playlists/:id', (req, res) => {
  const playlist = db.prepare('SELECT * FROM playlists WHERE id = ?').get(req.params.id);
  if (!playlist) {
    return res.status(404).json({ error: 'Not found' });
  }

  db.prepare('DELETE FROM playlists WHERE id = ?').run(req.params.id);
  db.prepare('DELETE FROM videos WHERE playlist_id = ?').run(playlist.playlist_id);

  db.prepare(`INSERT INTO activity (datetime, playlist_id, title, url, message, icon) VALUES (?, ?, ?, ?, ?, ?)`)
  .run(new Date().toISOString(), playlistId, playlist.title, `https://www.youtube.com/playlist?list=${playlistId}`, 'Playlist removed (manual)', 'trash');

  res.json({ success: true });
});

app.get('/api/activity/:page', (req, res) => {
  const pageSize = 20;

  // Total count
  const totalCountRow = db.prepare(`SELECT COUNT(*) as count FROM activity`).get();
  const totalPages = Math.ceil(totalCountRow.count / pageSize);

  // Clamp requested page between 1 and totalPages
  const requestedPage = parseInt(req.params.page) || 1;
  const page = Math.min(Math.max(1, requestedPage), totalPages);
  const offset = (page - 1) * pageSize;

  // Paged result with playlist title
  const activities = db.prepare(`
    SELECT a.id, a.datetime, a.playlist_id, a.title, a.url, a.message, a.icon, p.id AS playlist_db_id, p.title AS playlist_title
    FROM activity a
    LEFT JOIN playlists p ON a.playlist_id = p.playlist_id
    ORDER BY a.id DESC
    LIMIT ? OFFSET ?
  `).all(pageSize, offset);

  res.json({
    page,
    totalPages,
    activities
  });
});

app.get('/api/settings', (req, res) => {
  const rows = db.prepare('SELECT key, value FROM settings').all();
  const settings = Object.fromEntries(rows.map(row => [row.key, row.value]));
  res.json(settings);
});

app.put('/api/settings', (req, res) => {
  const settings = req.body; // Expecting an array of { key, value }

  if (!Array.isArray(settings)) {
    return res.status(400).json({ error: 'Request body must be an array' });
  }

  const stmt = db.prepare(`
    INSERT INTO settings (key, value)
    VALUES (?, ?)
    ON CONFLICT(key) DO UPDATE SET value = excluded.value
  `);

  const insertMany = db.transaction((settingsArray) => {
    for (const { key, value } of settingsArray) {
      stmt.run(key, value);
    }
  });

  try {
    insertMany(settings);
    res.json({ success: true });
  } catch (err) {
    console.error('Failed to update settings:', err);
    res.status(500).json({ error: 'Failed to update settings' });
  }
});


app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});