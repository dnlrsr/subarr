// Client-side type definitions based on server types
export interface Playlist {
    id?: number;
    playlist_id: string;
    author_name?: string;
    author_uri?: string;
    title: string;
    check_interval_minutes: number;
    regex_filter?: string;
    last_checked?: string;
    thumbnail?: string;
    banner?: string;
    source: 'manual' | 'ytsubs.app';
    last_updated?: string;
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
    playlist_id?: string;
    title?: string;
    url?: string;
    message: string;
    icon: string;
    playlist_db_id?: number;
    playlist_title?: string;
}

export interface Settings {
    [key: string]: string;
}

export interface PostProcessor {
    id?: number;
    name: string;
    type: 'webhook';
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
    thumbnail?: string;
    banner?: string;
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

// Additional client-specific types
export interface SearchResultsProps {
    isOpen: string;
    searchResults: Playlist[];
    highlightedSearchResult: number;
    onClose: () => void;
}

export interface DialogBaseProps {
    isOpen: boolean;
    onClose: () => void;
    title: string;
    children: React.ReactNode;
    buttons?: React.ReactNode;
}

export interface ThumbnailProps {
    src?: string;
    alt: string;
    width?: number;
    height?: number;
}

export interface LoadingIndicatorProps {
    size?: 'small' | 'medium' | 'large';
}

export interface GitHubRelease {
    tag_name: string;
    published_at: string;
    body: string;
    html_url: string;
}

export interface MetaInfo {
    versions: {
        subarr: number;
    };
}
