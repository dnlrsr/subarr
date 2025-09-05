import Database from 'better-sqlite3';
import * as fs from 'fs';
import * as path from 'path';
import { Activity, Playlist, PostProcessor, Settings, Video } from '../models/types';

export class DatabaseService {
    private db: Database.Database;

    constructor() {
        this.db = this.initializeDatabase();
        this.createTables();
    }

    private initializeDatabase(): Database.Database {
        let dir = path.resolve("/data/db");
        if (!fs.existsSync(dir)) {
            dir = path.resolve(__dirname, '../../../data/db');
            if (!fs.existsSync(dir)) {
                fs.mkdirSync(dir, { recursive: true });
            }
        }

        const dbPath = fs.existsSync(path.join(dir, 'youtubarr.db'))
            ? path.join(dir, 'youtubarr.db')
            : path.join(dir, 'subarr.db');

        return new Database(dbPath);
    }

    private createTables(): void {
        this.db.exec(`
      CREATE TABLE IF NOT EXISTS playlists (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        playlist_id TEXT NOT NULL UNIQUE,
        author_name TEXT,
        author_uri TEXT,
        title TEXT,
        check_interval_minutes INTEGER DEFAULT 60,
        regex_filter TEXT,
        last_checked TEXT,
        thumbnail TEXT,
        banner TEXT,
        source TEXT DEFAULT 'manual'
      );

      CREATE TABLE IF NOT EXISTS videos (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        playlist_id TEXT NOT NULL,
        video_id TEXT NOT NULL,
        title TEXT,
        published_at TEXT,
        thumbnail TEXT,
        state TEXT NOT NULL DEFAULT 'missing',
        UNIQUE (playlist_id, video_id)
      );

      CREATE TABLE IF NOT EXISTS activity (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        datetime TEXT NOT NULL,
        playlist_id TEXT,
        title TEXT,
        url TEXT,
        message TEXT,
        icon TEXT NOT NULL
      );

      CREATE TABLE IF NOT EXISTS settings (
        key TEXT PRIMARY KEY,
        value TEXT
      );

      CREATE TABLE IF NOT EXISTS post_processors (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        type TEXT NOT NULL,
        target TEXT NOT NULL,
        data TEXT NOT NULL
      );
    `);
    }

    // Playlist operations
    public getPlaylists(filteredSource?: string): Playlist[] {
        const stmt = this.db.prepare(`
      SELECT 
        p.*, 
        v.last_updated
      FROM playlists p
      LEFT JOIN (
        SELECT 
          playlist_id, 
          MAX(published_at) AS last_updated
        FROM videos
        GROUP BY playlist_id
      ) v ON p.playlist_id = v.playlist_id
      ${filteredSource ? `WHERE p.source = ?` : ''}
    `);

        return (filteredSource ? stmt.all(filteredSource) : stmt.all()) as Playlist[];
    }

    public getPlaylist(playlistDbId: number): Playlist | undefined {
        return this.db.prepare('SELECT * FROM playlists WHERE id = ?').get(playlistDbId) as Playlist | undefined;
    }

    public insertPlaylist(playlist: Omit<Playlist, 'id'>, updateOnConflict = false): Database.RunResult {
        const stmt = this.db.prepare(`
      INSERT INTO playlists (playlist_id, author_name, author_uri, title, check_interval_minutes, regex_filter, last_checked, thumbnail, banner, source)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      ${updateOnConflict ?
                `ON CONFLICT(playlist_id) DO UPDATE SET
        author_name = excluded.author_name,
        author_uri = excluded.author_uri,
        title = excluded.title,
        thumbnail = excluded.thumbnail,
        banner = excluded.banner,
        source = excluded.source`
                : ''}
    `);

        return stmt.run(
            playlist.playlist_id,
            playlist.author_name,
            playlist.author_uri,
            playlist.title,
            playlist.check_interval_minutes ?? 60,
            playlist.regex_filter ?? '',
            playlist.last_checked ?? null,
            playlist.thumbnail,
            playlist.banner,
            playlist.source
        );
    }

    public updatePlaylist(
        id: number,
        checkIntervalMinutes?: number,
        regexFilter?: string,
        lastChecked?: string
    ): void {
        const sets: string[] = [];
        const params: Record<string, any> = { id: id };

        if (checkIntervalMinutes !== undefined) {
            sets.push('check_interval_minutes = @check_interval_minutes');
            params.check_interval_minutes = checkIntervalMinutes;
        }
        if (regexFilter !== undefined) {
            sets.push('regex_filter = @regex_filter');
            params.regex_filter = regexFilter;
        }
        if (lastChecked !== undefined) {
            sets.push('last_checked = @last_checked');
            params.last_checked = lastChecked;
        }

        if (sets.length === 0) return;

        const sql = `UPDATE playlists SET ${sets.join(', ')} WHERE id = @id`;
        this.db.prepare(sql).run(params);
    }

