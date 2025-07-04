const express = require('express');
const cors = require('cors');
const db = require('./db');
const Parser = require('rss-parser');

const parser = new Parser({
  customFields: {
    feed: ['yt:channelId', 'yt:playlistId'],
    item: ['media:group', ['media:thumbnail', 'thumbnail', { keepArray: false }]],
  }
});

const { schedulePolling } = require('./polling');
const playlists = db.prepare('SELECT * FROM playlists').all();
for (const playlist of playlists) {
  schedulePolling(playlist);
}

const app = express();
app.use(cors());
app.use(express.json());
const PORT = 3001;

app.get('/api/playlists', (req, res) => {
  const rows = db.prepare('SELECT * FROM playlists').all();
  res.json(rows);
});

app.post('/api/playlists', async (req, res) => {
  const { playlistId } = req.body;
  if (!/^(PL|UU|LL|FL)[\w-]{10,}$/.test(playlistId)) {
    return res.status(400).json({ error: 'Invalid playlist ID' });
  }

  const feedUrl = `https://www.youtube.com/feeds/videos.xml?playlist_id=${playlistId}`;

  try {
    const feed = await parser.parseURL(feedUrl);
    const title = feed.title || `Playlist ${playlistId.slice(0, 6)}`;
    const author = feed.author || 'Unknown';
    const thumbnail = feed.items?.[0]?.['media:group']?.['media:thumbnail']?.[0]?.$?.url || null;

    const stmt = db.prepare(`
      INSERT INTO playlists (playlist_id, title, check_interval_minutes, regex_filter, last_checked, thumbnail)
      VALUES (?, ?, ?, ?, ?, ?)
    `);

    const info = stmt.run(playlistId, title, 60, '', null, thumbnail);
    const newPlaylistId = info.lastInsertRowid;

    // Insert video entries
    const insertVideo = db.prepare(`
      INSERT INTO videos (playlist_id, video_id, title, published_at, notified, thumbnail)
      VALUES (?, ?, ?, ?, 0, ?)
    `);

    const insertMany = db.transaction((videos) => {
      for (const item of videos) {
        const videoId = item.id?.split(':')?.[2] || null;
        const title = item.title || 'Untitled';
        const publishedAt = item.pubDate || null;
        const thumbnail = item?.['media:group']?.['media:thumbnail']?.[0]?.$?.url || null;

        if (videoId) {
          insertVideo.run(newPlaylistId, videoId, title, publishedAt, thumbnail);
        }
      }
    });

    insertMany(feed.items || []);

    res.status(201).json({ id: newPlaylistId });
  } catch (err) {
    console.error('Failed to fetch RSS feed', err);
    res.status(500).json({ error: 'Failed to fetch playlist metadata' });
  }
});

app.get('/api/playlists/:id', (req, res) => {
  const playlist = db.prepare('SELECT * FROM playlists WHERE id = ?').get(req.params.id);
  if (!playlist) return res.status(404).json({ error: 'Not found' });

  const videos = db.prepare('SELECT * FROM videos WHERE playlist_id = ? ORDER BY published_at DESC').all(req.params.id);
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
  db.prepare('DELETE FROM videos WHERE playlist_id = ?').run(req.params.id);
  db.prepare('DELETE FROM playlists WHERE id = ?').run(req.params.id);
  res.json({ success: true });
});

app.get('/api/settings', (req, res) => {
  const rows = db.prepare('SELECT key, value FROM settings').all();
  const settings = Object.fromEntries(rows.map(row => [row.key, row.value]));
  res.json(settings);
});

app.put('/api/settings', (req, res) => {
  const { key, value } = req.body;
  db.prepare(`
    INSERT INTO settings (key, value)
    VALUES (?, ?)
    ON CONFLICT(key) DO UPDATE SET value = excluded.value
  `).run(key, value);
  res.json({ success: true });
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});