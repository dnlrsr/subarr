const Parser = require('rss-parser');
const { insertVideo } = require('./dbQueries');

const parser = new Parser({
  customFields: {
    feed: ['yt:channelId', 'yt:playlistId', ['author', 'author', { keepArray: false }]],
    item: ['media:group', 
      ['media:thumbnail', 'thumbnail', { keepArray: false }],
      ['media:statistics', 'statistics', { keepArray: false }],
    ],
  }
});

async function parseUrlWithRetry(url, retries = 3, delay = 1000) {
  for (let attempt = 0; attempt < retries; attempt++) {
    try {
      const feed = await parser.parseURL(url);
      return feed;
    }
    catch (err) {
      if (attempt === retries - 1)
        throw err; // rethrow final failure
      
      console.warn(`parseURL failed (attempt ${attempt + 1}):`, err.message);
      await new Promise(res => setTimeout(res, delay));
    }
  }
}

async function parseVideosFromFeed(playlistId, playlistInfoCallback, videoInfoCallback) {
  // Todo: right now the feed url is hardcoded, but in the future we might want to make this an override-able property of the playlist
  const feedUrl = `https://www.youtube.com/feeds/videos.xml?playlist_id=${playlistId}`;

  const feed = await parseUrlWithRetry(feedUrl);
  const channelId = feed['yt:channelId'];
  const playlistAuthor = feed.author || {};
  const playlistTitle = feed.title === 'Videos' && feed.author?.name ? 
    feed.author.name : // If a user is adding a UU playlist, we should use the author name instead of the playlist name (which will always be "Videos") to avoid confusion
    feed.title || `Playlist ${playlistId.slice(0, 6)}`;
  const playlistThumbnail = feed.items?.[0]?.['media:group']?.['media:thumbnail']?.[0]?.$?.url || null;

  if (playlistInfoCallback) {
    await playlistInfoCallback({
      channel_id: channelId, // This isn't part of the db item, but it will be used to grab the banner, etc info for the channel
      playlist_id: playlistId,
      author_name : playlistAuthor?.name,
      author_uri : playlistAuthor?.uri,
      title: playlistTitle,
      thumbnail: playlistThumbnail,
    });
  }

  for (const item of feed.items) {
    const videoId = item.id?.split(':')?.[2];
    const videoTitle = item.title || 'Untitled';
    const publishedAt = item.pubDate || null;
    const videoThumbnail = item?.['media:group']?.['media:thumbnail']?.[0]?.$?.url || null;

    let alreadyExists = false;
    if (videoId) {
      const result = insertVideo(playlistId, videoId, videoTitle, publishedAt, videoThumbnail);
      alreadyExists = result.changes === 0;
    }

    if (videoInfoCallback) {
      await videoInfoCallback({
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