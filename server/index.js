require('dotenv').config();
const express = require('express');
const cors = require('cors');
const db = require('./db');
const path = require('path');
const { parseVideosFromFeed } = require('./rssParser');
const { schedulePolling, updateYtSubsPlaylists, removePolling } = require('./polling');
const { getPostProcessors, runPostProcessor } = require('./postProcessors');

const playlists = db.prepare('SELECT * FROM playlists').all();
for (const playlist of playlists) {
  schedulePolling(playlist);
}

//Todo: I should eventually move all db queries to the db.js file

// Schedule YTSubs.app polling
setInterval(() => {
  updateYtSubsPlaylists();
}, 60 * 60 * 1000); // YTSubs.app data only updates every 12 hours, but it might be changed to be less
updateYtSubsPlaylists(); // also run on startup

const app = express();
app.use(cors());
app.use(express.json());

app.get('/api/playlists', (req, res) => {
  const rows = db.prepare('SELECT * FROM playlists').all();
  res.json(rows);
});

app.post('/api/playlists', async (req, res) => {
  let { playlistId } = req.body;
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
  }
  catch (err) {
    if (err.message.includes('UNIQUE constraint failed')) {
      res.status(500).json({ error: 'Playlist is already added' });
    }

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

  removePolling(playlist.playlist_id);

  db.prepare('DELETE FROM playlists WHERE id = ?').run(req.params.id);
  db.prepare('DELETE FROM videos WHERE playlist_id = ?').run(playlist.playlist_id);

  db.prepare(`INSERT INTO activity (datetime, playlist_id, title, url, message, icon) VALUES (?, ?, ?, ?, ?, ?)`)
  .run(new Date().toISOString(), playlist.id, playlist.title, `https://www.youtube.com/playlist?list=${playlist.id}`, 'Playlist removed (manual)', 'trash');

  res.json({ success: true });
});

app.get('/api/search', async (req, res) => {
  try {
    let playlistInfo;
  
    const hasValidPlaylistId = query => /(UC|UU|PL|LL|FL)[\w-]{10,}/.test(query);
    if (hasValidPlaylistId(req.query.q)) {
      await parseVideosFromFeed(req.query.q, playlist => { // Todo: this will print a number of things to the server console output if it fails, so we should try to prevent that
        playlistInfo = playlist
      });
    }
    else if (/(https:\/\/)?(www\.)?youtube\.com\/(@|channel)/.test(req.query.q)) {
      // If this is a youtube channel URL, we can actually find the uploads playlist by grepping it from the HTML source code of the webpage
      // Todo: using a technique like this (parsing the HTML source code) might actually be able to get us the channel thumbnail, description, etc
      const response = await fetch(req.query.q);
      const responseText = await response.text();
      const matches = [...responseText.matchAll(/https:\/\/www\.youtube\.com\/feeds\/videos\.xml\?channel_id=(UC|UU|PL|LL|FL)[\w-]{10,}/g)];

      if (matches.length > 0 && matches[0][0]) {
        console.log(`Successfully grabbed channel playlist id from source code of ${req.query.q}`);
        await parseVideosFromFeed(matches[0][0].match(/(UC|UU|PL|LL|FL)[\w-]{10,}/)[0].replace(/^UC/, 'UU'), playlist => { // Todo: this will print a number of things to the server console output if it fails, so we should try to prevent that
          playlistInfo = playlist
        });
      }
      else {
        throw new Error(`Could not extract playlist id from source code of ${req.query.q}`);
      }
    }
    else {
      throw new Error(`Could not understand '${req.query.q}'`);
    }
  
    res.json(playlistInfo);
  }
  catch (err) {
    console.error('Failed to parse playlist:', err.message);
    res.status(400).json({ error: `Failed to get playlist information for ${req.query.q}` });
  }
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

app.get('/api/postprocessors', (req, res) => {
  res.json(getPostProcessors());
});

app.post('/api/postprocessors', (req, res) => {
  const { name, type, target, data } = req.body;
  if (!name || !type || !target || !data)
    return res.status(400).json({ error: 'Missing fields' });

  const stmt = db.prepare(`
    INSERT INTO post_processors (name, type, target, data)
    VALUES (?, ?, ?, ?)
  `);
  const result = stmt.run(name, type, target, data);

  res.status(201).json({ success: true, id: result.lastInsertRowid });
});

app.put('/api/postprocessors/:id', (req, res) => {
  const { name, type, target, data } = req.body;
  if (!name || !type || !target || !data)
    return res.status(400).json({ error: 'Missing fields' });

  const result = db.prepare(`
    UPDATE post_processors SET name = ?, type = ?, target = ?, data = ? WHERE id = ?
  `).run(name, type, target, data, req.params.id);

  if (result.changes === 0)
    return res.status(404).json({ error: 'Not found' });
  
  res.json({ success: true });
});

app.delete('/api/postprocessors/:id', (req, res) => {
  const result = db.prepare(`DELETE FROM post_processors WHERE id = ?`).run(req.params.id);
  if (result.changes === 0)
    return res.status(404).json({ error: 'Not found' });
  
  res.json({ success: true });
});

app.post('/api/postprocessors/test', async (req, res) => {
  const { type, target, data } = req.body;
  if (!type || !target || !data)
    return res.status(400).json({ error: 'Missing fields' });

  try {
    const response = await runPostProcessor(type, target, data);
    res.json({ success: true, status: response.status, response: `Post processor responded with: ${response}` });
  }
  catch (e) {
    res.status(500).json({ error: e.message });
  }
});


if (process.env.NODE_ENV === 'production') { // In production, allow the express server to serve both the api & the client UI
  // Serve static files from the React build folder
  app.use(express.static(path.join(__dirname, '..', 'client', 'build')));

  // If React app uses client-side routing, fallback to index.html for all other routes
  app.use((req, res, next) => {
    const accept = req.headers.accept || '';
    if (req.method === 'GET' && accept.includes('text/html')) {
      res.sendFile(path.resolve(__dirname, '..', 'client', 'build', 'index.html'));
    }
    else {
      next();
    }
  });
}

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});