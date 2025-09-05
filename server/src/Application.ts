import cors from 'cors';
import dotenv from 'dotenv';
import express from 'express';
import path from 'path';

// Services
import { DatabaseService } from './services/DatabaseService';
import { PollingService } from './services/PollingService';
import { PostProcessorService } from './services/PostProcessorService';
import { RssParserService } from './services/RssParserService';

// Controllers
import { ActivityController } from './controllers/ActivityController';
import { MetaController } from './controllers/MetaController';
import { PlaylistController } from './controllers/PlaylistController';
import { PostProcessorController } from './controllers/PostProcessorController';
import { SettingsController } from './controllers/SettingsController';

export class Application {
    private app: express.Application;
    private port: number;

    // Services
    private databaseService!: DatabaseService;
    private rssParserService!: RssParserService;
    private postProcessorService!: PostProcessorService;
    private pollingService!: PollingService;

    // Controllers
    private playlistController!: PlaylistController;
    private activityController!: ActivityController;
    private settingsController!: SettingsController;
    private postProcessorController!: PostProcessorController;
    private metaController!: MetaController;

    constructor() {
        dotenv.config();

        this.app = express();
        this.port = parseInt(process.env.PORT || '3001');

        this.initializeServices();
        this.initializeControllers();
        this.initializeMiddleware();
        this.initializeRoutes();
        this.initializePolling();
        this.scheduleYtSubsUpdates();
    }

    private initializeServices(): void {
        this.databaseService = new DatabaseService();
        this.rssParserService = new RssParserService(this.databaseService);
        this.postProcessorService = new PostProcessorService(this.databaseService);
        this.pollingService = new PollingService(
            this.databaseService,
            this.rssParserService,
            this.postProcessorService
        );
    }

    private initializeControllers(): void {
        this.playlistController = new PlaylistController(
            this.databaseService,
            this.rssParserService,
            this.pollingService
        );
        this.activityController = new ActivityController(this.databaseService);
        this.settingsController = new SettingsController(this.databaseService);
        this.postProcessorController = new PostProcessorController(
            this.databaseService,
            this.postProcessorService
        );
        this.metaController = new MetaController();
    }

    private initializeMiddleware(): void {
        this.app.use(cors());
        this.app.use(express.json());
    }

    private initializeRoutes(): void {
        // Playlist routes
        this.app.get('/api/playlists', this.playlistController.getPlaylists);
        this.app.post('/api/playlists', this.playlistController.createPlaylist);
        this.app.get('/api/playlists/:id', this.playlistController.getPlaylist);
        this.app.put('/api/playlists/:id/settings', this.playlistController.updatePlaylistSettings);
        this.app.delete('/api/playlists/:id', this.playlistController.deletePlaylist);
        this.app.get('/api/search', this.playlistController.searchPlaylist);
        this.app.post('/api/videos/:videoId/download', this.playlistController.downloadVideo);

        // Activity routes
        this.app.get('/api/activity/:page', this.activityController.getActivities);

        // Settings routes
        this.app.get('/api/settings', this.settingsController.getSettings);
        this.app.put('/api/settings', this.settingsController.updateSettings);

        // Post processor routes
        this.app.get('/api/postprocessors', this.postProcessorController.getPostProcessors);
        this.app.post('/api/postprocessors', this.postProcessorController.createPostProcessor);
        this.app.put('/api/postprocessors/:id', this.postProcessorController.updatePostProcessor);
        this.app.delete('/api/postprocessors/:id', this.postProcessorController.deletePostProcessor);
        this.app.post('/api/postprocessors/test', this.postProcessorController.testPostProcessor);

        // Meta routes
        this.app.get('/api/meta', this.metaController.getMeta);

        // Static file serving for production
        if (process.env.NODE_ENV === 'production') {
            this.app.use(express.static(path.join(__dirname, '..', '..', 'client', 'build')));

            this.app.use((req, res, next) => {
                const accept = req.headers.accept || '';
                if (req.method === 'GET' && accept.includes('text/html')) {
                    res.sendFile(path.resolve(__dirname, '..', '..', 'client', 'build', 'index.html'));
                } else {
                    next();
                }
            });
        }
    }

    private initializePolling(): void {
        // Schedule polling for existing playlists
        const playlists = this.databaseService.getPlaylists();
        for (const playlist of playlists) {
            this.pollingService.schedulePolling(playlist);
        }

        // Schedule the watcher for video states
        this.pollingService.scheduleWatcher();
    }

    private scheduleYtSubsUpdates(): void {
        // Schedule YTSubs.app polling
        setInterval(() => {
            this.pollingService.updateYtSubsPlaylists();
        }, 60 * 60 * 1000); // Every hour

        // Also run on startup
        this.pollingService.updateYtSubsPlaylists();
    }

    public start(): void {
        this.app.listen(this.port, () => {
            console.log(`Server running on http://localhost:${this.port}`);
        });
    }

    public stop(): void {
        this.databaseService.close();
    }
}
