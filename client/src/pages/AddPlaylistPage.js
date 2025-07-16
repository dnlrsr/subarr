import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

function AddPlaylistPage() {
  const navigate = useNavigate();

  const [playlistInput, setPlaylistInput] = useState('');
  const [error, setError] = useState('');

  const hasValidPlaylistId = id => /(PL|UU|LL|FL)[\w-]{10,}/.test(id);

  //Todo: we might want to see if we can download the HTML for a channel page - like https://www.youtube.com/@babishculinaryuniverse - and parse out the UU playlist id

  const handleSubmit = async e => {
    e.preventDefault();
    if (!hasValidPlaylistId(playlistInput)) {
      setError('Invalid Playlist ID');
      return;
    }

    const playlistId = playlistInput.match(/(PL|UU|LL|FL)[\w-]{10,}/)[0];

    setError('');
    const res = await fetch('/api/playlists', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ playlistId })
    });

    if (res.ok) {
      alert('Playlist added!'); //Todo: use a notification toast (or maybe something more sonarr-like) instead of alert
      setPlaylistInput('');
      navigate('/'); //Navigate back to homepage
    } else {
      alert('Error adding playlist'); //Todo: use a notification toast (or maybe something more sonarr-like) instead of alert
    }
  };

  return (
    <div style={{ padding: '20px' }}>
      <h2>Add YouTube Playlist</h2>
      <form onSubmit={handleSubmit}>
        <input
          value={playlistInput}
          onChange={e => setPlaylistInput(e.target.value)}
          placeholder="Enter Playlist ID"
          style={{ padding: '8px', width: '300px' }}
        />
        <button type="submit" style={{ fontSize: '1rem', color: 'ButtonText', background: 'ButtonFace', border: 'ButtonBorder', /* set back to default button styles (for now) */ marginLeft: '10px' }}>Add</button>
      </form>
      {error && <p style={{ color: 'red' }}>{error}</p>}
      {/(PL|LL|FL)[\w-]{10,}/.test(playlistInput) && <p style={{ color: 'yellow', wordBreak: 'break-word' }}>
        Warning: YouTube playlist feeds only return the top 15 items, so if this playlist is not ordered Newest → Oldest,
        YouTubarr may never see new videos on this playlist (see <a href='https://issuetracker.google.com/issues/429563457' target='_blank' rel='noreferrer'>
        https://issuetracker.google.com/issues/429563457</a>)
      </p>}
    </div>
  );
}

export default AddPlaylistPage;