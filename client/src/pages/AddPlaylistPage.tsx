import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { LoadingIndicator, Thumbnail } from '../components/ui';
import { Playlist, PlaylistInfo } from '../types';
import { getErrorResponse, showToast } from '../utils/utils';

const AddPlaylistPage: React.FC = () => {
  const navigate = useNavigate();

  const [playlistInput, setPlaylistInput] = useState<string>('');
  const [isSearching, setIsSearching] = useState<boolean>(false);
  const [playlistInfo, setPlaylistInfo] = useState<PlaylistInfo | null>(null);
  const [error, setError] = useState<string>('');

  useEffect(() => {
    setPlaylistInfo(null);

    if (!playlistInput) {
      return;
    }

    setError('');

    const controller = new AbortController();
    const timeoutId = setTimeout(() => {
      (async () => {
        try {
          setIsSearching(true);

          const res = await fetch(`/api/search?q=${playlistInput}`, {
            signal: controller.signal,
          });

          if (!res.ok) {
            throw new Error(await getErrorResponse(res, true));
          }

          const data: PlaylistInfo = await res.json();
          setPlaylistInfo(data);
        } catch (err) {
          if (err instanceof Error && err.name !== 'AbortError') {
            console.error(err);
            setError(err.message);
          }
        } finally {
          setIsSearching(false);
        }
      })();
    }, 300);

    return () => {
      clearTimeout(timeoutId); // Cancel debounce
      controller.abort(); // Cancel previous fetch
    };
  }, [playlistInput]);

  const handleSubmit = async () => {
    if (!playlistInfo) return;

    setError('');
    const res = await fetch('/api/playlists', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ playlistId: playlistInfo.playlist_id }),
    });

    if (res.ok) {
      showToast('Playlist added!', 'success');
      setPlaylistInput('');

      const data: Playlist = await res.json();
      navigate(`/playlist/${data.id}`);
    } else {
      const addError = await getErrorResponse(res);
      showToast(`Error adding playlist: ${addError}`, 'error');
    }
  };

  const handleClearInput = () => {
    setPlaylistInput('');
  };

  const handleOpenPlaylist = () => {
    if (playlistInfo) {
      window.open(
        `https://www.youtube.com/playlist?list=${playlistInfo.playlist_id}`,
        '_blank'
      );
    }
  };

  const isPlaylistWarning = /(PL|LL|FL)[\w-]{10,}/.test(playlistInput);

  return (
    <div style={{ padding: '20px' }}>
      <div style={{ display: 'flex', width: '100%', alignItems: 'center', height: 46 }}>
        <i
          className="bi bi-search"
          style={{
            fontSize: 'large',
            padding: '10px 15px',
            height: 'calc(100% - 22px)',
            border: 'solid 1px white',
            borderRight: 'none',
            borderRadius: '4px 0px 0px 4px',
          }}
        />
        <input
          style={{
            flexGrow: 1,
            backgroundColor: '#333',
            border: 'solid 1px white',
            padding: '6px 16px',
            height: 'calc(100% - 14px)',
            color: 'inherit',
            fontSize: 'medium',
            outline: 'none',
          }}
          placeholder="Enter a youtube channel url (eg youtube.com/@MrBeast) or playlist id/url (eg UU..., PL..., etc)"
          type="text"
          value={playlistInput}
          onChange={(e) => setPlaylistInput(e.target.value)}
        />
        <button
          style={{
            display: 'flex',
            alignItems: 'center',
            height: '100%',
            padding: '10px 15px',
            border: 'solid 1px white',
            borderLeft: 'none',
            borderRadius: '0px 4px 4px 0px',
            backgroundColor: 'transparent',
            color: 'inherit',
            cursor: 'pointer',
          }}
          onClick={handleClearInput}
        >
          <i className="bi bi-x-lg" style={{ fontSize: 'large' }} />
        </button>
      </div>

      {playlistInfo && (
        <div
          className="flex-column-mobile"
          style={{
            display: 'flex',
            marginTop: 20,
            padding: 20,
            gap: 20,
            backgroundImage: playlistInfo.banner ? `url(${playlistInfo.banner})` : '',
            backgroundColor: playlistInfo.banner ? 'rgb(0, 0, 0, 0.7)' : '#2a2a2a',
            backgroundSize: 'cover',
            backgroundBlendMode: 'darken',
          }}
        >
          <Thumbnail height={180} width={320} src={playlistInfo.thumbnail} alt={playlistInfo.title} />
          <div style={{ display: 'flex', flexDirection: 'column', flexGrow: 1 }}>
            <div style={{ display: 'flex', marginBottom: 20 }}>
              <div style={{ fontSize: 'xx-large' }}>{playlistInfo.title}</div>
              <button
                style={{
                  marginLeft: 'auto',
                  backgroundColor: 'transparent',
                  border: 'none',
                  color: 'inherit',
                  cursor: 'pointer',
                }}
                onClick={handleOpenPlaylist}
              >
                <i className="bi bi-box-arrow-up-right" style={{ fontSize: 'x-large' }} />
              </button>
            </div>
            <button
              style={{
                marginTop: 'auto',
                marginLeft: 'auto',
                backgroundColor: 'var(--success-color)',
                padding: '6px 16px',
                borderRadius: 4,
                fontSize: 'medium',
                border: 'none',
                color: 'white',
                cursor: 'pointer',
              }}
              onClick={handleSubmit}
            >
              Add
            </button>
          </div>
        </div>
      )}

      {isSearching && (
        <div style={{ display: 'flex', justifyContent: 'center' }}>
          <LoadingIndicator />
        </div>
      )}

      {error && (
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            marginTop: 20,
          }}
        >
          <div style={{ fontSize: 'x-large', textAlign: 'center' }}>{error}</div>
          <p style={{ marginBottom: 0 }}>Valid values are:</p>
          <ol>
            <li style={{ overflowWrap: 'anywhere' }}>
              YouTube channel urls (eg youtube.com/@MrBeast or
              <br />
              https://www.youtube.com/channel/UCY1kMZp36IQSyNx_9h4mpCg)
            </li>
            <li style={{ overflowWrap: 'anywhere' }}>
              YouTube playlist urls or ids (eg UUuAXFkgsw1L7xaCfnd5JJOw or
              <br />
              https://www.youtube.com/playlist?list=PLopY4n17t8RCqmupsW66yOsR5eDPRUN_y)
            </li>
          </ol>
        </div>
      )}

      {isPlaylistWarning && (
        <p
          style={{
            color: 'var(--warning-color)',
            overflowWrap: 'anywhere',
            textAlign: 'center',
          }}
        >
          Warning: YouTube playlist RSS feeds only return the top 15 items, so if this playlist is
          not ordered Newest → Oldest, Subarr may never see new videos on this playlist (see{' '}
          <a
            href="https://issuetracker.google.com/issues/429563457"
            target="_blank"
            rel="noreferrer"
          >
            https://issuetracker.google.com/issues/429563457
          </a>
          ). If this is the case, you may want to use the channel's uploads playlist and a regex
          filter.
        </p>
      )}
    </div>
  );
};

export default AddPlaylistPage;
