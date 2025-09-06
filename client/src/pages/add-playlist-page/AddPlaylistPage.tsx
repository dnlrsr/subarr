import { faYoutube } from '@fortawesome/free-brands-svg-icons';
import { faPlus, faXmark } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import {
  Button,
  Card,
  Container,
  Form,
  FormControl,
  InputGroup,
  LoadingIndicator,
} from '../../components/ui';
import { Playlist, PlaylistInfo } from '../../types';
import { getErrorResponse, showToast } from '../../utils/utils';
import styles from './AddPlaylistPage.module.scss';

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
      <div className={styles.container}>
        <Form>
          <InputGroup>
            <FormControl
              type="text"
              placeholder={t('addPlaylistPage.searchPlaceholder')}
              value={playlistInput}
              onChange={e => setPlaylistInput(e.target.value)}
            />
            <Button variant="outline-secondary" onClick={handleClearInput}>
              <FontAwesomeIcon icon={faXmark} />
            </Button>
          </InputGroup>
        </Form>

        {playlistInfo && (
          <Card size="grid">
            <Card.Img src={playlistInfo.thumbnail} alt={playlistInfo.title} />
            <Card.Body>
              <Card.Title>{playlistInfo.title}</Card.Title>
              <Card.Text>
                <Button onClick={handleOpenPlaylist} variant="outline-info">
                  <FontAwesomeIcon icon={faYoutube} />
                  {t('common.open')}
                </Button>
                <Button onClick={handleSubmit} variant="primary">
                  <FontAwesomeIcon icon={faPlus} />
                  {t('common.add')}
                </Button>
              </Card.Text>
            </Card.Body>
          </Card>
        )}

        {isSearching && (
          <div>
            <LoadingIndicator />
          </div>
        )}

        {error && (
          <div>
            <div>{error}</div>
            <p>{t('addPlaylistPage.validValues')}</p>
            <ol>
              <li>{t('addPlaylistPage.channelUrls')}</li>
              <li>{t('addPlaylistPage.playlistUrls')}</li>
            </ol>
          </div>
        )}

        {isPlaylistWarning && <p>{t('addPlaylistPage.playlistWarning')}</p>}
      </div>
    </Container>
  );
};

export default AddPlaylistPage;
