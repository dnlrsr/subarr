import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';

function SubscriptionsPage() {
  const [playlists, setPlaylists] = useState([]);

  useEffect(() => {
    fetch('/api/playlists')
      .then(res => res.json())
      .then(data => {
        const fallbackThumbnail = 'https://i.ytimg.com/vi/5qap5aO4i9A/hqdefault.jpg';
  
        setPlaylists(data.map(p => ({
          ...p,
          thumbnail: p.thumbnail || fallbackThumbnail,
          lastChecked: p.last_checked || 'Unknown',
        })));
      })
      .catch(err => {
        console.error('Failed to load playlists:', err);
      });
  }, []);  

  return (
    <div
      style={{
        display: 'flex',
        flexWrap: 'wrap',
        gap: '20px',
        padding: '10px'
      }}
    >
      {playlists.map(playlist => (
        <Link className='playlist-card'
          key={playlist.id}
          to={`/playlist/${playlist.id}`}
        >
          <img
            src={playlist.thumbnail}
            alt={playlist.title}
          />
          <div style={{ padding: '10px' }}>
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
            {/* Todo: show 'source' (eg Manually added or YouTube Subscription) */}
            {/* Todo: show 'check interval'*/}
            <p
              style={{
                fontSize: '0.75em',
                color: '#aaa',
                margin: 0,
              }}
              >
              Last checked: <br />
              {new Date(playlist.lastChecked).toLocaleDateString()}
            </p>
            {/* Todo: show 'next check' (a countdown like '1h 5m'). Important to note that it would be nice if some of these properties updated dynamically when the server does its dynamic check*/}
          </div>
        </Link>
      ))}
    </div>
  );
}

export default SubscriptionsPage;