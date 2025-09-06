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


    return {
        searchTerm,
        setSearchTerm,
        searchResults,
        highlightedIndex,
        setHighlightedIndex,
        resetSearch,
    };
};
