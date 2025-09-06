import { Activity, GitHubRelease, MetaInfo, Playlist, PlaylistInfo, PostProcessor, Settings, VideoInfo } from '../types';

const API_BASE = '/api';

class ApiService {
    private async request<T>(endpoint: string, options?: RequestInit): Promise<T> {
        const response = await fetch(`${API_BASE}${endpoint}`, {
            headers: {
                'Content-Type': 'application/json',
                ...options?.headers,
            },
            ...options,
        });

        if (!response.ok) {
            throw new Error(`API request failed: ${response.statusText}`);
        }

        return response.json();
    }

    // Playlist endpoints
    async getPlaylists(): Promise<Playlist[]> {
        return this.request<Playlist[]>('/playlists');
    }

    async getPlaylist(id: string): Promise<Playlist> {
        return this.request<Playlist>(`/playlists/${id}`);
    }

    async createPlaylist(playlist: Omit<Playlist, 'id'>): Promise<Playlist> {
        return this.request<Playlist>('/playlists', {
            method: 'POST',
            body: JSON.stringify(playlist),
        });
    }

    async updatePlaylist(id: string, playlist: Partial<Playlist>): Promise<Playlist> {
        return this.request<Playlist>(`/playlists/${id}`, {
            method: 'PUT',
            body: JSON.stringify(playlist),
        });
    }

    async deletePlaylist(id: string): Promise<void> {
        return this.request<void>(`/playlists/${id}`, {
            method: 'DELETE',
        });
    }

    // Video endpoints
    async getPlaylistVideos(playlistId: string): Promise<VideoInfo[]> {
        return this.request<VideoInfo[]>(`/playlists/${playlistId}/videos`);
    }

    // Activity endpoints
    async getActivity(): Promise<Activity[]> {
        return this.request<Activity[]>('/activity');
    }

    // Settings endpoints
    async getSettings(): Promise<Settings> {
        return this.request<Settings>('/settings');
    }

    async updateSettings(settings: Settings): Promise<Settings> {
        return this.request<Settings>('/settings', {
            method: 'PUT',
            body: JSON.stringify(settings),
        });
    }

    // PostProcessor endpoints
    async getPostProcessors(): Promise<PostProcessor[]> {
        return this.request<PostProcessor[]>('/postprocessors');
    }

    async createPostProcessor(postProcessor: Omit<PostProcessor, 'id'>): Promise<PostProcessor> {
        return this.request<PostProcessor>('/postprocessors', {
            method: 'POST',
            body: JSON.stringify(postProcessor),
        });
    }

    async updatePostProcessor(id: string, postProcessor: Partial<PostProcessor>): Promise<PostProcessor> {
        return this.request<PostProcessor>(`/postprocessors/${id}`, {
            method: 'PUT',
            body: JSON.stringify(postProcessor),
        });
    }

    async deletePostProcessor(id: string): Promise<void> {
        return this.request<void>(`/postprocessors/${id}`, {
            method: 'DELETE',
        });
    }

    // Meta endpoints
    async getMeta(): Promise<MetaInfo> {
        return this.request<MetaInfo>('/meta');
    }

    // External APIs
    async getLatestGitHubRelease(): Promise<GitHubRelease> {
        const response = await fetch('https://api.github.com/repos/derekantrican/subarr/releases');
        const releases = await response.json();
        return releases[0];
    }

    // Playlist info endpoints
    async getPlaylistInfo(url: string): Promise<PlaylistInfo> {
        return this.request<PlaylistInfo>(`/playlist-info?url=${encodeURIComponent(url)}`);
    }
}

export const apiService = new ApiService();
export default apiService;
