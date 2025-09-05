<div align="center">

# 🎬 Subarr

**A lightweight YouTube channel/playlist subscription manager**

[![Docker](https://img.shields.io/badge/Docker-2496ED?style=for-the-badge&logo=docker&logoColor=white)](https://github.com/dnl### 🔄 Set Environment Variables

Using the `-e` flag:
```bash
docker run -p 3001:3001 -v /path/to/host/data:/data -e NODE_ENV=production subarr
```

Using a custom `.env` file:
```bash
docker run -p 3001:3001 -v /path/to/host/data:/data --env-file /path/to/.env subarr
```

---

## 🔄 Migration from JavaScript

> **Note**: As of the latest version, Subarr has been fully refactored from JavaScript to TypeScript with an improved object-oriented architecture. The migration is seamless - your existing database and configuration will continue to work without any changes.

**Key improvements in the TypeScript version:**
- 🔒 **Type safety** prevents runtime errors
- 🏗️ **Better architecture** with dependency injection
- 🧪 **Improved testability** with separated concerns
- 📖 **Enhanced developer experience** with IntelliSense
- 🚀 **Better performance** through optimized build process

---pkgs/container/subarr%2Fsubarr)
[![Node.js](https://img.shields.io/badge/Node.js-339933?style=for-the-badge&logo=nodedotjs&logoColor=white)](https://nodejs.org/)
[![License](https://img.shields.io/github/license/dnlrsr/subarr?style=for-the-badge)](LICENSE)
[![Stars](https://img.shields.io/github/stars/dnlrsr/subarr?style=for-the-badge)](https://github.com/dnlrsr/subarr/stargazers)

</div>

---

> ### 🔗 **Fork Notice**
> 
> This is a fork of [derekantrican/subarr](https://github.com/derekantrican/subarr). I will continue to implement features when they fit my needs.

---

## 📖 Overview

*After [a lot of feedback](https://reddit.com/r/selfhosted/comments/1myldh3/i_built_youtubarr_the_sonarr_for_youtube/nacw3am/), the original project was renamed from "YouTubarr" to "Subarr". The name "Subarr" helps define the project clearer - it's based on RSS subscriptions (intended to be a "subscribe to playlists/channels & take action on new uploads") rather than a full PVR & media management system.*

Subarr is a **🪶 lightweight** YouTube channel/playlist/subscription follower that will take action on new uploads (actions can be a webhook - like Discord). 

**"Lightweight"** means it needs few resources and can run on something like a Raspberry Pi.

<div align="center">

![Subarr Interface](https://github.com/user-attachments/assets/dd9b42d8-08e9-4d9a-a175-acf7219d059a)

*Clean, Sonarr-inspired interface for managing your YouTube subscriptions*

</div>

---

## 🎯 Background

This is an attempt to create a **Sonarr-like application for YouTube videos**. A lot of inspiration has been taken from Sonarr (mostly the UI), but this has been written entirely from scratch.

### 🤔 Why not use one of the existing solutions?

Here are all the similar projects and how Subarr is different:
| Name | Active? | Stars | Indexer | Comment |
|----------------------|---------|-------|---------|---------|
| [Tube Archivist](https://github.com/tubearchivist/tubearchivist) | ✅ | ![](https://img.shields.io/github/stars/tubearchivist/tubearchivist?label=&style=flat-square&color=white) | yt-dlp | Based on yt-dlp |
| [Pinchflat](https://github.com/kieraneglin/pinchflat) | ✅ | ![](https://img.shields.io/github/stars/kieraneglin/pinchflat?label=&style=flat-square&color=white) | yt-dlp (but can also do RSS for "fast-sync") | |
| [ytdl-sub](https://github.com/jmbannon/ytdl-sub) | ✅ | ![](https://img.shields.io/github/stars/jmbannon/ytdl-sub?label=&style=flat-square&color=white) | yt-dlp | No UI |
| [TubeSync](https://github.com/meeb/tubesync) | ✅ | ![](https://img.shields.io/github/stars/meeb/tubesync?label=&style=flat-square&color=white) | yt-dlp | |
| [YTPTube](https://github.com/arabcoders/ytptube) | ✅ | ![](https://img.shields.io/github/stars/arabcoders/ytptube?label=&style=flat-square&color=white) | yt-dlp | Essentially a web UI wrapper around yt-dlp |
| [Youtarr](https://github.com/DialmasterOrg/Youtarr) | ✅ | ![](https://img.shields.io/github/stars/DialmasterOrg/Youtarr?label=&style=flat-square&color=white) | yt-dlp | |
| [Youtubarr](https://github.com/DireDireCrocs/Youtubarr) | ✅ | ![](https://img.shields.io/github/stars/DireDireCrocs/Youtubarr?label=&style=flat-square&color=white) | YouTube API | Focused on music videos & [Lidarr](https://lidarr.audio/) integration (also only recently created) |
| [Subscribarr](https://github.com/jschaufuss/subscribarr) | ✅ | ![](https://img.shields.io/github/stars/jschaufuss/subscribarr?label=&style=flat-square&color=white) | RSS feeds | Includes YouTube playlists but is more generic *arr management (Sonarr & Radarr) |
| [Tubarr](https://github.com/TubarrApp/Tubarr) | ✅ | ![](https://img.shields.io/github/stars/TubarrApp/Tubarr?label=&style=flat-square&color=white) | yt-dlp | No UI, “pre-pre-pre-alpha” status |
| [MetaTube](https://github.com/JVT038/MetaTube) | ❌ | ![](https://img.shields.io/github/stars/JVT038/MetaTube?label=&style=flat-square&color=white) | N/A | Seems to only handle individual videos, not playlists |
| [Ytmdl](https://github.com/deepjyoti30/ytmdl) | ❌ | ![](https://img.shields.io/github/stars/deepjyoti30/ytmdl?label=&style=flat-square&color=white) | youtube-dl | Also music-video specific |
| [Tubarr (Capstone Project)](https://vc.bridgew.edu/cgi/viewcontent.cgi?article=1691&context=honors_proj) | ❌ | N/A | yt-dlp | Private (a student's capstone project) |


As you can see, there are several other solutions, but most are based on [yt-dlp](https://github.com/yt-dlp/yt-dlp) for getting playlist information. This works fine if you want to index an _entire playlist_ (which users may want to do) but it can require **a LOT of polling activity** (particularly for large channels). 

> 📊 _Tube Archivist above even calls out 2-4GB of memory dedicated to its functionality._

**🚀 This project is lightweight and can easily run on a Raspberry Pi or similar.** Additionally, none of the above services can automatically keep your actual subscriptions on YouTube in sync with the app.

Sonarr is based on **RSS feeds** - explicitly designed for this purpose of getting new updates from subscription-like sources. This is much lighter in processing requirements. The UI has been made as similar as possible to the other *arr apps for familiarity.

### ⚠️ What are the limitations of the RSS feed approach?

YouTube already provides RSS feeds for playlists (e.g., `https://www.youtube.com/feeds/videos.xml?playlist_id=PLopY4n17t8RDoFQPcjBKWDEblGH1sOH2h`). However, they can be severely limited:

- **📊 Limited to 15 items**: Feeds seem to be limited to only the last 15 items
  - _However, Subarr will list more items as they are found because the internal database will be updated_
  - If Subarr is down for an extended period or many videos are published quickly, some videos may be missed entirely

- **🔄 Playlist order issues**: YouTube RSS feed items are always in "playlist order", meaning a new video added outside of the first 15 items will not be seen as an update
  - This means RSS feeds **will not work** in these situations: ([issue logged with YouTube](https://issuetracker.google.com/issues/429563457))
    - YouTube playlists >15 items where items are added outside the "top 15"
    - ≥15 items added to a playlist quickly

- **⏰ Update delays**: RSS feeds may be somewhat slow to update (~15 minutes)

- **👥 Members-only content**: RSS feeds will not include "Members Only" items

**However, this works perfectly fine for our needs and many others' use cases.**

---

## 🏗️ Architecture

Subarr is built with a modern TypeScript architecture featuring:

### 📁 **Project Structure**
```
server/
├── src/
│   ├── models/          # TypeScript interfaces and types
│   ├── services/        # Business logic (Database, RSS, Polling, etc.)
│   ├── controllers/     # API route handlers
│   ├── utils/           # Utility functions and helpers
│   ├── Application.ts   # Main application orchestration
│   └── index.ts        # Entry point
├── dist/               # Compiled JavaScript (auto-generated)
└── package.json
```

### 🔧 **Core Services**
- **DatabaseService** - SQLite operations with Better-SQLite3
- **RssParserService** - YouTube RSS feed parsing
- **PollingService** - Subscription monitoring and YTSubs integration
- **PostProcessorService** - Webhook and process execution

### 🎮 **API Controllers**
- **PlaylistController** - Playlist CRUD operations
- **ActivityController** - Activity feed management
- **SettingsController** - Application configuration
- **PostProcessorController** - Post-processor management

---

## 📋 Important Notes

🔐 **Security Notice**: Subarr currently does not implement any sort of authentication. It is **highly recommended** that you do not expose your instance to the internet (or, at least, put it behind a form of authentication like nginx or Cloudflare).

### 🚫 What Subarr is NOT intended for:

- **📚 Indexing entire channels/playlists** or getting "older" videos. Subarr's RSS approach is specifically for "subscriptions": new video is posted → take some action
- **🎬 Media management**. Once Subarr triggers the post-processor (webhook), its job is done. Use Plex/Jellyfin/etc or another solution above if you require more control over your media

---

## ✨ Current Features

- 📝 **Add playlists** - Subscribe to YouTube playlists and channels
- 🎯 **Regex filtering** - Limit playlist items by regular expression
- 🚫 **Exclude shorts** - Filter out YouTube Shorts automatically
- 🔗 **[ytsubs.app](https://github.com/derekantrican/ytsubs) integration** - Import user's YouTube subscriptions and keep them in sync
- ⚡ **Post processors** - Actions to run when a new video is found:
  - 🪝 **Webhook**: Call a webhook (e.g., Discord, Raindrop.io, etc.)
- 🏗️ **Modern Architecture** - Fully refactored TypeScript codebase with:
  - 🎯 **Object-oriented design** with proper separation of concerns
  - 🔧 **Dependency injection** for better testability
  - 📊 **Type safety** throughout the application
  - 🧩 **Modular services** (Database, RSS Parser, Polling, Post Processing)
  - 🎮 **Clean controllers** for API endpoints

## 🚀 Future Features

- 🔐 **API key authentication** for secure server calls
- 🔄 **Real-time updates** via WebSocket communication between server & client
- 🌐 **Native URL base support** like Sonarr (for reverse proxies or Cloudflare tunnels)
- 💾 **Backup & Restore functionality** (should be easy with SQLite database)
- 📊 _Index more than 15 items initially?_ (would require significant processing power like TubeSync - unlikely)

---

## 🛠️ Installation

### Prerequisites
- **Node.js** >= 18
- **TypeScript** (for development)

### Quick Start

```bash
git clone https://github.com/dnlrsr/subarr.git
cd subarr

# Install dependencies
npm install

# Build the TypeScript server
cd server && npm run build && cd ..

# Start the application
npm run start-server # On Windows, use 'npm run start-server-win'
```

### 💻 Development

For development with TypeScript:

```bash
cd server
npm run dev  # Runs TypeScript compiler in watch mode
```

In another terminal:
```bash
npm run start-server
```

### 🔄 Run at Startup
To set it to run at startup, put the last command into:
- **Linux**: A `.service` file
- **Windows**: Your Startup folder

---

## 🐳 Docker Usage
⚠️ **Important**: Do not mount NFS storage! The application uses SQLite.

### 🏗️ Build the Docker Image

```bash
docker build -t subarr -f docker/Dockerfile .
```

> **Note**: The Docker build process automatically compiles the TypeScript code to JavaScript.

### 🚀 Run the Container

```bash
docker run -p 3001:3001 subarr
```

### 💾 Mount Data Directory for Persistent Storage

```bash
docker run -p 3001:3001 -v /path/to/host/data:/data/db subarr
```
This stores all database files in `/path/to/host/data/data` on your host.

### 🔧 Set Environment Variables

Using the `-e` flag:
```bash
docker run -p 3001:3001 -v /path/to/host/data:/data -e NODE_ENV=production subarr
```

Using a custom `.env` file:
```bash
docker run -p 3001:3001 -v /path/to/host/data:/data --env-file /path/to/.env subarr
```

### 🐙 Docker Compose Example

Create a `docker-compose.yml` file in your project directory:

```yaml
services:
  subarr:
    image: ghcr.io/dnlrsr/subarr/subarr:latest # TODO: Change after merge
    ports:
      - "3001:3001"
    volumes:
      - db-data:/data/db
    env_file:
      - .env

volumes:
  db-data:
    driver: local
```

Start with:
```bash
docker compose up --build
```

**This will:**
- 🏗️ Build and run the Subarr container
- 💾 Mount the local `./data` folder to `/data` in the container for persistence
- 🔧 Load environment variables from `.env`
- 🌐 Expose port 3001

---

## 🔮 Plans for Future Maintenance

I am currently building this as a **hobby project** for myself and I already have about 10x the amount of hobby projects that I can handle. I'll probably fix some bugs or maintenance issues as they arise, but I don't plan to work on any major features. 

**🤝 Want to contribute?** Please reach out!

---

<div align="center">

## 💖 Support

If you find Subarr useful, consider:

⭐ **Starring this repository**  
🐛 **Reporting bugs**  
💡 **Suggesting features**  
🔧 **Contributing code**

</div>
