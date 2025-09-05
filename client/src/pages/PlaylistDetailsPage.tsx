import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate, useParams } from 'react-router-dom';
import { Button, Card, Container, Input, Thumbnail } from '../components/ui';
import { Playlist, VideoInfo } from '../types';
import { showToast } from '../utils/utils';
import './PlaylistDetailsPage.css';

interface PlaylistDetailsData {
  playlist: Playlist;
  videos: VideoInfo[];
}

const PlaylistDetailsPage: React.FC = () => {
  const { t } = useTranslation();
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [playlist, setPlaylist] = useState<Playlist | null>(null);
  const [interval, setInterval] = useState<number>(60);
  const [regex, setRegex] = useState<string>('');
  const [videos, setVideos] = useState<VideoInfo[]>([]);
  const [testingRegex, setTestingRegex] = useState<boolean>(false);

  useEffect(() => {
    if (!id) return;

    const fetchPlaylistDetails = async () => {
      try {
        const res = await fetch(`/api/playlists/${id}`);
        const data: PlaylistDetailsData = await res.json();
        
        setPlaylist(data.playlist);
        setInterval(data.playlist.check_interval_minutes || 60);
        setRegex(data.playlist.regex_filter || '');
        setVideos(data.videos || []);
      } catch (err) {
        console.error('Error loading playlist', err);
      }
    };

    fetchPlaylistDetails();
  }, [id]);

  const handleDownload = async (videoId: string) => {
    try {
      const res = await fetch(`/api/videos/${videoId}/download`, {
        method: 'POST',
      });

      if (!res.ok) {
        throw new Error('Failed to start download');
      }

      showToast('Download started', 'success');
    } catch (err) {
      console.error('Error starting download', err);
      showToast('Error starting download', 'error');
    }
  };

  const handleSave = async () => {
    if (!id) return;

    try {
      const res = await fetch(`/api/playlists/${id}/settings`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          check_interval_minutes: parseInt(interval.toString()),
          regex_filter: regex,
        }),
      });

      if (!res.ok) {
        throw new Error('Failed to save');
      }

      showToast('Settings saved!', 'success');
    } catch (err) {
      console.error(err);
      showToast('Error saving settings', 'error');
    }
  };

  const handleDelete = async () => {
    if (!id) return;

    const confirmDelete = window.confirm('Are you sure you want to remove this playlist?');
    if (!confirmDelete) {
      return;
    }

    try {
      const res = await fetch(`/api/playlists/${id}`, {
        method: 'DELETE',
      });

      if (!res.ok) {
        throw new Error('Failed to delete');
      }

      showToast('Playlist removed', 'success');
      navigate('/');
    } catch (err) {
      console.error(err);
      showToast('Error deleting playlist', 'error');
    }
  };

  const handleCopyUrl = async (videoId: string) => {
    const url = `https://www.youtube.com/watch?v=${videoId}`;
    try {
      await navigator.clipboard.writeText(url);
      showToast('Video URL copied to clipboard', 'success');
    } catch (err) {
      console.error('Failed to copy URL', err);
      showToast('Failed to copy URL', 'error');
    }
  };

  const isVideoMatchingRegex = (videoTitle: string): boolean => {
    if (!regex || !testingRegex) return true;
    try {
      return new RegExp(regex, 'i').test(videoTitle);
    } catch {
      return false;
    }
  };

  if (!playlist) {
    return <p>{t('common.loading')}</p>;
  }

  return (
    <Container fluid style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      <Card>
        <Card.Header semantic="toolbar">
          <Button semantic="toolbar" variant="success" onClick={handleSave} title={t('playlistDetailsPage.saveSettings')}>
            <i className="bi bi-floppy-fill"></i>
            <span style={{ fontSize: 'small', marginLeft: 5 }}>{t('common.save')}</span>
          </Button>
          <Button semantic="toolbar" variant="danger" onClick={handleDelete} title={t('playlistDetailsPage.deletePlaylist')}>
            <i className="bi bi-trash-fill"></i>
            <span style={{ fontSize: 'small', marginLeft: 5 }}>{t('common.delete')}</span>
          </Button>
        </Card.Header>
      </Card>

      <div
        style={{
          height: 425,
          width: '100%',
          backgroundImage: playlist.banner
            ? `url(https://wsrv.nl/?url=${playlist.banner})`
            : '',
          backgroundColor: 'rgb(0, 0, 0, 0.7)',
          backgroundSize: 'cover',
          backgroundBlendMode: 'darken',
        }}
      >
        <div
          style={{
            height: 'calc(100% - 60px)',
            padding: 30,
            display: 'flex',
            gap: 40,
          }}
        >
          <Thumbnail
            className="playlistDetails-poster"
            height={350}
            width={350}
            src={playlist.thumbnail}
            alt={playlist.title}
          />
          <div style={{ display: 'flex', flexDirection: 'column', width: '100%' }}>
            <div
              style={{ fontSize: 'xxx-large', overflowWrap: 'anywhere' }}
              title={playlist.playlist_id}
            >
              {playlist.title}
            </div>
            {!playlist.playlist_id.startsWith('UU') && playlist.author_name && (
              <div style={{ fontStyle: 'italic', marginBottom: 10 }}>
                {t('common.by')} {playlist.author_name}
              </div>
            )}
            <div className="setting flex-column-mobile">
              <div style={{ minWidth: 190 }}>{t('playlistDetailsPage.checkInterval')}</div>
              <Input
                semantic="small"
                type="number"
                value={interval}
                min={5}
                onChange={(e) => setInterval(Number(e.target.value))}
              />
            </div>
            <div className="setting flex-column-mobile">
              <div style={{ minWidth: 190 }}>{t('playlistDetailsPage.regexFilter')}</div>
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  width: '100%',
                  marginTop: 5,
                }}
              >
                <Input
                  semantic="filter"
                  type="text"
                  value={regex}
                  onChange={(e) => setRegex(e.target.value)}
                />
                <Button
                  semantic="action"
                  variant={testingRegex ? "danger" : "primary"}
                  onClick={() => setTestingRegex(!testingRegex)}
                >
                  {testingRegex ? t('playlistDetailsPage.stopTestButton') : t('playlistDetailsPage.testButton')}
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div
        className="small-padding-mobile"
        style={{
          display: 'flex',
          flexDirection: 'column',
          flex: 1,
          padding: 30,
          minHeight: 0,
        }}
      >
        <div className="playlistDetails-recentUploads">
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              gap: '10px',
              paddingRight: '5px',
            }}
          >
            {videos.map((video) => (
              <Card
                key={video.video_id}
                semantic="video"
              >
                <a
                  href={`https://www.youtube.com/watch?v=${video.video_id}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{ flexShrink: 0 }}
                >
                  <Thumbnail
                    src={video.thumbnail}
                    alt={video.title}
                    width={160}
                    height={90}
                  />
                </a>
                <div style={{ display: 'flex', flexDirection: 'column', padding: '10px' }}>
                  <div
                    style={{
                      fontSize: '1em',
                      fontWeight: 'bold',
                      color: testingRegex
                        ? isVideoMatchingRegex(video.title)
                          ? 'var(--success-color)'
                          : 'var(--danger-color)'
                        : 'inherit',
                      display: '-webkit-box',
                      WebkitLineClamp: 2,
                      WebkitBoxOrient: 'vertical',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                    }}
                  >
                    {video.title}
                  </div>
                  <div style={{ flex: 1 }} />
                  <div style={{ fontSize: '0.75em', color: '#aaa', marginTop: '4px' }}>
                    {video.published_at
                      ? new Date(video.published_at).toLocaleString()
                      : 'Unknown date'}
                  </div>
                  <div style={{ display: 'flex', gap: '8px' }}>
                    <Button
                      semantic="icon-small"
                      variant="outline-primary"
                      onClick={() => handleCopyUrl(video.video_id)}
                    >
                      <i className="bi bi-link-45deg"></i> Copy URL
                    </Button>
                    <Button
                      semantic="icon-small"
                      variant="outline-success"
                      disabled={false} // Note: video.state is not available in VideoInfo type
                      title={t('playlistDetailsPage.downloadVideo')}
                      onClick={() => handleDownload(video.video_id)}
                    >
                      <i className="bi bi-download"></i> Download
                    </Button>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </div>
      </div>
    </Container>
  );
};

export default PlaylistDetailsPage;
