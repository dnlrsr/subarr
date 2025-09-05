import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate, useParams } from 'react-router-dom';
import { Toolbar } from '../components';
import {
  ToolbarAction,
  ToolbarViewAction,
} from '../components/layout/toolbar/Toolbar';
import { Button, Card, Container, Input, Thumbnail } from '../components/ui';
import { Playlist, VideoInfo } from '../types';
import { showToast } from '../utils/utils';

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

    const confirmDelete = window.confirm(
      'Are you sure you want to remove this playlist?'
    );
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

  if (!playlist) {
    return <p>{t('common.loading')}</p>;
  }

  const onActionClick = (action: ToolbarAction | ToolbarViewAction) => {
    if (action === ToolbarAction.SAVE) {
      handleSave();
    } else if (action === ToolbarAction.DELETE) {
      handleDelete();
    }
  };

  return (
    <Container fluid>
      <Toolbar
        actions={[ToolbarAction.SAVE, ToolbarAction.DELETE]}
        onActionClick={onActionClick}
      />

      <div>
        <div>
          <Thumbnail
            height={350}
            width={350}
            src={playlist.thumbnail}
            alt={playlist.title}
          />
          <div>
            <div title={playlist.playlist_id}>{playlist.title}</div>
            {!playlist.playlist_id.startsWith('UU') && playlist.author_name && (
              <div>
                {t('common.by')} {playlist.author_name}
              </div>
            )}
            <div>
              <div>{t('playlistDetailsPage.checkInterval')}</div>
              <Input
                type="number"
                value={interval}
                min={5}
                onChange={e => setInterval(Number(e.target.value))}
              />
            </div>
            <div>
              <div>{t('playlistDetailsPage.regexFilter')}</div>
              <div>
                <Input
                  type="text"
                  value={regex}
                  onChange={e => setRegex(e.target.value)}
                />
                <Button
                  variant={testingRegex ? 'danger' : 'primary'}
                  onClick={() => setTestingRegex(!testingRegex)}
                >
                  {testingRegex
                    ? t('playlistDetailsPage.stopTestButton')
                    : t('playlistDetailsPage.testButton')}
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div>
        <div>
          <div>
            {videos.map(video => (
              <Card key={video.video_id}>
                <a
                  href={`https://www.youtube.com/watch?v=${video.video_id}`}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <Thumbnail
                    src={video.thumbnail}
                    alt={video.title}
                    width={160}
                    height={90}
                  />
                </a>
                <div>
                  <div>{video.title}</div>
                  <div />
                  <div>
                    {video.published_at
                      ? new Date(video.published_at).toLocaleString()
                      : 'Unknown date'}
                  </div>
                  <div>
                    <Button
                      variant="outline-primary"
                      onClick={() => handleCopyUrl(video.video_id)}
                    >
                      <i></i> Copy URL
                    </Button>
                    <Button
                      variant="outline-success"
                      disabled={false} // Note: video.state is not available in VideoInfo type
                      title={t('playlistDetailsPage.downloadVideo')}
                      onClick={() => handleDownload(video.video_id)}
                    >
                      <i></i> Download
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
