import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Thumbnail from '../components/Thumbnail';

function AddPlaylistPage() {
  const navigate = useNavigate();

  const [playlistInput, setPlaylistInput] = useState('');
  const [isSearching, setIsSearching] = useState(false); // Todo: use isSearching to show a loading "spinner"
  const [playlistInfo, setPlaylistInfo] = useState(null);
  const [error, setError] = useState('');

  const hasValidPlaylistId = id => /(UC|UU|PL|LL|FL)[\w-]{10,}/.test(id);

  //Todo: we might want to see if we can download the HTML for a channel page - like https://www.youtube.com/@babishculinaryuniverse - and parse out the UU playlist id
  //Todo: it would be really nice if there was an easy API we could call and get the channel info (eg thumbnail & description) from the UC or UU playlist

  useEffect(() => {
    setPlaylistInfo(null);

    if (!playlistInput) {
      return;
    }
    else if (!hasValidPlaylistId(playlistInput)) {
      setError('Invalid Playlist ID');
      return;
    }

    const adjustedPlaylistId = playlistInput.match(/(UC|UU|PL|LL|FL)[\w-]{10,}/)[0].replace(/^UC/, 'UU');
    setError('');
  
    const controller = new AbortController(); // Create a new controller
    const timeoutId = setTimeout(() => {
      setIsSearching(true);
      fetch(`/api/search?id=${encodeURIComponent(adjustedPlaylistId)}`, {
        signal: controller.signal,
      })
        .then(res => {
          if (!res.ok)
            throw new Error('Failed to fetch');
          
          return res.json();
        })
        .then(data => setPlaylistInfo(data))
        .catch(err => {
          if (err.name !== 'AbortError') {
            console.error(err);
          }
        })
        .finally(() => setIsSearching(false));
    }, 300);
  
    return () => {
      clearTimeout(timeoutId);     // Cancel debounce
      controller.abort();          // Cancel previous fetch
    };
  }, [playlistInput]);

  const handleSubmit = async () => {
    if (!hasValidPlaylistId(playlistInput)) {
      setError('Invalid Playlist ID');
      return;
    }

    const playlistId = playlistInput.match(/(UC|UU|PL|LL|FL)[\w-]{10,}/)[0].replace(/^UC/, 'UU');

    setError('');
    const res = await fetch('/api/playlists', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ playlistId })
    });

    if (res.ok) {
      alert('Playlist added!'); //Todo: use a notification toast (or maybe something more sonarr-like) instead of alert
      setPlaylistInput('');

      const data = await res.json();
      navigate(`/playlist/${data.id}`); //Navigate to new playlist page (NOTE: this is a little different than Sonarr - Sonarr doesn't go anywhere after adding a show)
    } else {
      alert('Error adding playlist'); //Todo: use a notification toast (or maybe something more sonarr-like) instead of alert
    }
  };

  return (
    <div style={{ padding: '20px' }}>
      <div style={{ display: 'flex', width: '100%', alignItems: 'center', height: 46}}>
        <i className="bi bi-search" style={{fontSize: 'large', padding: '10px 15px', height: 'calc(100% - 22px)', border: 'solid 1px white', borderRight: 'none', borderRadius: '4px 0px 0px 4px'}}/>
        <input
          style={{flexGrow: 1, backgroundColor: '#333', border: 'solid 1px white', padding: '6px 16px', height: 'calc(100% - 14px)', color: 'inherit', fontSize: 'medium', outline: 'none'}}
          placeholder='Enter a playlist id (eg UU..., PL..., etc)'
          type='text'
          value={playlistInput}
          onChange={e => setPlaylistInput(e.target.value)}/>
        <button
          style={{ display: 'flex', alignItems: 'center', height: '100%', padding: '10px 15px', border: 'solid 1px white', borderLeft: 'none', borderRadius: '0px 4px 4px 0px' }}
          onClick={() => setPlaylistInput('')}>
          <i className="bi bi-x-lg" style={{fontSize: 'large'}}/>
        </button>
      </div>
      {playlistInfo ?
      <div className='flex-column-mobile' style={{display: 'flex', backgroundColor: '#2a2a2a', marginTop: 20, padding: 20, gap: 20}}>
        <Thumbnail height='180' width='320' src={playlistInfo.thumbnail}/>{/* Todo: we should have a note for UC & UU playlists that RSS feeds don't provide the channel thumbnail, but the user can customize the thumbnail later */}
        <div style={{display: 'flex', flexDirection: 'column', flexGrow: 1}}>
          <div style={{display: 'flex', marginBottom: 20}}>
            <div style={{fontSize: 'xx-large'}}>{playlistInfo.title}</div>
            <button
              style={{marginLeft: 'auto'}}
              onClick={() => window.open(`https://www.youtube.com/playlist?list=${playlistInfo.playlist_id}` /* NOTE: because we're only doing "exclude shorts" on "add", this link will still show shorts */, '_blank')}>
              <i className="bi bi-box-arrow-up-right" style={{fontSize: 'x-large'}}/>
            </button>
          </div>
          <button 
            style={{marginTop: 'auto', marginLeft: 'auto', backgroundColor: '#26be4a'/* Todo: check to see if we're already using a green elsewhere */, padding: '6px 16px', borderRadius: 4, fontSize: 'medium'}}
            onClick={() => handleSubmit()}>
            Add
          </button>
          {/* Todo: maybe in the future clicking on this 'card' pops up a dialog where you can customize check_interval_minutes and stuff when adding */}
        </div>
      </div>
      : null}
      {error && <p style={{ color: 'red' }}>{error}</p>}{/* Todo: show a nicer message */}
      {/(PL|LL|FL)[\w-]{10,}/.test(playlistInput) && <p style={{ color: 'yellow', wordBreak: 'break-word' }}>
        Warning: YouTube playlist feeds only return the top 15 items, so if this playlist is not ordered Newest → Oldest,
        YouTubarr may never see new videos on this playlist (see <a href='https://issuetracker.google.com/issues/429563457' target='_blank' rel='noreferrer'>
        https://issuetracker.google.com/issues/429563457</a>)
      </p>}
    </div>
  );
}

export default AddPlaylistPage;