    public deletePlaylist(playlistId: string): void {
        this.db.prepare('DELETE FROM playlists WHERE playlist_id = ?').run(playlistId);
    }

    // Video operations
    public getVideosForPlaylist(playlistId: string): Video[] {
        return this.db.prepare('SELECT * FROM videos WHERE playlist_id = ? ORDER BY published_at DESC').all(playlistId) as Video[];
    }

    public insertVideo(video: Omit<Video, 'id'>): Database.RunResult {
        const stmt = this.db.prepare(`
      INSERT OR IGNORE INTO videos (playlist_id, video_id, title, published_at, thumbnail, state)
      VALUES (?, ?, ?, ?, ?, ?)
    `);
        return stmt.run(
            video.playlist_id,
            video.video_id,
            video.title,
            video.published_at,
            video.thumbnail,
            video.state || 'missing'
        );
    }

    public deleteVideosForPlaylist(playlistId: string): void {
        this.db.prepare('DELETE FROM videos WHERE playlist_id = ?').run(playlistId);
    }

    public getVideoStatePendings(): Video[] {
        return this.db.prepare('SELECT * FROM videos WHERE state = ?').all('pending') as Video[];
    }

    public getVideoState(videoId: string): { state: string } | undefined {
        return this.db.prepare('SELECT state FROM videos WHERE video_id = ? LIMIT 1').get(videoId) as { state: string } | undefined;
    }

    public setVideoState(videoId: string, state: Video['state']): void {
        this.db.prepare('UPDATE videos SET state = ? WHERE video_id = ?').run(state, videoId);
    }

    public getVideoById(videoId: string): Video | undefined {
        return this.db.prepare('SELECT * FROM videos WHERE video_id = ? LIMIT 1').get(videoId) as Video | undefined;
    }

    // Activity operations
    public getActivitiesCount(): { count: number } {
        return this.db.prepare(`SELECT COUNT(*) as count FROM activity`).get() as { count: number };
    }

    public getActivities(pageSize: number, offset: number): Activity[] {
        return this.db.prepare(`
      SELECT a.id, a.datetime, a.playlist_id, a.title, a.url, a.message, a.icon, p.id AS playlist_db_id, p.title AS playlist_title
      FROM activity a
      LEFT JOIN playlists p ON a.playlist_id = p.playlist_id
      ORDER BY a.id DESC
      LIMIT ? OFFSET ?
    `).all(pageSize, offset) as Activity[];
    }

    public insertActivity(activity: Omit<Activity, 'id' | 'datetime'>): void {
        this.db.prepare(`INSERT INTO activity (datetime, playlist_id, title, url, message, icon) VALUES (?, ?, ?, ?, ?, ?)`)
            .run(
                new Date().toISOString(),
                activity.playlist_id ?? null,
                activity.title ?? null,
                activity.url ?? null,
                activity.message,
                activity.icon
            );
    }

    // Settings operations
    public getSettings(): Array<{ key: string; value: string }> {
        return this.db.prepare('SELECT key, value FROM settings').all() as Array<{ key: string; value: string }>;
    }

    public getSettingsAsObject(): Settings {
        const settings = this.getSettings();
        return Object.fromEntries(settings.map(row => [row.key, row.value]));
    }

    public insertSettings(settings: Settings): void {
        const stmt = this.db.prepare(`
      INSERT INTO settings (key, value)
      VALUES (?, ?)
      ON CONFLICT(key) DO UPDATE SET value = excluded.value
    `);

        const insertMany = this.db.transaction((settingsObj: Settings) => {
            for (const [key, value] of Object.entries(settingsObj)) {
                stmt.run(key, value);
            }
        });

        insertMany(settings);
    }

    // Post Processor operations
    public getPostProcessors(): PostProcessor[] {
        return this.db.prepare('SELECT * FROM post_processors').all() as PostProcessor[];
    }

    public insertPostProcessor(postProcessor: Omit<PostProcessor, 'id'>): Database.RunResult {
        const stmt = this.db.prepare(`
      INSERT INTO post_processors (name, type, target, data)
      VALUES (?, ?, ?, ?)
    `);
        return stmt.run(postProcessor.name, postProcessor.type, postProcessor.target, postProcessor.data);
    }

    public updatePostProcessor(id: number, postProcessor: Omit<PostProcessor, 'id'>): Database.RunResult {
        return this.db.prepare(`
      UPDATE post_processors SET name = ?, type = ?, target = ?, data = ? WHERE id = ?
    `).run(postProcessor.name, postProcessor.type, postProcessor.target, postProcessor.data, id);
    }

    public deletePostProcessor(id: number): Database.RunResult {
        return this.db.prepare(`DELETE FROM post_processors WHERE id = ?`).run(id);
    }

    public close(): void {
        this.db.close();
    }
}
