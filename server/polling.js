const { parseVideosFromFeed } = require('./rssParser');
const { runPostProcessor } = require('./postProcessors');
const { fetchWithRetry, tryParseAdditionalChannelData } = require('./utils');
const { getPostProcessors, getSettings, insertActivity, insertPlaylist, getPlaylists, deletePlaylist, updatePlaylist, getVideoStatePendings } = require('./dbQueries');

const pollingJobs = new Map(); // Map of playlistId -> { intervalId, intervalMinutes, regex }

function scheduleWatcher() {
  setInterval(() => {
    watchStates();
  }, 60 * 1000);
}

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

function removePolling(playlist_id) {
  clearInterval(pollingJobs.get(playlist_id).intervalId);
  pollingJobs.delete(playlist_id);
}

function watchStates() {
  const entities = getVideoStatePendings();

  entities.forEach(entity => {
    // Simulate processing the entity
    console.log(entity);
  });
}

async function updateYtSubsPlaylists() {
  const settings = Object.fromEntries(getSettings().map(row => [row.key, row.value]));
  const ytsubs_apikey = settings.ytsubs_apikey;
  const exclude_shorts = (settings.exclude_shorts ?? 'false') === 'true'; // SQLite can't store bool

  if (!ytsubs_apikey)
    return;

  try {
    const res = await fetchWithRetry(`https://ytsubs.app/subscriptions?api_key=${ytsubs_apikey}`)
    const data = await res.json();

    const fetchedSubs = data.subscriptions.map(sub => ({
      channel_id: sub.snippet.resourceId.channelId, // This isn't part of the db item, but it will be used below to grab the banner, etc info for the channel
      playlist_id: sub.snippet.resourceId.channelId.replace(/^UC/, exclude_shorts ? 'UULF' : 'UU'), // Reference: other possible prefixes: https://stackoverflow.com/a/77816885
      title: sub.snippet.title,
      check_interval_minutes: 15, // Even though this is hard-coded, it needs to be defined here for the schedulePolling job
      author_name: sub.snippet.title,
      author_uri: `https://www.youtube.com/channel/${sub.snippet.resourceId.channelId}`,
      thumbnail: sub.snippet.thumbnails?.high?.url || '',
    }));
    const fetchedIds = new Set(fetchedSubs.map(s => s.playlist_id));

    const existing = getPlaylists('ytsubs.app');
    
    // Add or update subscribed playlists      
    for (const sub of fetchedSubs) {
      const channelInfo = await tryParseAdditionalChannelData(`https://www.youtube.com/channel/${sub.channel_id}`);
      sub.banner = channelInfo.banner;
      insertPlaylist(sub, 'ytsubs.app', true);
      
      // Create a polling job for the new subscription
      if (!pollingJobs.has(sub.playlist_id)) {
        console.log(`[YTSubs.app] Added '${sub.title}'`);
        insertActivity(sub.playlist_id, sub.title, `https://www.youtube.com/playlist?list=${sub.playlist_id}`, 'Playlist added (YTSubs.app)', 'view-list');
        
        await pollPlaylist(sub, false); // Initial request to get videos from feed (but don't alert for new videos for new subs)

        schedulePolling(sub);
      }
    }
      
    // Remove unsubscribed playlists
    for (const existingPlaylist of existing) {
      if (!fetchedIds.has(existingPlaylist.playlist_id)) {
        removePolling(existingPlaylist.playlist_id)
        deletePlaylist(existingPlaylist.playlist_id)

        console.log(`[YTSubs.app] Removed '${existingPlaylist.title}' (${existingPlaylist.playlist_id})`);
        insertActivity(existingPlaylist.playlist_id, existingPlaylist.title, `https://www.youtube.com/playlist?list=${existingPlaylist.playlist_id}`, 'Playlist removed (YTSubs.app)', 'trash');
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

  console.log(`[Poll] Checking: ${playlist.title} (${playlist.playlist_id})`);

  try {
    const settings = Object.fromEntries(getSettings().map(row => [row.key, row.value]));
    const exclude_shorts = (settings.exclude_shorts ?? 'false') === 'true'; // SQLite can't store bool

    await parseVideosFromFeed(playlist.playlist_id, null, async (video, alreadyExists) => {
      if (alreadyExists || !alertForNewVideos)
        return;

      // Optional regex filter
      if (playlist.regex_filter && !new RegExp(playlist.regex_filter, 'i').test(video.title)) {
        return;
      }

      // Skip shorts if that setting is turned on (we change UU -> UULF where we can, but doing
      // it here will allow us to catch it in PL type playlists too).
      if (exclude_shorts && video.link.includes('/shorts/')) {
        return;
      }

      console.log(`New video found: ${video.title}`);
      insertActivity(playlist.playlist_id, video.title, `https://www.youtube.com/watch?v=${video.video_id}`, 'New video found!', 'camera-video-fill');

      for (const postProcessor of getPostProcessors()) {
        try {
          await runPostProcessor(postProcessor.type, postProcessor.target, postProcessor.data, { video, playlist });
  
          insertActivity(playlist.playlist_id, video.title, null, `Post processor '${postProcessor.name}' run`, postProcessor.type === 'webhook' ? 'broadcast' : 'cpu-fill');
        }
        catch (error) {
          console.error(`Error running post processor '${postProcessor.name}':`, error); // Todo: should an error like this become an 'activity item' as well? (Sonarr would probably call this a "health issue")
        }
      }
    });

    updatePlaylist(playlist.playlist_id, undefined, undefined, new Date().toISOString());
  }
  catch (err) {
    console.error(`Failed to poll ${playlist.title}:`, err); // Todo: mark as 'health issue'? (eg a 404 will be thrown when a playlist is deleted)
  }
}

module.exports = { schedulePolling, removePolling, updateYtSubsPlaylists, scheduleWatcher };