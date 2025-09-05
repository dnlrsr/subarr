import { Request, Response } from 'express';
import { DatabaseService } from '../services/DatabaseService';
import { PollingService } from '../services/PollingService';
import { RssParserService } from '../services/RssParserService';
import { ChannelInfoParser } from '../utils';

export class PlaylistController {
    private databaseService: DatabaseService;
    private rssParserService: RssParserService;
    private pollingService: PollingService;
    private channelInfoParser: ChannelInfoParser;

    constructor(
        databaseService: DatabaseService,
        rssParserService: RssParserService,
        pollingService: PollingService
    ) {
        this.databaseService = databaseService;
        this.rssParserService = rssParserService;
        this.pollingService = pollingService;
        this.channelInfoParser = new ChannelInfoParser();
    }

    public getPlaylists = (req: Request, res: Response): void => {
        try {
            const playlists = this.databaseService.getPlaylists();
            res.json(playlists);
        } catch (error) {
            console.error('Error fetching playlists:', error);
            res.status(500).json({ error: 'Failed to fetch playlists' });
        }
    };

    public createPlaylist = async (req: Request, res: Response): Promise<void> => {
        try {
            let { playlistId } = req.body;

            if (!/^(PL|UU|LL|FL)[\w-]{10,}$/.test(playlistId)) {
                res.status(400).json({ error: 'Invalid playlist ID' });
                return;
            }

            const settings = this.databaseService.getSettingsAsObject();
            const excludeShorts = (settings.exclude_shorts ?? 'false') === 'true';

            if (excludeShorts) {
                playlistId = playlistId.replace(/^UU(?!LF)/, 'UULF');
            }

            let playlistDbId: number | null = null;

            await this.rssParserService.parseVideosFromFeed(playlistId, async playlist => {
                if (playlistId.startsWith('UU')) {
                    const channelInfo = await this.channelInfoParser.parseAdditionalChannelData(
                        `https://www.youtube.com/channel/${playlist.channel_id}`
                    );
                    playlist.thumbnail = channelInfo.thumbnail;
                    playlist.banner = channelInfo.banner;
                }

                const info = this.databaseService.insertPlaylist({
                    playlist_id: playlist.playlist_id,
                    author_name: playlist.author_name,
                    author_uri: playlist.author_uri,
                    title: playlist.title,
                    check_interval_minutes: 60,
                    regex_filter: '',
                    last_checked: undefined,
                    thumbnail: playlist.thumbnail || undefined,
                    banner: playlist.banner || undefined,
                    source: 'manual'
                });
                playlistDbId = info.lastInsertRowid as number;

                this.databaseService.insertActivity({
                    playlist_id: playlistId,
                    title: playlist.title,
                    url: `https://www.youtube.com/playlist?list=${playlistId}`,
                    message: 'Playlist added (manual)',
                    icon: 'view-list'
                });

                // Fetch newly added playlist to pass into schedulePolling
                const newPlaylist = this.databaseService.getPlaylist(playlistDbId);
                if (newPlaylist) {
                    this.pollingService.schedulePolling(newPlaylist);
                }
            });

            res.status(201).json({ id: playlistDbId });
        } catch (err) {
            const error = err as Error;
            if (error.message.includes('UNIQUE constraint failed')) {
                res.status(500).json({ error: 'Playlist is already added' });
                return;
            }

            console.error('Failed to fetch RSS feed', error);
            res.status(500).json({ error: 'Failed to fetch playlist metadata' });
        }
    };

    public getPlaylist = (req: Request, res: Response): void => {
        try {
            const playlist = this.databaseService.getPlaylist(parseInt(req.params.id));
            if (!playlist) {
                res.status(404).json({ error: 'Not found' });
                return;
            }

            const videos = this.databaseService.getVideosForPlaylist(playlist.playlist_id);
            res.json({ playlist, videos });
        } catch (error) {
            console.error('Error fetching playlist:', error);
            res.status(500).json({ error: 'Failed to fetch playlist' });
        }
    };

    public updatePlaylistSettings = (req: Request, res: Response): void => {
        try {
            const { check_interval_minutes, regex_filter } = req.body;
            const playlistId = parseInt(req.params.id);

            this.databaseService.updatePlaylist(playlistId.toString(), check_interval_minutes, regex_filter);

            const updatedPlaylist = this.databaseService.getPlaylist(playlistId);
            if (updatedPlaylist) {
                this.pollingService.schedulePolling(updatedPlaylist);
            }

            res.json({ success: true });
        } catch (error) {
            console.error('Error updating playlist settings:', error);
            res.status(500).json({ error: 'Failed to update playlist settings' });
        }
    };

    public deletePlaylist = (req: Request, res: Response): void => {
        try {
            const playlist = this.databaseService.getPlaylist(parseInt(req.params.id));
            if (!playlist) {
                res.status(404).json({ error: 'Not found' });
                return;
            }

            this.pollingService.removePolling(playlist.playlist_id);
            this.databaseService.deletePlaylist(playlist.playlist_id);
            this.databaseService.deleteVideosForPlaylist(playlist.playlist_id);

            this.databaseService.insertActivity({
                playlist_id: playlist.playlist_id,
                title: playlist.title,
                url: `https://www.youtube.com/playlist?list=${playlist.playlist_id}`,
                message: 'Playlist removed (manual)',
                icon: 'trash'
            });

            res.json({ success: true });
        } catch (error) {
            console.error('Error deleting playlist:', error);
            res.status(500).json({ error: 'Failed to delete playlist' });
        }
    };

    public searchPlaylist = async (req: Request, res: Response): Promise<void> => {
        try {
            let playlistInfo: any;
            const query = req.query.q as string;

            const hasValidPlaylistId = (query: string) => /(UC|UU|PL|LL|FL)[\w-]{10,}/.test(query);

            if (hasValidPlaylistId(query)) {
                const match = query.match(/(UC|UU|PL|LL|FL)[\w-]{10,}/);
                if (match) {
                    const adjustedPlaylistId = match[0].replace(/^UC/, 'UU');
                    await this.rssParserService.parseVideosFromFeed(adjustedPlaylistId, playlist => {
                        playlistInfo = playlist;
                    });
                }
            } else if (/(https:\/\/)?(www\.)?youtube\.com\/(@|channel)/.test(query)) {
                const url = query.startsWith('https://') ? query : `https://${query}`;
                const channelInfo = await this.channelInfoParser.parseAdditionalChannelData(url);

                if (channelInfo.playlist_id) {
                    console.log(`Successfully grabbed channel playlist id from source code of ${query}`);
                    await this.rssParserService.parseVideosFromFeed(channelInfo.playlist_id, playlist => {
                        playlistInfo = playlist;
                    });

                    if (playlistInfo) {
                        playlistInfo.thumbnail = channelInfo.thumbnail;
                        playlistInfo.banner = channelInfo.banner;
                    }
                } else {
                    throw new Error(`Could not extract playlist id from source code of ${query}`);
                }
            } else {
                throw new Error(`Could not understand '${query}'`);
            }

            res.json(playlistInfo);
        } catch (err) {
            const error = err as Error;
            console.error('Failed to parse playlist:', error.message);
            res.status(400).json({ error: `Couldn't find any results for '${req.query.q}'` });
        }
    };
}
