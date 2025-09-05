import { formatDistance } from 'date-fns';
import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { LoadingIndicator } from '../components/ui';
import { Activity, PaginatedResponse } from '../types';

const ActivityPage: React.FC = () => {
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [activities, setActivities] = useState<Activity[]>([]);
  const [page, setPage] = useState<number>(1);
  const [totalPages, setTotalPages] = useState<number>(1);

  useEffect(() => {
    refreshActivity(page);
  }, [page]);

  const refreshActivity = async (pageNum: number) => {
    setIsLoading(true);
    setActivities([]);

    try {
      const response = await fetch(`/api/activity/${pageNum}`);
      const data: PaginatedResponse<Activity> = await response.json();
      
      setActivities(data.data || []);
      setPage(data.page);
      setTotalPages(data.totalPages);
    } catch (err) {
      console.error('Error loading activity log', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handlePageChange = (newPage: number) => {
    if (newPage >= 1 && newPage <= totalPages) {
      setPage(newPage);
    }
  };

  return (
    <div>
      <div style={{ 
        display: 'flex', 
        alignItems: 'center', 
        padding: '0px 20px', 
        gap: 10, 
        backgroundColor: '#262626', 
        height: 60 
      }}>
        <button
          className="hover-blue"
          onClick={() => refreshActivity(page)}
          title="Refresh Activity"
        >
          <i className="bi bi-arrow-clockwise" />
          <div style={{ fontSize: 'small' }}>Refresh</div>
        </button>
      </div>
      <div style={{ padding: 20, overflowX: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr>
              <th></th>
              <th>Playlist</th>
              <th>Title</th>
              <th>Message</th>
              <th>Date</th>
            </tr>
          </thead>
          <tbody>
            {activities.map((activity) => (
              <tr key={activity.id}>
                <td>
                  <i 
                    className={`bi bi-${activity.icon}`} 
                    style={{ 
                      color: activity.icon === 'camera-video-fill' ? 'var(--accent-color)' : 'inherit' 
                    }} 
                  />
                </td>
                <td className="fixed">
                  {activity.playlist_db_id ? (
                    <Link to={`/playlist/${activity.playlist_db_id}`}>
                      {activity.playlist_title}
                    </Link>
                  ) : (
                    <div style={{ fontStyle: 'italic' }}>Playlist deleted</div>
                  )}
                </td>
                <td className="fixed">
                  {activity.url ? (
                    <a href={activity.url} target="_blank" rel="noreferrer">
                      {activity.title}
                    </a>
                  ) : (
                    activity.title
                  )}
                </td>
                <td className="expand fixed">{activity.message}</td>
                <td className="fixed">
                  {formatDistance(new Date(activity.datetime), new Date(), { addSuffix: true })}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {isLoading && (
          <div style={{ display: 'flex', justifyContent: 'center' }}>
            <LoadingIndicator />
          </div>
        )}
      </div>
      <div style={{ display: 'flex', justifyContent: 'center' }}>
        <button
          style={{ fontSize: '1rem' }}
          disabled={page === 1}
          onClick={() => handlePageChange(1)}
        >
          <i className="bi bi-skip-start-fill"></i>
        </button>
        <button
          style={{ fontSize: '1rem' }}
          disabled={page === 1}
          onClick={() => handlePageChange(page - 1)}
        >
          <i className="bi bi-rewind-fill"></i>
        </button>
        <div style={{ margin: '0px 10px' }}>
          {page} / {totalPages}
        </div>
        <button
          style={{ fontSize: '1rem' }}
          disabled={page === totalPages}
          onClick={() => handlePageChange(page + 1)}
        >
          <i className="bi bi-fast-forward-fill"></i>
        </button>
        <button
          style={{ fontSize: '1rem' }}
          disabled={page === totalPages}
          onClick={() => handlePageChange(totalPages)}
        >
          <i className="bi bi-skip-end-fill"></i>
        </button>
      </div>
    </div>
  );
};

export default ActivityPage;
