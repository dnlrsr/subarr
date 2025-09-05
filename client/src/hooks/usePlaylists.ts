import { useEffect, useState } from 'react';
import { apiService } from '../services/api';
import { Playlist } from '../types';

export const usePlaylists = () => {
    const [playlists, setPlaylists] = useState<Playlist[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchPlaylists = async () => {
            try {
                setLoading(true);
                const data = await apiService.getPlaylists();
                setPlaylists(data);
            } catch (err) {
                setError(err instanceof Error ? err.message : 'Failed to load playlists');
            } finally {
                setLoading(false);
            }
        };

        fetchPlaylists();
    }, []);

    const refreshPlaylists = async () => {
        try {
            const data = await apiService.getPlaylists();
            setPlaylists(data);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to refresh playlists');
        }
    };

    return {
        playlists,
        loading,
        error,
        refreshPlaylists,
    };
};
