import { Link } from "react-router-dom";
import Thumbnail from "./Thumbnail";
import { useEffect, useRef } from "react";

function SearchResults({isOpen, searchResults, highlightedSearchResult, onClose}) {
  const itemRefs = useRef([]);

  useEffect(() => {
    if (highlightedSearchResult >= 0 && itemRefs.current[highlightedSearchResult]) {
      itemRefs.current[highlightedSearchResult].scrollIntoView({
        block: "nearest",
        behavior: "smooth"
      });
    }
  }, [highlightedSearchResult]);

  if (!isOpen)
    return null;

  return (
    <div className='search-results'>
      {searchResults.length > 0 ? 
        searchResults.map((p, i) =>
          <Link ref={el => (itemRefs.current[i] = el)} className={`search-result ${highlightedSearchResult === i ? 'highlighted' : ''}`} style={{color: 'inherit', textDecoration: 'none', padding: '3px 10px'}}
                        to={`/playlist/${p.id}`} onClick={() => onClose()}>
            <div style={{display: 'flex', gap: 10}}>
              <div style={{flexShrink: 0}}>
                <Thumbnail src={p.thumbnail} width='80' height='45'/>
              </div>
              <div style={{
                fontSize: 'small',
                // The below styles limit the title to three lines on small screens & truncate the title with an ellipsis (...)
                display: '-webkit-box',
                WebkitLineClamp: 3,
                WebkitBoxOrient: 'vertical',
                overflow: 'hidden',
                textOverflow: 'ellipsis'
              }}>
                {p.title}
              </div>
            </div>
          </Link>
        ) 
        : <div style={{fontSize: 'small'}}>No Results</div>}
    </div>
  );
}

export default SearchResults;