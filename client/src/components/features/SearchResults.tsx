import React, { useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { SearchResultsProps } from '../../types';
import { Card, Thumbnail } from '../ui';
import './SearchResults.css';

const SearchResults: React.FC<SearchResultsProps> = ({
  isOpen,
  searchResults,
  highlightedSearchResult,
  onClose,
}) => {
  const itemRefs = useRef<(HTMLAnchorElement | null)[]>([]);

  useEffect(() => {
    if (highlightedSearchResult >= 0 && itemRefs.current[highlightedSearchResult]) {
      itemRefs.current[highlightedSearchResult]?.scrollIntoView({
        block: 'nearest',
        behavior: 'smooth',
      });
    }
  }, [highlightedSearchResult]);

  if (!isOpen) {
    return null;
  }

  return (
    <div style={{ padding: '0 15px' }}>
      <Card>
        <Card.Body>
          <div style={{ padding: 0 }}>
        {searchResults.length > 0 ? (
          searchResults.map((playlist, index) => (
            <Link
              key={playlist.id || playlist.playlist_id}
              ref={(el: HTMLAnchorElement | null) => {
                itemRefs.current[index] = el;
              }}
              className={`search-result ${
                highlightedSearchResult === index ? 'highlighted' : ''
              }`}
              style={{
                color: 'inherit',
                textDecoration: 'none',
                padding: '10px',
                display: 'block',
                borderBottom: index < searchResults.length - 1 ? '1px solid #444' : 'none',
              }}
              to={`/playlist/${playlist.id}`}
              onClick={onClose}
            >
              <div style={{ display: 'flex', gap: 10 }}>
                <div style={{ flexShrink: 0 }}>
                  <Thumbnail src={playlist.thumbnail} alt={playlist.title} width={80} height={45} />
                </div>
                <div
                  style={{
                    fontSize: 'small',
                    // The below styles limit the title to three lines on small screens & truncate the title with an ellipsis (...)
                    display: '-webkit-box',
                    WebkitLineClamp: 3,
                    WebkitBoxOrient: 'vertical',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                  }}
                >
                  {playlist.title}
                </div>
              </div>
            </Link>
          ))
        ) : (
          <div style={{ fontSize: 'small', padding: '10px' }}>No Results</div>
        )}
          </div>
        </Card.Body>
      </Card>
    </div>
  );
};

export default SearchResults;
