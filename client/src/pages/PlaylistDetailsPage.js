import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';

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
      alert('Settings saved!');
    } catch (err) {
      console.error(err);
      alert('Error saving settings');
    }
  };  

  const handleDelete = async () => {
    const confirmDelete = window.confirm('Are you sure you want to remove this playlist?');
    if (!confirmDelete) return;
  
    try {
      const res = await fetch(`/api/playlists/${id}`, {
        method: 'DELETE',
      });
  
      if (!res.ok) throw new Error('Failed to delete');
      alert('Playlist removed');
      navigate('/');
    } catch (err) {
      console.error(err);
      alert('Error deleting playlist');
    }
  };  

  if (!playlist) return <p>Loading...</p>;

  return (
    <div style={{ padding: '20px' }}>
      <h2>{playlist.title}</h2>

      <div style={{ marginBottom: '20px' }}>
        <label>
          Check Interval (minutes):{' '}
          <input
            type="number"
            value={interval}
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
        </label>
        <br />
        <button onClick={handleSave} style={{ marginTop: '10px' }}>
          Save Settings
        </button>
        <button
          onClick={handleDelete}
          style={{ marginLeft: '10px', color: 'red' }}
        >
          Remove Playlist
        </button>
      </div>

      <h3>Recent Uploads</h3>
      <div
        style={{
          maxHeight: '400px',        // This sets the visible window
          overflowY: 'auto',         // Enables vertical scrolling
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
              height: '92.5px',       // <-- consistent height
              minHeight: '92.5px',
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
  );
}

export default PlaylistDetailsPage;