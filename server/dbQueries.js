const db = require('./db');

function getPlaylists() {
  return db.prepare('SELECT * FROM playlists').all();
}

function getYTSubsPlaylists() { // Todo: combine this with getPlaylists above
  return db.prepare(`SELECT * FROM playlists WHERE source = 'ytsubs.app'`).all();
}

function getPlaylist(playlistDbId) {
  return db.prepare('SELECT * FROM playlists WHERE id = ?').get(playlistDbId);
}

function insertPlaylistManual(playlistId, playlist) {
  const stmt = db.prepare(`
    INSERT INTO playlists (playlist_id, author_name, author_uri, title, check_interval_minutes, regex_filter, last_checked, thumbnail, banner, source)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 'manual')
  `);

  return stmt.run(playlistId, playlist.author_name, playlist.author_uri, playlist.title, 60, '', null, playlist.thumbnail, playlist.banner);
}

function insertPlaylistYTSubs(sub, channelInfo) { // Todo: maybe this can be combined with insertPlaylistManual
  const insert = db.prepare(`
    INSERT INTO playlists (playlist_id, title, author_name, author_uri, thumbnail, banner, check_interval_minutes, regex_filter, source)
    VALUES (?, ?, ?, ?, ?, ?, 15, NULL, 'ytsubs.app')
    ON CONFLICT(playlist_id) DO UPDATE SET
    title = excluded.title,
    author_name = excluded.author_name,
    author_uri = excluded.author_uri,
    thumbnail = excluded.thumbnail,
    check_interval_minutes = excluded.check_interval_minutes,
    regex_filter = excluded.regex_filter,
    source = excluded.source
  `);

  insert.run(
    sub.playlist_id,
    sub.title,
    sub.author_name,
    sub.author_uri,
    sub.thumbnail,
    channelInfo.banner
  );
}

function updatePlaylist(playlistId, check_interval_minutes, regex_filter) {
  const stmt = db.prepare(`
    UPDATE playlists
    SET check_interval_minutes = ?, regex_filter = ?
    WHERE id = ?
  `);
  stmt.run(check_interval_minutes, regex_filter, playlistId);
}

function updatePlaylistLastChecked(playlistId, last_checked) { // Todo: maybe this can be combined with updatePlaylist above
  db.prepare(`UPDATE playlists SET last_checked = ? WHERE playlist_id = ?`)
  .run(last_checked, playlistId);
}

function deletePlaylist(playlistId) {
  db.prepare('DELETE FROM playlists WHERE id = ?').run(playlistId);
}

function getVideosForPlaylist(playlistId) {
  return db.prepare('SELECT * FROM videos WHERE playlist_id = ? ORDER BY published_at DESC').all(playlistId);
}

function insertVideo(playlistId, videoId, videoTitle, publishedAt, videoThumbnail) {
  const insertVideo = db.prepare(`
    INSERT OR IGNORE INTO videos (playlist_id, video_id, title, published_at, thumbnail)
    VALUES (?, ?, ?, ?, ?)
  `); // "OR IGNORE" will ignore conflicts (we could also update the item on conflicts, but we'll handle that elsewhere)
  return insertVideo.run(playlistId, videoId, videoTitle, publishedAt, videoThumbnail);
}

function deleteVideosForPlaylist(playlistId) {
  db.prepare('DELETE FROM videos WHERE playlist_id = ?').run(playlistId);
}

function getSettings() {
  return db.prepare('SELECT key, value FROM settings').all();
}

function insertSettings(settings) {
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

  insertMany(settings);
}

function getPostProcessors() {
  return db.prepare('SELECT * FROM post_processors').all();
}

function insertPostProcessor(name, type, target, data) {
  const stmt = db.prepare(`
    INSERT INTO post_processors (name, type, target, data)
    VALUES (?, ?, ?, ?)
  `);
  return stmt.run(name, type, target, data);
}

function updatePostProcessor(postProcessorId, name, type, target, data) {
  return db.prepare(`
    UPDATE post_processors SET name = ?, type = ?, target = ?, data = ? WHERE id = ?
  `).run(name, type, target, data, postProcessorId);
}

function deletePostProcessor(postProcessorId) {
  return db.prepare(`DELETE FROM post_processors WHERE id = ?`).run(postProcessorId);
}

function getActivitiesCount() {
  return db.prepare(`SELECT COUNT(*) as count FROM activity`).get();
}

function getActivities(pageSize, offset) {
  return db.prepare(`
    SELECT a.id, a.datetime, a.playlist_id, a.title, a.url, a.message, a.icon, p.id AS playlist_db_id, p.title AS playlist_title
    FROM activity a
    LEFT JOIN playlists p ON a.playlist_id = p.playlist_id
    ORDER BY a.id DESC
    LIMIT ? OFFSET ?
  `).all(pageSize, offset);
}

function insertActivity(playlistId, title, url, message, icon) {
  db.prepare(`INSERT INTO activity (datetime, playlist_id, title, url, message, icon) VALUES (?, ?, ?, ?, ?, ?)`)
  .run(new Date().toISOString(), playlistId, title, url, message, icon);
}

module.exports = { 
  getPlaylists,
  getYTSubsPlaylists,
  getPlaylist,
  insertPlaylistManual,
  insertPlaylistYTSubs,
  updatePlaylist,
  updatePlaylistLastChecked,
  deletePlaylist,
  getVideosForPlaylist,
  insertVideo,
  deleteVideosForPlaylist,
  getSettings,
  insertSettings,
  getPostProcessors,
  insertPostProcessor,
  updatePostProcessor,
  deletePostProcessor,
  getActivitiesCount,
  getActivities,
  insertActivity,
};