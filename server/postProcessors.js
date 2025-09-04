const { getVideoState, setVideoState } = require('./dbQueries');
const { fetchWithRetry, runCommand } = require('./utils');

/* Notes:
  This is the most sensitive part of our application - running processes or calling webhooks could expose secrets, allow attackers to invoke malicious processes, etc.
  - Soon after adding this feature, we should probably implement an API key for making changes to the application
  - We should implement a timeout on webhook calls & process invocation
*/

async function runPostProcessor(type, target, data, videoInfo) {
  
  if(getVideoState(videoInfo?.video.video_id) === 'present') {
    throw new Error('Video already processed');
  }

  if (type === 'webhook') {
    let { method = 'POST', headers = {}, body } = JSON.parse(data);

    target = replaceVariables(target, videoInfo, true);
    body = replaceVariables(body, videoInfo);

    const response = await fetchWithRetry(target, {
      method,
      headers,
      body: body ? body /* Coming from the post processor UI, body will already be stringified, so we can just send as-is */ : undefined,
    });

    const text = await response.text();
    if (!response.ok) {
      setVideoState(videoInfo?.video.video_id, 'error');
      throw new Error(text);
    }

    setVideoState(videoInfo?.video.video_id, 'downloading');
    
    return text;
  }
  else {
    throw new Error(`Unknown processor type: ${type}`);
  }
}

function replaceVariables(text, videoInfo, urlsafe = false) {
  const example = { // Some services (eg Discord) won't accept the webhook unless we provide example data for the variables
    video: {
      title: 'Example Video',
      video_id: 'dQw4w9WgXcQ',
      thumbnail: 'https://i.ytimg.com/vi/dQw4w9WgXcQ/hqdefault.jpg',
      published_at: new Date().toISOString(),
    },
    playlist: {
      title: 'Example Playlist'
    }
  };

  const data = videoInfo || example;

  const replacements = {
    '[[video.title]]': data.video.title,
    '[[video.thumbnail]]': data.video.thumbnail,
    '[[video.video_id]]': data.video.video_id,
    '[[video.published_at]]': data.video.published_at,
    '[[playlist.title]]': data.playlist.title,
  };

  let result = text;
  for (const [key, value] of Object.entries(replacements)) {
    let replacement = value;
    if (urlsafe) {
      replacement = encodeURIComponent(value);
    }
    else {
      // Escape properly for JSON strings
      replacement = JSON.stringify(value).slice(1, -1); // slice removes surrounding quotes
    }
    result = result.replaceAll(key, replacement);
  }

  return result;
}


module.exports = { runPostProcessor };