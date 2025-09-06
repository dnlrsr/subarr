import React, { useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { SearchResultsProps } from '../../types';
import { Card, Thumbnail } from '../ui';

const SearchResults: React.FC<SearchResultsProps> = ({
  isOpen,
  searchResults,
  highlightedSearchResult,
  onClose,
}) => {
  const { t } = useTranslation();
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
    <div >
      <Card>
        <Card.Body>
          <div >
        {searchResults.length > 0 ? (
          searchResults.map((playlist, index) => (
            <Link
              key={playlist.id || playlist.playlist_id}
              ref={(el: HTMLAnchorElement | null) => {
                itemRefs.current[index] = el;
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = '#595959';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = highlightedSearchResult === index ? '#595959' : 'transparent';
              }}
              to={`/playlist/${playlist.id}`}
              onClick={onClose}
            >
              <div >
                <div >
                  <Thumbnail src={playlist.thumbnail} alt={playlist.title} width={80} height={45} />
                </div>
                <div
                >
                  {playlist.title}
                </div>
              </div>
            </Link>
          ))
        ) : (
          <div >{t('searchResults.noResults')}</div>
        )}
          </div>
        </Card.Body>
      </Card>
    </div>
  );
};

export default SearchResults;
