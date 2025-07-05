const Parser = require('rss-parser');

const parser = new Parser({
  customFields: {
    feed: ['yt:channelId', 'yt:playlistId'],
    item: [['media:group', 'mediaGroup']],
  },
});

const db = require('./db');
const fetch = require('node-fetch');

function getWebhookUrl() {
  const row = db.prepare('SELECT value FROM settings WHERE key = ?').get('webhook_url');
  return row?.value || null;
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

async function pollPlaylist(playlist) {
  const now = Date.now();
  const lastChecked = playlist.last_checked ? new Date(playlist.last_checked).getTime() : 0;
  const intervalMs = (playlist.check_interval_minutes || 60) * 60 * 1000;

  if (now - lastChecked < intervalMs) return;

  const feedUrl = `https://www.youtube.com/feeds/videos.xml?playlist_id=${playlist.playlist_id}`;
  console.log(`[Poll] Checking: ${playlist.title}`);

  try {
    const feed = await parser.parseURL(feedUrl);
    // Todo: update the playlist title in the db if it has changed on YouTube
    const newVideos = [];

    for (const item of feed.items) {
      const videoId = item.id?.split(':')?.[2];
      const title = item.title;
      const publishedAt = item.isoDate || item.pubDate;
      const thumbnail = item.mediaGroup?.['media:thumbnail']?.[0]?.$?.url || null;

      // Optional regex filter
      if (playlist.regex_filter && !new RegExp(playlist.regex_filter, 'i').test(title)) {
        continue;
      }

      const exists = db.prepare(`
        SELECT 1 FROM videos WHERE video_id = ? AND playlist_id = ?
      `).get(videoId, playlist.id);

      if (!exists) {
        newVideos.push({ videoId, title, publishedAt, thumbnail });

        db.prepare(`
          INSERT INTO videos (playlist_id, video_id, title, published_at, notified, thumbnail)
          VALUES (?, ?, ?, ?, 1, ?)
        `).run(playlist.id, videoId, title, publishedAt, thumbnail);
      }
    }

    if (getWebhookUrl() && newVideos.length > 0) {
      for (const video of newVideos) {
        console.log(`New video found: ${video.title}`);

        await fetch(getWebhookUrl(), {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            embeds: [
              {
                title: `🎬 [REACT APP] New Video: ${video.title}`,
                url: `https://www.youtube.com/watch?v=${video.videoId}`,
                thumbnail: { url: video.thumbnail },
                timestamp: video.publishedAt,
                color: 0xff0000,
                footer: { text: `From playlist: ${playlist.title}` },
              },
            ],
          }),
        });
      }
    }

    db.prepare(`UPDATE playlists SET last_checked = ? WHERE id = ?`)
      .run(new Date().toISOString(), playlist.id);
  } catch (err) {
    console.error(`Failed to poll ${playlist.title}:`, err);
  }
}

module.exports = { schedulePolling };