# YouTubarr

### Background

This is an attempt to create a Sonarr-like application for YouTube videos.

_Why not use one of the existing solutions?_

So far, the only (active) existing solution I've found, [TubeSync](https://github.com/meeb/tubesync), seems to be based on [yt-dlp](https://github.com/yt-dlp/yt-dlp) for getting playlist information. This works fine if you want to index an _entire playlist_ (which a user may, very well, want to do) but it requires a LOT of polling activity.

Sonarr is based on RSS feeds - explicitly designed for this purpose of getting new updates from subscription-like sources. This is much lighter in processing requirements.

_What are the limitations of the RSS feed approach?_

YouTube already provides RSS feeds for playlists (eg https://www.youtube.com/feeds/videos.xml?playlist_id=PLopY4n17t8RDoFQPcjBKWDEblGH1sOH2h). However, they can be severly limited:

- Feeds seem to be limited to only the last 15 items
- _[Needs testing]_ I am not sure in what order items are returned (ie if you just have a random playlist - are videos returned ordered by upload date? added date? Is it consistent for both PL and UU playlists?)
- _[Needs testing]_ RSS feeds may be somewhat slow to update

However, this works perfectly fine for mine (and maybe other people's) needs.


### Current features

- Add playlists
- Limit playlist items by regular expression
- Receive notifications about new items via Discord webhook _(mostly just for testing right now)_

### Future features

- Add to Raindrop
- Download videos? (I would love to add this - this project did claim to be like Sonarr after all - however this would require adding an additional library, managing video quality, subtitles, sponsorblock, etc)

### Plans for future maintenance

I am currently just building this as a hobby project for myself and I already have about 10x the amount of hobby projects that I can handle 😆. So I'll probably build this out enough for _me_, then other people will have to add to it if they want to keep it alive.
