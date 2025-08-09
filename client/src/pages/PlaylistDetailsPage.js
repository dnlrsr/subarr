import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Thumbnail from '../components/Thumbnail';

function PlaylistDetailsPage() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [playlist, setPlaylist] = useState(null);
  const [interval, setInterval] = useState(60);
  const [regex, setRegex] = useState('');
  const [videos, setVideos] = useState([]);

  useEffect(() => {
    fetch(`/api/playlists/${id}`)
      .then(res => res.json())
      .then(data => {
        setPlaylist(data.playlist);
        setInterval(data.playlist.check_interval_minutes || 60);
        setRegex(data.playlist.regex_filter || '');
        setVideos(data.videos || []);
      })
      .catch(err => {
        console.error('Error loading playlist', err);
      });
  }, [id]);  

  const handleSave = async () => {
    try {
      const res = await fetch(`/api/playlists/${id}/settings`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          check_interval_minutes: parseInt(interval),
          regex_filter: regex,
        }),
      });
  
      if (!res.ok) throw new Error('Failed to save');
      alert('Settings saved!'); //Todo: use a notification toast (or maybe something more sonarr-like) instead of alert
    } catch (err) {
      console.error(err);
      alert('Error saving settings'); //Todo: use a notification toast (or maybe something more sonarr-like) instead of alert
    }
  };  

  const handleDelete = async () => {
    const confirmDelete = window.confirm('Are you sure you want to remove this playlist?');
    if (!confirmDelete) return;
  
    try {
      const res = await fetch(`/api/playlists/${id}`, {
        method: 'DELETE',
      });
  
      if (!res.ok) throw new Error('Failed to delete'); //Todo: use a notification toast (or maybe something more sonarr-like) instead of alert
      alert('Playlist removed');
      navigate('/'); //Navigate back to homepage
    } catch (err) {
      console.error(err);
      alert('Error deleting playlist'); //Todo: use a notification toast (or maybe something more sonarr-like) instead of alert
    }
  };  

  if (!playlist) return <p>Loading...</p>;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      <div style={{ display: 'flex', alignItems: 'center', padding: '0px 20px', gap: 10, backgroundColor: '#262626', height: 60 }}>
        <button className='hover-blue' onClick={handleSave} title="Save Settings">
          <i className="bi bi-floppy-fill"></i>
          <div style={{ fontSize: 'small' }}>Save</div>
        </button>
        <button className='hover-danger' onClick={handleDelete} title="Delete Playlist">
          <i className="bi bi-trash-fill"></i>
          <div style={{ fontSize: 'small' }}>Delete</div>
        </button>
      </div>
      <div style={{height: 425, width: '100%', backgroundImage: playlist.banner ? `url(${playlist.banner})` : '', backgroundColor: 'rgb(0, 0, 0, 0.7)',
                   backgroundSize: 'cover', backgroundBlendMode: 'darken'}}>
        <div style={{height: 'calc(100% - 60px)', padding: 30, display: 'flex', gap: 40}}>
          <Thumbnail className='playlistDetails-poster' height='350' width='350' src={playlist.thumbnail}/>
          <div style={{display: 'flex', flexDirection: 'column'}}>
            <div style={{fontSize: 'xxx-large', overflowWrap: 'anywhere'}}>{playlist.title}</div>
            <label>{/* Todo: change label-input selections to be styled & controlled like settings page */}
            Check Interval (minutes):{' '}
            <input
              type="number"
              value={interval}
              min={5} // A minimum of 5 minutes will help avoid too many iterations on the server (which might hit YouTube API limits?)
              onChange={e => setInterval(e.target.value)}
              style={{ width: '60px' }}
            />
          </label>
          <br />
          <label>
            Regex Filter (optional):{' '}
            <input
              type="text"
              value={regex}
              onChange={e => setRegex(e.target.value)}
              style={{ width: '300px', marginTop: '5px' }}
            />
            {/* Todo: give a button to test the regex */}
          </label>
          {/* Todo: maybe show playlist id */}
          {/* Todo: maybe show "From {author name} {author uri}"?*/}
          {/* Todo: allow overriding the feed url with a different url (eg rss-bridge) which can allow getting more than 15 items.
          HOWEVER, this might require custom parsing to get details like thumbnail (and I tested a rss-bridge URL for a playlist
          of 114 items - some rss-bridge instances timed out and some capped the return at 99 items).
          Looks like more can be provided via https://www.scriptbarrel.com/xml.cgi?channel_id=UCshoKvlZGZ20rVgazZp5vnQ&name=%40captainsparklez
          (both channel_id & name are required, I think)*/}
          </div>
        </div>
      </div>
      <div className='small-padding-mobile' style={{ display: 'flex', flexDirection: 'column', flex: 1, padding: 30, minHeight: 0 }}>
        {/* Todo: it would be nice if the list of recent uploads was updated dynamically when the server does its polling check */}
        {/* Todo: maybe we should show which videos won't match the regex (if a regex is specified?) */}
        {/* Todo: show a "sort by" selector (because "PL" playlists might not be in any specific order) */}
        <div className='playlistDetails-recentUploads'>
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              gap: '10px',
              paddingRight: '5px',
            }}
          >
            {videos.map(video => (
              <div
                key={video.id}
                style={{
                  display: 'flex',
                  height: '92.5px',
                  backgroundColor: 'var(--card-bg)',
                  borderRadius: '6px',
                  overflow: 'hidden',
                  boxShadow: '0 2px 6px rgba(0,0,0,0.3)',
                }}
              >
                <a
                  href={`https://www.youtube.com/watch?v=${video.video_id}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{ flexShrink: 0 }}
                >
                  <img
                    src={video.thumbnail || 'https://via.placeholder.com/160x90?text=No+Thumbnail'}
                    alt={video.title}
                    style={{ width: '160px', height: '90px', objectFit: 'cover' }}
                  />
                </a>
                <div style={{ padding: '10px', flexGrow: 1 }}>
                  <div style={{ fontSize: '1em', fontWeight: 'bold' }}>{video.title}</div>
                  <div style={{ fontSize: '0.75em', color: '#aaa', marginTop: '4px' }}>
                    {new Date(video.published_at).toLocaleString()}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export default PlaylistDetailsPage;