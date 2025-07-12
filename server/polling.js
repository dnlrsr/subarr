const fetch = require('node-fetch');
const db = require('./db');
const { parseVideosFromFeed } = require('./rssParser');

function getSettings() {
  const rows = db.prepare('SELECT key, value FROM settings').all();
  return Object.fromEntries(rows.map(row => [row.key, row.value]));
}

const pollingJobs = new Map(); // Map of playlistId -> { intervalId, intervalMinutes, regex }

function schedulePolling(playlist) {
  const { playlist_id, title, check_interval_minutes, regex_filter } = playlist;

  // Clear existing polling if any
  if (pollingJobs.has(playlist_id)) {
    clearInterval(pollingJobs.get(playlist_id).intervalId);
  }

  const intervalId = setInterval(() => {
    pollPlaylist(playlist); // pass full playlist object
  }, check_interval_minutes * 60 * 1000);

  pollingJobs.set(playlist_id, {
    intervalId,
    intervalMinutes: check_interval_minutes,
    regex: regex_filter
  });

  console.log(`Scheduled polling for playlist '${title}' every ${check_interval_minutes} minutes`);
}

async function updateYtSubsPlaylists() {
  const ytsubs_apikey = getSettings().ytsubs_apikey;
  if (!ytsubs_apikey)
    return;

  try {
    const res = await fetch(`https://ytsubs.app/subscriptions?api_key=${ytsubs_apikey}`)
    const data = await res.json();

    const fetchedSubs = data.subscriptions.map(sub => ({
      playlist_id: sub.snippet.resourceId.channelId.replace(/^UC/, 'UU'),
      title: sub.snippet.title,
      check_interval_minutes: 15, // Even though this is hard-coded, it needs to be defined here for the schedulePolling job
      author_name: sub.snippet.title,
      author_uri: `https://www.youtube.com/channel/${sub.snippet.resourceId.channelId}`,
      thumbnail: sub.snippet.thumbnails?.high?.url || '',
    }));
    const fetchedIds = new Set(fetchedSubs.map(s => s.playlist_id));

    const existing = db.prepare(`SELECT * FROM playlists WHERE source = 'ytsubs.app'`).all();
    
    // Add or update subscribed playlists
    const insert = db.prepare(`
      INSERT INTO playlists (playlist_id, title, author_name, author_uri, thumbnail, check_interval_minutes, regex_filter, source)
      VALUES (?, ?, ?, ?, ?, 15, NULL, 'ytsubs.app')
      ON CONFLICT(playlist_id) DO UPDATE SET
      title = excluded.title,
      author_name = excluded.author_name,
      author_uri = excluded.author_uri,
      thumbnail = excluded.thumbnail,
      check_interval_minutes = excluded.check_interval_minutes,
      regex_filter = excluded.regex_filter,
      source = excluded.source
    `);
      
    for (const sub of fetchedSubs) {
      insert.run(
        sub.playlist_id,
        sub.title,
        sub.author_name,
        sub.author_uri,
        sub.thumbnail
      ); //Todo: we should make sure this doesn't overwrite the existing interval check (if a user changes a sub's interval to 1 hour but then ytsubs is synced again and changes it back to 15min)
      
      // Create a polling job for the new subscription
      if (!pollingJobs.has(sub.playlist_id)) {
        console.log(`[YTSubs.app] Added '${sub.title}'`);
        
        await pollPlaylist(sub, false); // Initial request to get videos from feed (but don't alert for new videos for new subs)

        schedulePolling(sub);
      }
    }
      
    // Remove unsubscribed playlists
    const remove = db.prepare(`DELETE FROM playlists WHERE playlist_id = ?`);
    for (const existingPlaylist of existing) {
      if (!fetchedIds.has(existingPlaylist.playlist_id)) {
        remove.run(existingPlaylist.playlist_id);
        clearInterval(pollingJobs.get(existingPlaylist.playlist_id).intervalId);
        pollingJobs.delete(existingPlaylist.playlist_id);
        console.log(`[YTSubs.app] Removed '${existingPlaylist.title}'`);
      }
    }
  }
  catch (err) {
    console.error('Failed to sync YTSubs subscriptions:', err)
  }
}

async function pollPlaylist(playlist, alertForNewVideos = true) {
  const now = Date.now();
  const lastChecked = playlist.last_checked ? new Date(playlist.last_checked).getTime() : 0;
  const intervalMs = (playlist.check_interval_minutes || 60) * 60 * 1000;

  if (now - lastChecked < intervalMs)
    return;

  console.log(`[Poll] Checking: ${playlist.title}`);

  try {
    await parseVideosFromFeed(playlist.playlist_id, null, async (video, alreadyExists) => {
      if (alreadyExists || !alertForNewVideos)
        return;

      // Optional regex filter
      if (playlist.regex_filter && !new RegExp(playlist.regex_filter, 'i').test(video.title)) {
        return;
      }

      if (getSettings().webhook_url) {
        console.log(`New video found: ${video.title}`);

        await fetch(getSettings().webhook_url, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            embeds: [
              {
                title: `New Video: ${video.title}`,
                url: `https://www.youtube.com/watch?v=${video.video_id}`,
                thumbnail: { url: video.thumbnail },
                timestamp: video.published_at,
                color: 0xff0000,
                footer: { text: `From playlist: ${playlist.title}` },
              },
            ],
          }),
        });
      }
    });

    db.prepare(`UPDATE playlists SET last_checked = ? WHERE playlist_id = ?`)
      .run(new Date().toISOString(), playlist.playlist_id);
  } catch (err) {
    console.error(`Failed to poll ${playlist.title}:`, err);
  }
}

module.exports = { schedulePolling, updateYtSubsPlaylists };