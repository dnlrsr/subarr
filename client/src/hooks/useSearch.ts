import { useCallback, useState } from 'react';
import { Playlist } from '../types';

export const useSearch = (playlists: Playlist[]) => {
    const [searchTerm, setSearchTerm] = useState<string>('');
    const [highlightedIndex, setHighlightedIndex] = useState<number>(-1);

    const searchResults = playlists.filter(playlist =>
        playlist.title.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const resetSearch = useCallback(() => {
        setSearchTerm('');
        setHighlightedIndex(-1);
    }, []);

    const handleKeyDown = useCallback(
        (event: React.KeyboardEvent<HTMLInputElement>, onNavigate: (playlistId: string) => void) => {
            if (event.key === 'ArrowDown' || event.key === 'Tab') {
                event.preventDefault();
                setHighlightedIndex(prev =>
                    prev < searchResults.length - 1 ? prev + 1 : prev
                );
            } else if (event.key === 'ArrowUp') {
                event.preventDefault();
                setHighlightedIndex(prev => prev > 0 ? prev - 1 : -1);
            } else if (event.key === 'Enter') {
                event.preventDefault();
                if (highlightedIndex > -1 && searchResults[highlightedIndex]) {
                    onNavigate(searchResults[highlightedIndex].playlist_id);
                    resetSearch();
                }
            }
        },
        [highlightedIndex, searchResults, resetSearch]
    );

    return {
        searchTerm,
        setSearchTerm,
        searchResults,
        highlightedIndex,
        setHighlightedIndex,
        handleKeyDown,
        resetSearch,
    };
};
