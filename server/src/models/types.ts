export interface Playlist {
    id?: number;
    playlist_id: string;
    author_name?: string | undefined;
    author_uri?: string | undefined;
    title: string;
    check_interval_minutes: number;
    regex_filter?: string | undefined;
    last_checked?: string | undefined;
    thumbnail?: string | undefined;
    banner?: string | undefined;
    source: 'manual' | 'ytsubs.app';
    last_updated?: string | undefined;
}

export interface Video {
    id?: number;
    playlist_id: string;
    video_id: string;
    title: string;
    published_at?: string;
    thumbnail?: string;
    state: 'missing' | 'pending' | 'downloading' | 'present' | 'error';
}

export interface Activity {
    id?: number;
    datetime: string;
    playlist_id?: string | undefined;
    title?: string | undefined;
    url?: string | undefined;
    message: string;
    icon: string;
    playlist_db_id?: number | undefined;
    playlist_title?: string | undefined;
}

export interface Settings {
    [key: string]: string;
}

export interface PostProcessor {
    id?: number;
    name: string;
    type: 'webhook' | 'process';
    target: string;
    data: string;
}

export interface VideoInfo {
    title: string;
    video_id: string;
    link: string;
    thumbnail?: string;
    published_at?: string;
    playlist_title: string;
}

export interface PlaylistInfo {
    channel_id?: string;
    playlist_id: string;
    author_name?: string;
    author_uri?: string;
    title: string;
    thumbnail?: string | undefined;
    banner?: string | undefined;
}

export interface ChannelInfo {
    playlist_id?: string;
    thumbnail?: string;
    banner?: string;
}

export interface ApiResponse<T = any> {
    success?: boolean;
    error?: string;
    data?: T;
}

export interface PaginatedResponse<T> {
    page: number;
    totalPages: number;
    data: T[];
}

export interface WebhookConfig {
    method?: string;
    headers?: Record<string, string>;
    body?: string;
}

export interface ProcessConfig {
    args: string;
}

export interface PostProcessorContext {
    video: VideoInfo;
    playlist: Playlist;
}

export interface YtSubsSubscription {
    snippet: {
        resourceId: {
            channelId: string;
        };
        title: string;
        thumbnails?: {
            high?: {
                url: string;
            };
        };
    };
}

export interface YtSubsResponse {
    subscriptions: YtSubsSubscription[];
}
