import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import Thumbnail from '../components/Thumbnail';
import { formatDistance } from 'date-fns';

function SubscriptionsPage({ searchTerm }) {
  const [playlists, setPlaylists] = useState([]);

  useEffect(() => {
    fetch('/api/playlists')
      .then(res => res.json())
      .then(data => {
        const fallbackThumbnail = 'https://i.ytimg.com/vi/5qap5aO4i9A/hqdefault.jpg';
  
        const fetchedPlaylists = data.map(p => ({
          ...p,
          thumbnail: p.thumbnail || fallbackThumbnail,
          lastChecked: p.last_checked,
        }));

        setPlaylists(fetchedPlaylists);
      })
      .catch(err => {
        console.error('Failed to load playlists:', err);
      });
  }, []);

  const filteredPlaylists = playlists.filter(p =>
    p.title.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div
      style={{
        display: 'flex',
        flexWrap: 'wrap',
        gap: '20px',
        padding: '10px'
      }}
    >
      {/* Todo: need header for bulk options like delete multiple playlists, filter view (eg hide 'inactive' playlists that haven't had uploads for a year) */}
      {filteredPlaylists.sort((a, b) => a.title.localeCompare(b.title)).map(playlist => (
        <Link 
          style={{position: 'relative'}}
          className='card'
          key={playlist.id}
          to={`/playlist/${playlist.id}`}
        >
          {playlist.source === 'ytsubs.app' ?
            <img style={{position: 'absolute', left: 3, width: 24, height: 24}} src='https://static.ytsubs.app/logo.png' alt='YTSubs.app'/>
          : null}
          <Thumbnail src={playlist.thumbnail} alt={playlist.title} />
          <div style={{ padding: '10px' }}>
            {/* <div style={{padding: '0px 4px', fontSize: 'small', backgroundColor: 'var(--danger-color)'}}>
              {playlist.source}
            </div> */}
            <h3
              style={{
                fontSize: '1em',
                margin: '0 0 5px 0',
                whiteSpace: 'nowrap',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
              }}
            >
              {playlist.title}
            </h3>
            {/* Todo: Sonarr has an "Options" button to choose what details are shown*/}
            {/* Todo: maybe show "From {author name} {author uri}"?*/}
            {/* Todo: show 'check interval'*/}
            <p style={{
                fontSize: '0.75em',
                color: '#aaa',
                margin: 0,
              }}>
              Last checked: {playlist.lastChecked ? formatDistance(new Date(playlist.lastChecked), new Date(), { addSuffix: true }) : 'Unknown'}
            </p>
            {/* Todo: show 'next check' (a countdown like '1h 5m'). Important to note that it would be nice if some of these properties updated dynamically when the server does its polling check*/}
          </div>
        </Link>
      ))}
    </div>
  );
}

export default SubscriptionsPage;