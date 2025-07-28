const db = require('./db');
const Parser = require('rss-parser');

const parser = new Parser({
  customFields: {
    feed: ['yt:channelId', 'yt:playlistId', ['author', 'author', { keepArray: false }]],
    item: ['media:group', ['media:thumbnail', 'thumbnail', { keepArray: false }]],
  }
});

async function parseVideosFromFeed(playlistId, playlistInfoCallback, videoInfoCallback) {
  // Todo: right now the feed url is hardcoded, but in the future we might want to make this an override-able property of the playlist
  const feedUrl = `https://www.youtube.com/feeds/videos.xml?playlist_id=${playlistId}`;

  const feed = await parser.parseURL(feedUrl);
  const playlistAuthor = feed.author || {};
  const playlistTitle = feed.title === 'Videos' && feed.author?.name ? 
    feed.author.name : // If a user is adding a UU playlist, we should use the author name instead of the playlist name (which will always be "Videos") to avoid confusion
    feed.title || `Playlist ${playlistId.slice(0, 6)}`;
  const playlistThumbnail = feed.items?.[0]?.['media:group']?.['media:thumbnail']?.[0]?.$?.url || null;

  if (playlistInfoCallback) {
    playlistInfoCallback({
      playlist_id: playlistId,
      author_name : playlistAuthor?.name,
      author_uri : playlistAuthor?.uri,
      title: playlistTitle,
      thumbnail: playlistThumbnail,
    });
  }

  // Insert videos
  const insertVideo = db.prepare(`
    INSERT OR IGNORE INTO videos (playlist_id, video_id, title, published_at, thumbnail)
    VALUES (?, ?, ?, ?, ?)
  `); // "OR IGNORE" will ignore conflicts (we could also update the item on conflicts, but we'll handle that elsewhere)

  for (const item of feed.items) {
    const videoId = item.id?.split(':')?.[2];
    const videoTitle = item.title || 'Untitled';
    const publishedAt = item.pubDate || null;
    const videoThumbnail = item?.['media:group']?.['media:thumbnail']?.[0]?.$?.url || null;

    let alreadyExists = false;
    if (videoId) {
      const result = insertVideo.run(playlistId, videoId, videoTitle, publishedAt, videoThumbnail);
      alreadyExists = result.changes === 0;
    }

    if (videoInfoCallback) {
      await videoInfoCallback({ //Todo: needs to be async
        title: videoTitle,
        video_id: videoId,
        link: item.link, // Currently only used for videoInfoCallback (not stored in DB). If we want to exclude shorts from the UI as well, then we'll have to exclude these videos earlier in this method
        thumbnail: videoThumbnail,
        published_at: publishedAt,
        playlist_title: playlistTitle,
      }, alreadyExists);
    }
  }
}

module.exports = { parseVideosFromFeed };