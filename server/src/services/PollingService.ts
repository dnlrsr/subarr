import { Playlist, YtSubsResponse } from '../models/types';
import { ChannelInfoParser, HttpClient } from '../utils';
import { DatabaseService } from './DatabaseService';
import { PostProcessorService } from './PostProcessorService';
import { RssParserService } from './RssParserService';

interface PollingJob {
    intervalId: NodeJS.Timeout;
    intervalMinutes: number;
    regex?: string | undefined;
}

export class PollingService {
    private pollingJobs: Map<string, PollingJob> = new Map();
    private databaseService: DatabaseService;
    private rssParserService: RssParserService;
    private postProcessorService: PostProcessorService;
    private httpClient: HttpClient;
    private channelInfoParser: ChannelInfoParser;

    constructor(
        databaseService: DatabaseService,
        rssParserService: RssParserService,
        postProcessorService: PostProcessorService
    ) {
        this.databaseService = databaseService;
        this.rssParserService = rssParserService;
        this.postProcessorService = postProcessorService;
        this.httpClient = new HttpClient();
        this.channelInfoParser = new ChannelInfoParser();
    }

    public schedulePolling(playlist: Playlist): void {
        const { playlist_id, title, check_interval_minutes, regex_filter } = playlist;

        // Clear existing polling if any
        if (this.pollingJobs.has(playlist_id)) {
            clearInterval(this.pollingJobs.get(playlist_id)!.intervalId);
        }

        const intervalId = setInterval(() => {
            this.pollPlaylist(playlist);
        }, check_interval_minutes * 60 * 1000);

        this.pollingJobs.set(playlist_id, {
            intervalId,
            intervalMinutes: check_interval_minutes,
            regex: regex_filter
        });

        console.log(`Scheduled polling for playlist '${title}' every ${check_interval_minutes} minutes`);
    }

    public removePolling(playlistId: string): void {
        const job = this.pollingJobs.get(playlistId);
        if (job) {
            clearInterval(job.intervalId);
            this.pollingJobs.delete(playlistId);
        }
    }

    public async updateYtSubsPlaylists(): Promise<void> {
        const settings = this.databaseService.getSettingsAsObject();
        const ytSubsApiKey = settings.ytsubs_apikey;
        const excludeShorts = (settings.exclude_shorts ?? 'false') === 'true';

        if (!ytSubsApiKey) {
            return;
        }

        try {
            const response = await this.httpClient.fetchWithRetry(
                `https://ytsubs.app/subscriptions?api_key=${ytSubsApiKey}`
            );
            const data: YtSubsResponse = await response.json();

            const fetchedSubs = data.subscriptions.map(sub => ({
                channel_id: sub.snippet.resourceId.channelId,
                playlist_id: sub.snippet.resourceId.channelId.replace(
                    /^UC/,
                    excludeShorts ? 'UULF' : 'UU'
                ),
                title: sub.snippet.title,
                check_interval_minutes: 15,
                author_name: sub.snippet.title,
                author_uri: `https://www.youtube.com/channel/${sub.snippet.resourceId.channelId}`,
                thumbnail: sub.snippet.thumbnails?.high?.url || '',
                source: 'ytsubs.app' as const,
            }));

            const fetchedIds = new Set(fetchedSubs.map(s => s.playlist_id));
            const existing = this.databaseService.getPlaylists('ytsubs.app');

            // Add or update subscribed playlists
            for (const sub of fetchedSubs) {
                const channelInfo = await this.channelInfoParser.parseAdditionalChannelData(
                    `https://www.youtube.com/channel/${sub.channel_id}`
                );

                const playlistData = {
                    ...sub,
                    banner: channelInfo.banner
                };

                this.databaseService.insertPlaylist(playlistData, true);

                // Create a polling job for the new subscription
                if (!this.pollingJobs.has(sub.playlist_id)) {
                    console.log(`[YTSubs.app] Added '${sub.title}'`);
                    this.databaseService.insertActivity({
                        playlist_id: sub.playlist_id,
                        title: sub.title,
                        url: `https://www.youtube.com/playlist?list=${sub.playlist_id}`,
                        message: 'Playlist added (YTSubs.app)',
                        icon: 'view-list'
                    });

                    await this.pollPlaylist(sub, false);
                    this.schedulePolling(sub);
                }
            }

            // Remove unsubscribed playlists
            for (const existingPlaylist of existing) {
                if (!fetchedIds.has(existingPlaylist.playlist_id)) {
                    this.removePolling(existingPlaylist.playlist_id);
                    this.databaseService.deletePlaylist(existingPlaylist.playlist_id);

                    console.log(`[YTSubs.app] Removed '${existingPlaylist.title}' (${existingPlaylist.playlist_id})`);
                    this.databaseService.insertActivity({
                        playlist_id: existingPlaylist.playlist_id,
                        title: existingPlaylist.title,
                        url: `https://www.youtube.com/playlist?list=${existingPlaylist.playlist_id}`,
                        message: 'Playlist removed (YTSubs.app)',
                        icon: 'trash'
                    });
                }
            }
        } catch (err) {
            console.error('Failed to sync YTSubs subscriptions:', err);
        }
    }

    private async pollPlaylist(playlist: Playlist, alertForNewVideos = true): Promise<void> {
        const now = Date.now();
        const lastChecked = playlist.last_checked ? new Date(playlist.last_checked).getTime() : 0;
        const intervalMs = (playlist.check_interval_minutes || 60) * 60 * 1000;

        if (now - lastChecked < intervalMs) {
            return;
        }

        console.log(`[Poll] Checking: ${playlist.title} (${playlist.playlist_id})`);

        try {
            const settings = this.databaseService.getSettingsAsObject();
            const excludeShorts = (settings.exclude_shorts ?? 'false') === 'true';

            await this.rssParserService.parseVideosFromFeed(
                playlist.playlist_id,
                undefined,
                async (video, alreadyExists) => {
                    if (alreadyExists || !alertForNewVideos) {
                        return;
                    }

                    // Optional regex filter
                    if (playlist.regex_filter && !new RegExp(playlist.regex_filter, 'i').test(video.title)) {
                        return;
                    }

                    // Skip shorts if that setting is turned on
                    if (excludeShorts && video.link.includes('/shorts/')) {
                        return;
                    }

                    console.log(`New video found: ${video.title}`);
                    this.databaseService.insertActivity({
                        playlist_id: playlist.playlist_id,
                        title: video.title,
                        url: `https://www.youtube.com/watch?v=${video.video_id}`,
                        message: 'New video found!',
                        icon: 'camera-video-fill'
                    });

                    const postProcessors = this.databaseService.getPostProcessors();
                    for (const postProcessor of postProcessors) {
                        try {
                            await this.postProcessorService.runPostProcessor(
                                postProcessor.type,
                                postProcessor.target,
                                postProcessor.data,
                                { video, playlist }
                            );

                            this.databaseService.insertActivity({
                                playlist_id: playlist.playlist_id,
                                title: video.title,
                                url: undefined,
                                message: `Post processor '${postProcessor.name}' run`,
                                icon: postProcessor.type === 'webhook' ? 'broadcast' : 'cpu-fill'
                            });
                        } catch (error) {
                            console.error(`Error running post processor '${postProcessor.name}':`, error);
                        }
                    }
                }
            );

            this.databaseService.updatePlaylist(
                playlist.playlist_id,
                undefined,
                undefined,
                new Date().toISOString()
            );
        } catch (err) {
            console.error(`Failed to poll ${playlist.title}:`, err);
        }
    }
}
