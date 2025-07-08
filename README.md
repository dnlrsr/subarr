# YouTubarr

### Background

This is an attempt to create a Sonarr-like application for YouTube videos.

_Why not use one of the existing solutions?_

So far, the only (active) existing solution I've found, [TubeSync](https://github.com/meeb/tubesync), seems to be based on [yt-dlp](https://github.com/yt-dlp/yt-dlp) for getting playlist information. This works fine if you want to index an _entire playlist_ (which a user may, very well, want to do) but it requires a LOT of polling activity.

Sonarr is based on RSS feeds - explicitly designed for this purpose of getting new updates from subscription-like sources. This is much lighter in processing requirements.

_What are the limitations of the RSS feed approach?_

YouTube already provides RSS feeds for playlists (eg https://www.youtube.com/feeds/videos.xml?playlist_id=PLopY4n17t8RDoFQPcjBKWDEblGH1sOH2h). However, they can be severly limited:

- Feeds seem to be limited to only the last 15 items
  - _However, YouTubarr will list more items as they are found because the internal database will be updated_
- _[Needs testing]_ RSS feed items are always in "playlist order", meaning a new video added to the bottom might not cause an update to the RSS feed
  - This means that, currently, RSS feeds _will not work_ for YouTube playlists greater than 15 items where items are added to the bottom (issue logged with YouTube: https://issuetracker.google.com/issues/429563457)
- _[Needs testing]_ RSS feeds may be somewhat slow to update (updates are approximately every 5-15 minutes)
- _[Not a big deal]_ RSS feeds will not include "Members Only" items

However, this works perfectly fine for mine (and maybe other people's) needs.


### Current features

- Add playlists
- Limit playlist items by regular expression
- Receive notifications about new items via Discord webhook _(mostly just for testing right now)_

### Future features

- Integrate [ytsubs.app](https://ytsubs.app) to import user's YouTube subscriptions and keep them in sync
- Add to Raindrop (and possibly other sources - maybe even combine Raindrop/Discord/etc into a generic "Notification Webhook" object and "Raindrop/Discord/etc" are just templates that will pre-populate values for you)
- Native "url base" support like sonarr (for reverse proxies or cloudflare tunnels)
- Backup & Restore functionality (_should_ be pretty easy by just giving a copy of the sqlite db?)
- Download videos? (I would love to add this - this project did claim to be like Sonarr after all - however this would require adding an additional library, managing video quality, subtitles, sponsorblock, etc)
  - _For now, we could just have a setting box for "yt-dl or yt-dlp location" and "yt-dl or yt-dlp arguments" so we don't have to manage all the settings (looks like yt-dlp even has [SponsorBlock arguments](https://github.com/yt-dlp/yt-dlp#sponsorblock-options))_
- _Index more than 15 items initially? (this would require significant up-front processing power like TubeSync does - so...unlikely)_

### Plans for future maintenance

I am currently just building this as a hobby project for myself and I already have about 10x the amount of hobby projects that I can handle 😆. So I'll probably build this out enough for _me_, then other people will have to add to it if they want to keep it alive.
