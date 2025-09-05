import { addMinutes, formatDistance } from 'date-fns';
import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { Toolbar } from '../components';
import {
  ToolbarAction,
  ToolbarViewAction,
} from '../components/layout/toolbar/Toolbar';
import {
  Button,
  Card,
  Checkbox,
  Container,
  DialogBase,
} from '../components/ui';
import { apiService } from '../services/api';
import { Playlist } from '../types';

interface SubscriptionsPageProps {
  // Future: could add filtering by search term here
}

type FilterType = 'All' | 'Active' | 'Manually added' | 'YTSubs';

const SubscriptionsPage: React.FC<SubscriptionsPageProps> = () => {
  const { t } = useTranslation();
  const [optionsDialogOpen, setOptionsDialogOpen] = useState<boolean>(false);
  const [filterOptionsOpen, setFilterOptionsOpen] = useState<boolean>(false);
  const [playlists, setPlaylists] = useState<Playlist[]>([]);
  const [filteredPlaylists, setFilteredPlaylists] = useState<Playlist[]>([]);

  const [showCheckInterval, setShowCheckInterval] = useState<boolean>(false);
  const [showNextCheck, setShowNextCheck] = useState<boolean>(false);

  useEffect(() => {
    const fetchPlaylists = async () => {
      try {
        const data = await apiService.getPlaylists();
        const fetchedPlaylists = data.map(p => ({
          ...p,
          thumbnail: p.thumbnail,
          lastChecked: p.last_checked,
        }));

        setPlaylists(fetchedPlaylists);
        setFilteredPlaylists(fetchedPlaylists);
      } catch (err) {
        console.error('Failed to load playlists:', err);
      }
    };

    fetchPlaylists();
  }, []);

  const applyFilter = (selectedFilter: FilterType) => {
    if (selectedFilter === 'All') {
      setFilteredPlaylists(playlists);
    } else if (selectedFilter === 'Active') {
      // Show playlists that have had an upload within the last year
      const oneYearAgo = new Date();
      oneYearAgo.setFullYear(oneYearAgo.getFullYear() - 1);

      setFilteredPlaylists(
        playlists.filter(
          p => p.last_updated && new Date(p.last_updated) >= oneYearAgo
        )
      );
    } else if (selectedFilter === 'Manually added') {
      setFilteredPlaylists(playlists.filter(p => p.source === 'manual'));
    } else if (selectedFilter === 'YTSubs') {
      setFilteredPlaylists(playlists.filter(p => p.source === 'ytsubs.app'));
    }

    setFilterOptionsOpen(false);
  };

  const onActionClick = (action: ToolbarAction | ToolbarViewAction) => {
    if (action === ToolbarViewAction.OPTIONS) {
      setOptionsDialogOpen(true);
    } else if (action === ToolbarViewAction.FILTER) {
      setFilterOptionsOpen(!filterOptionsOpen);
    }
  };

  return (
    <>
      <Toolbar
        viewActions={[ToolbarViewAction.OPTIONS, ToolbarViewAction.FILTER]}
        onActionClick={onActionClick}
      />

      <Container fluid withToolbar>
        <div className="d-flex flex-wrap gap-3">
          {filteredPlaylists
            .sort((a, b) => a.title.localeCompare(b.title))
            .map(playlist => (
              <Card key={playlist.id} size="grid">
                <Link to={`/playlist/${playlist.id}`}>
                  {playlist.source === 'ytsubs.app' && (
                    <img
                      src="https://static.ytsubs.app/logo.png"
                      alt="YTSubs.app"
                    />
                  )}
                  <Card.Img
                    variant="top"
                    src={playlist.thumbnail}
                    alt={playlist.title}
                  />
                  <Card.Body>
                    <div>
                      <h3>{playlist.title}</h3>
                      {showCheckInterval && (
                        <p>
                          {t('subscriptionsPage.playlist.interval', {
                            minutes: playlist.check_interval_minutes,
                          })}
                        </p>
                      )}
                      <p>
                        {t('subscriptionsPage.playlist.lastChecked', {
                          time: playlist.last_checked
                            ? formatDistance(
                                new Date(playlist.last_checked),
                                new Date(),
                                {
                                  addSuffix: true,
                                }
                              )
                            : t('common.unknown'),
                        })}
                      </p>
                      {showNextCheck && (
                        <p>
                          {t('subscriptionsPage.playlist.nextCheck', {
                            time: playlist.last_checked
                              ? formatDistance(
                                  addMinutes(
                                    new Date(playlist.last_checked),
                                    playlist.check_interval_minutes
                                  ),
                                  new Date(),
                                  { addSuffix: true }
                                )
                              : t('common.unknown'),
                          })}
                        </p>
                      )}
                    </div>
                  </Card.Body>
                </Link>
              </Card>
            ))}
        </div>

        <DialogBase
          isOpen={optionsDialogOpen}
          onClose={() => setOptionsDialogOpen(false)}
          title="Options"
        >
          <div>
            <div>{t('subscriptionsPage.options.showCheckInterval')}</div>
            <Checkbox
              checked={showCheckInterval}
              onChange={e => setShowCheckInterval(e.target.checked)}
              label={t('subscriptionsPage.options.showCheckIntervalLabel')}
            />
          </div>
          <div>
            <div>{t('subscriptionsPage.options.showNextCheck')}</div>
            <Checkbox
              checked={showNextCheck}
              onChange={e => setShowNextCheck(e.target.checked)}
              label={t('subscriptionsPage.options.showNextCheckLabel')}
            />
          </div>
        </DialogBase>

        {filterOptionsOpen && (
          <Card>
            <Card.Body>
              <Button
                variant="outline-secondary"
                onClick={() => applyFilter('All')}
              >
                {t('subscriptionsPage.filter.all')}
              </Button>
              <Button
                variant="outline-secondary"
                onClick={() => applyFilter('Active')}
              >
                {t('subscriptionsPage.filter.active')}
              </Button>
              <Button
                variant="outline-secondary"
                onClick={() => applyFilter('Manually added')}
              >
                {t('subscriptionsPage.filter.manuallyAdded')}
              </Button>
              <Button
                variant="outline-secondary"
                onClick={() => applyFilter('YTSubs')}
              >
                {t('subscriptionsPage.filter.ytSubs')}
              </Button>
            </Card.Body>
          </Card>
        )}
      </Container>
    </>
  );
};

export default SubscriptionsPage;
