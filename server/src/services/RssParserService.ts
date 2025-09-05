import Parser from 'rss-parser';
import { PlaylistInfo, VideoInfo } from '../models/types';
import { DatabaseService } from './DatabaseService';

export class RssParserService {
    private parser: Parser;
    private databaseService: DatabaseService;

    constructor(databaseService: DatabaseService) {
        this.databaseService = databaseService;
        this.parser = new Parser({
            customFields: {
                feed: ['yt:channelId', 'yt:playlistId'],
                item: ['media:group'],
            }
        } as any);
    }

    private async parseUrlWithRetry(url: string, retries = 3, delay = 1000): Promise<any> {
        for (let attempt = 0; attempt < retries; attempt++) {
            try {
                const feed = await this.parser.parseURL(url);
                return feed;
            } catch (err) {
                if (attempt === retries - 1) {
                    throw err;
                }
                console.warn(`parseURL failed (attempt ${attempt + 1}):`, (err as Error).message);
                await new Promise(res => setTimeout(res, delay));
            }
        }
    }

    public async parseVideosFromFeed(
        playlistId: string,
        playlistInfoCallback?: (playlist: PlaylistInfo) => Promise<void> | void,
        videoInfoCallback?: (video: VideoInfo, alreadyExists: boolean) => Promise<void> | void
    ): Promise<void> {
        const feedUrl = `https://www.youtube.com/feeds/videos.xml?playlist_id=${playlistId}`;

        const feed = await this.parseUrlWithRetry(feedUrl);
        const channelId = feed['yt:channelId'];
        const playlistAuthor = feed.author || {};
        const playlistTitle = feed.title === 'Videos' && feed.author?.name ?
            feed.author.name :
            feed.title || `Playlist ${playlistId.slice(0, 6)}`;
        const playlistThumbnail = feed.items?.[0]?.['media:group']?.['media:thumbnail']?.[0]?.$?.url || null;

        if (playlistInfoCallback) {
            await playlistInfoCallback({
                channel_id: channelId,
                playlist_id: playlistId,
                author_name: playlistAuthor?.name,
                author_uri: playlistAuthor?.uri,
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
                const result = this.databaseService.insertVideo({
                    playlist_id: playlistId,
                    video_id: videoId,
                    title: videoTitle,
                    published_at: publishedAt,
                    thumbnail: videoThumbnail,
                    state: 'missing'
                });
                alreadyExists = result.changes === 0;
            }

            if (videoInfoCallback) {
                await videoInfoCallback({
                    title: videoTitle,
                    video_id: videoId,
                    link: item.link,
                    thumbnail: videoThumbnail,
                    published_at: publishedAt,
                    playlist_title: playlistTitle,
                }, alreadyExists);
            }
        }
    }
}
