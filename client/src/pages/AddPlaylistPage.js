import { useState } from 'react';

function AddPlaylistPage() {
  const [playlistId, setPlaylistId] = useState('');
  const [error, setError] = useState('');

  const isValidPlaylistId = id => /^(PL|UU|LL|FL)[\w-]{10,}$/.test(id);

  //Todo: we might want to see if we can download the HTML for a channel page - like https://www.youtube.com/@babishculinaryuniverse - and parse out the UU playlist id

  const handleSubmit = async e => {
    e.preventDefault();
    if (!isValidPlaylistId(playlistId)) {
      setError('Invalid Playlist ID');
      return;
    }

    setError('');
    const res = await fetch('/api/playlists', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ playlistId })
    });

    if (res.ok) {
      alert('Playlist added!'); //Todo: use a notification toast (or maybe something more sonarr-like) instead of alert
      setPlaylistId('');
    } else {
      alert('Error adding playlist'); //Todo: use a notification toast (or maybe something more sonarr-like) instead of alert
    }
  };

  return (
    <div style={{ padding: '20px' }}>
      <h2>Add YouTube Playlist</h2>
      <form onSubmit={handleSubmit}>
        <input
          value={playlistId}
          onChange={e => setPlaylistId(e.target.value)}
          placeholder="Enter Playlist ID"
          style={{ padding: '8px', width: '300px' }}
        />
        <button type="submit" style={{ marginLeft: '10px' }}>Add</button>
      </form>
      {error && <p style={{ color: 'red' }}>{error}</p>}
    </div>
  );
}

export default AddPlaylistPage;