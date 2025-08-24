# YouTubarr

<img width="1220" height="774" alt="image" src="https://github.com/user-attachments/assets/dd9b42d8-08e9-4d9a-a175-acf7219d059a" />


### Background

This is an attempt to create a Sonarr-like application for YouTube videos. A lot of inspiration has been taken from Sonarr (mostly the UI), but this has been written entirely from scratch.

_Why not use one of the existing solutions?_

So far, the only (active) existing solution I've found, [TubeSync](https://github.com/meeb/tubesync), seems to be based on [yt-dlp](https://github.com/yt-dlp/yt-dlp) for getting playlist information. This works fine if you want to index an _entire playlist_ (which a user may, very well, want to do) but it can require a LOT of polling activity (particularly for large channels).

_It's been brought to my attention that while I've been working on this for about 2 months, just last week there was another service called "YouTubarr" published: https://github.com/DireDireCrocs/Youtubarr . However, this seems to be specific to music (and connecting to [Lidarr](https://lidarr.audio/)) and also relies on the official YouTube API_

Sonarr is based on RSS feeds - explicitly designed for this purpose of getting new updates from subscription-like sources. This is much lighter in processing requirements.

_What are the limitations of the RSS feed approach?_

YouTube already provides RSS feeds for playlists (eg https://www.youtube.com/feeds/videos.xml?playlist_id=PLopY4n17t8RDoFQPcjBKWDEblGH1sOH2h). However, they can be severly limited:

- Feeds seem to be limited to only the last 15 items
  - _However, YouTubarr will list more items as they are found because the internal database will be updated_
  - Since the feed is limited to only the last 15 items, if (for some reason) YouTubarr is down for an extended period of time (or a large amount of videos are published to the playlist in a short period of time), YouTubarr may miss some videos entirely.
- YouTube RSS feed items are always in "playlist order", meaning a new video added outside of the first 15 items will not be seen as an update to the RSS feed
  - This means that, currently, RSS feeds _**will not work**_ in the following situations: (issue logged with YouTube: https://issuetracker.google.com/issues/429563457)
    - YouTube playlists greater than 15 items where items are added outside the "top 15" (regular playlists can be in _any order_ - as determined by the playlist owner - which means that "newly added items" aren't necessarily at the top. Some creators' playlists are ordered oldest -> newest)
    - \>=15 items added to a playlist quickly (eg if a playlist has 1 item, then when it updates 15 minutes later it has 20 items, 4 of those items will be missed because only the top 15 will be in the RSS feed)
- RSS feeds may be somewhat slow to update (updates are approximately every 15 minutes). _15 minutes is pretty fast, but other methods (like the direct YouTube API - or perhaps even TubeSync's yt-dl method) could check for new videos even faster_
- _[May not be a big deal]_ RSS feeds will not include "Members Only" items

However, this works perfectly fine for mine (and maybe other people's) needs.


### Notes

⚠️ **YouTubarr currently does not implement any sort of authetication. It is highly recommended that you do not expose your instance to the internet (or, at least, put it behind a form of authentication like nginx or Cloudflare)** ⚠️


### Current features

- Add playlists
- Limit playlist items by regular expression
- Exclude shorts
- [ytsubs.app](https://github.com/derekantrican/ytsubs) integration to import user's YouTube subscriptions and keep them in sync
- Post processors (an action to run when a new video is found)
  - Webhook: call a webhook (eg Discord, Raindrop.io, etc)
  - Process: execute a process (eg yt-dlp to download the video)

### Future features

- API key for authenticating calls to the server
- It would be neat to have some sort of web socket or other real-time communication between the server & client that will do things like updating the "last checked" or video list on the UI
- Native "url base" support like sonarr (for reverse proxies or cloudflare tunnels)
- Backup & Restore functionality (_should_ be pretty easy by just giving a copy of the sqlite db?)
- _Index more than 15 items initially? (this would require significant up-front processing power like TubeSync does - so...unlikely)_


### Installation

Make sure you have Node >= 18 installed, then run the following:

```
git clone https://github.com/derekantrican/youtubarr.git
cd youtubarr
npm install
# optionally create server/.env with PORT=5000 or whatever
npm run start-server # On Windows, use 'npm run start-server-win'
```

And if you'd like to set it to run at startup, put that last command into a .service file (Linux) or your Startup folder (Windows).

### Plans for future maintenance

I am currently just building this as a hobby project for myself and I already have about 10x the amount of hobby projects that I can handle 😆. So I'll probably build this out enough for _me_, then other people will have to add to it if they want to keep it alive.
