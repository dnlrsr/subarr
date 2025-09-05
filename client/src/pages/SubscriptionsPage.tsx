import { addMinutes, formatDistance } from 'date-fns';
import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Button, Card, Checkbox, Container, DialogBase, Thumbnail } from '../components/ui';
import { apiService } from '../services/api';
import { Playlist } from '../types';

interface SubscriptionsPageProps {
  // Future: could add filtering by search term here
}

type FilterType = 'All' | 'Active' | 'Manually added' | 'YTSubs';

const SubscriptionsPage: React.FC<SubscriptionsPageProps> = () => {
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
        const fetchedPlaylists = data.map((p) => ({
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
        playlists.filter((p) => p.last_updated && new Date(p.last_updated) >= oneYearAgo)
      );
    } else if (selectedFilter === 'Manually added') {
      setFilteredPlaylists(playlists.filter((p) => p.source === 'manual'));
    } else if (selectedFilter === 'YTSubs') {
      setFilteredPlaylists(playlists.filter((p) => p.source === 'ytsubs.app'));
    }

    setFilterOptionsOpen(false);
  };

  return (
    <Container fluid style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      <Card>
        <Card.Header semantic="toolbar">
          <Button
            semantic="toolbar"
            variant="outline-primary"
            onClick={() => setOptionsDialogOpen(true)}
            title="Options"
          >
            <i className="bi bi-grid-3x3"></i>
            <span style={{ fontSize: 'small', marginLeft: 5 }}>Options</span>
          </Button>
          <Button
            semantic="toolbar"
            variant="outline-primary"
            onClick={() => setFilterOptionsOpen(true)}
            title="Filter"
          >
            <i className="bi bi-funnel-fill"></i>
            <span style={{ fontSize: 'small', marginLeft: 5 }}>Filter</span>
          </Button>
        </Card.Header>
      </Card>
      
      <div
        style={{
          display: 'flex',
          flexWrap: 'wrap',
          gap: '20px',
          padding: '10px',
          overflowY: 'auto',
        }}
      >
        {filteredPlaylists
          .sort((a, b) => a.title.localeCompare(b.title))
          .map((playlist) => (
            <Card
              key={playlist.id}
              semantic="playlist"
            >
              <Link
                to={`/playlist/${playlist.id}`}
                style={{ textDecoration: 'none', color: 'inherit' }}
              >
                {playlist.source === 'ytsubs.app' && (
                  <img
                    style={{ position: 'absolute', left: 3, width: 24, height: 24 }}
                    src="https://static.ytsubs.app/logo.png"
                    alt="YTSubs.app"
                  />
                )}
                <Thumbnail src={playlist.thumbnail} alt={playlist.title} />
                <Card.Body>
                  <div style={{ padding: '10px' }}>
                  <h3
                    style={{
                      fontSize: '1em',
                      margin: '0 0 5px 0',
                      whiteSpace: 'nowrap',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                    }}
                  >
                    {playlist.title}
                  </h3>
                  {showCheckInterval && (
                    <p
                      style={{
                        fontSize: '0.75em',
                        color: '#aaa',
                        margin: 0,
                      }}
                    >
                      Interval: every {playlist.check_interval_minutes} minutes
                    </p>
                  )}
                  <p
                    style={{
                      fontSize: '0.75em',
                      color: '#aaa',
                      margin: 0,
                    }}
                  >
                    Last checked:{' '}
                    {playlist.last_checked
                      ? formatDistance(new Date(playlist.last_checked), new Date(), {
                          addSuffix: true,
                        })
                      : 'Unknown'}
                  </p>
                  {showNextCheck && (
                    <p
                      style={{
                        fontSize: '0.75em',
                        color: '#aaa',
                        margin: 0,
                      }}
                    >
                      Next check:{' '}
                      {playlist.last_checked
                        ? formatDistance(
                            addMinutes(
                              new Date(playlist.last_checked),
                              playlist.check_interval_minutes
                            ),
                            new Date(),
                            { addSuffix: true }
                          )
                        : 'Unknown'}
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
        <div className="setting flex-column-mobile">
          <div style={{ minWidth: 175 }}>Show check interval</div>
          <Checkbox
            checked={showCheckInterval}
            onChange={(e) => setShowCheckInterval(e.target.checked)}
            label="Show check interval under playlist thumbnail"
          />
        </div>
        <div className="setting flex-column-mobile">
          <div style={{ minWidth: 175 }}>Show next check</div>
          <Checkbox
            checked={showNextCheck}
            onChange={(e) => setShowNextCheck(e.target.checked)}
            label="Show countdown to next check"
          />
        </div>
      </DialogBase>
      
      {filterOptionsOpen && (
        <Card semantic="search-results">
          <Card.Body semantic="filter">
            <Button
              semantic="filter"
              variant="outline-secondary"
              onClick={() => applyFilter('All')}
            >
              All
            </Button>
            <Button
              semantic="filter"
              variant="outline-secondary"
              onClick={() => applyFilter('Active')}
            >
              Active
            </Button>
            <Button
              semantic="filter"
              variant="outline-secondary"
              onClick={() => applyFilter('Manually added')}
            >
              Manually added
            </Button>
            <Button
              semantic="filter"
              variant="outline-secondary"
              onClick={() => applyFilter('YTSubs')}
            >
              YTSubs
            </Button>
          </Card.Body>
        </Card>
      )}
    </Container>
  );
};

export default SubscriptionsPage;
