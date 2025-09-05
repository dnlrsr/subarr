import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { Button, Container, Form, FormControl, InputGroup, InputGroupText, LoadingIndicator, Thumbnail } from '../components/ui';
import { Playlist, PlaylistInfo } from '../types';
import { getErrorResponse, showToast } from '../utils/utils';

const AddPlaylistPage: React.FC = () => {
  const { t } = useTranslation();
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
      showToast(t('toast.playlistAdded'), 'success');
      setPlaylistInput('');

      const data: Playlist = await res.json();
      navigate(`/playlist/${data.id}`);
    } else {
      const addError = await getErrorResponse(res);
      showToast(t('toast.errorAddingPlaylist', { error: addError }), 'error');
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
    <Container>
      <h2 className="mb-4">{t('addPlaylistPage.title')}</h2>
      
      <Form>
        <InputGroup className="mb-3">
          <InputGroupText>
            <i className="bi bi-search" />
          </InputGroupText>
          <FormControl
            type="text"
            placeholder={t('addPlaylistPage.searchPlaceholder')}
            value={playlistInput}
            onChange={(e) => setPlaylistInput(e.target.value)}
          />
          <Button variant="outline-secondary" onClick={handleClearInput}>
            <i className="bi bi-x-lg" />
          </Button>
        </InputGroup>
      </Form>

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
              {t('addPlaylistPage.addButton')}
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
          <p style={{ marginBottom: 0 }}>{t('addPlaylistPage.validValues')}</p>
          <ol>
            <li style={{ overflowWrap: 'anywhere' }}>
              {t('addPlaylistPage.channelUrls')}
            </li>
            <li style={{ overflowWrap: 'anywhere' }}>
              {t('addPlaylistPage.playlistUrls')}
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
          {t('addPlaylistPage.playlistWarning')}
        </p>
      )}
    </Container>
  );
};

export default AddPlaylistPage;
