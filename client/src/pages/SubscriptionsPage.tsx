import { addMinutes, formatDistance } from 'date-fns';
import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { DialogBase, Thumbnail } from '../components/ui';
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
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'end',
          padding: '0px 20px',
          gap: 10,
          backgroundColor: '#262626',
          minHeight: 60,
        }}
      >
        <button
          className="hover-blue"
          onClick={() => setOptionsDialogOpen(true)}
          title="Options"
        >
          <i className="bi bi-grid-3x3"></i>
          <div style={{ fontSize: 'small' }}>Options</div>
        </button>
        <button
          className="hover-blue"
          onClick={() => setFilterOptionsOpen(true)}
          title="Filter"
        >
          <i className="bi bi-funnel-fill"></i>
          <div style={{ fontSize: 'small' }}>Filter</div>
        </button>
      </div>
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
            <Link
              style={{ position: 'relative' }}
              className="card"
              key={playlist.id}
              to={`/playlist/${playlist.id}`}
            >
              {playlist.source === 'ytsubs.app' && (
                <img
                  style={{ position: 'absolute', left: 3, width: 24, height: 24 }}
                  src="https://static.ytsubs.app/logo.png"
                  alt="YTSubs.app"
                />
              )}
              <Thumbnail src={playlist.thumbnail} alt={playlist.title} />
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
            </Link>
          ))}
      </div>
      <DialogBase
        isOpen={optionsDialogOpen}
        onClose={() => setOptionsDialogOpen(false)}
        title="Options"
      >
        <div className="setting flex-column-mobile">
          <div style={{ minWidth: 175 }}>Show check interval</div>
          <label className="container">
            <div style={{ fontSize: 'small', textAlign: 'center' }}>
              Show check interval under playlist thumbnail
            </div>
            <input
              type="checkbox"
              checked={showCheckInterval}
              onChange={(e) => setShowCheckInterval(e.target.checked)}
            />
            <span className="checkmark"></span>
          </label>
        </div>
        <div className="setting flex-column-mobile">
          <div style={{ minWidth: 175 }}>Show next check</div>
          <label className="container">
            <div style={{ fontSize: 'small', textAlign: 'center' }}>
              Show countdown to next check
            </div>
            <input
              type="checkbox"
              checked={showNextCheck}
              onChange={(e) => setShowNextCheck(e.target.checked)}
            />
            <span className="checkmark"></span>
          </label>
        </div>
      </DialogBase>
      {filterOptionsOpen && (
        <div
          style={{
            position: 'fixed',
            top: 120,
            right: 20,
            backgroundColor: '#333',
            display: 'flex',
            flexDirection: 'column',
          }}
        >
          <button
            style={{
              fontSize: 'medium',
              width: '100%',
              padding: '10px 20px',
              textAlign: 'start',
            }}
            onClick={() => applyFilter('All')}
          >
            All
          </button>
          <button
            style={{
              fontSize: 'medium',
              width: '100%',
              padding: '10px 20px',
              textAlign: 'start',
            }}
            onClick={() => applyFilter('Active')}
          >
            Active
          </button>
          <button
            style={{
              fontSize: 'medium',
              width: '100%',
              padding: '10px 20px',
              textAlign: 'start',
            }}
            onClick={() => applyFilter('Manually added')}
          >
            Manually added
          </button>
          <button
            style={{
              fontSize: 'medium',
              width: '100%',
              padding: '10px 20px',
              textAlign: 'start',
            }}
            onClick={() => applyFilter('YTSubs')}
          >
            YTSubs
          </button>
        </div>
      )}
    </div>
  );
};

export default SubscriptionsPage;
