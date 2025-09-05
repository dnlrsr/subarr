import { formatDistance } from 'date-fns';
import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Button, Card, Container, LoadingIndicator } from '../components/ui';
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
    <Container fluid>
      <Card>
        <Card.Header style={{ 
          display: 'flex', 
          alignItems: 'center', 
          padding: '0px 20px', 
          gap: 10, 
          backgroundColor: '#262626', 
          height: 60 
        }}>
          <Button
            variant="outline-primary"
            onClick={() => refreshActivity(page)}
            title="Refresh Activity"
          >
            <i className="bi bi-arrow-clockwise" />
            <span style={{ fontSize: 'small', marginLeft: 5 }}>Refresh</span>
          </Button>
        </Card.Header>
        <Card.Body style={{ padding: 20, overflowX: 'auto' }}>
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
            <div style={{ display: 'flex', justifyContent: 'center', marginTop: 20 }}>
              <LoadingIndicator />
            </div>
          )}
        </Card.Body>
      </Card>
      
      <div style={{ display: 'flex', justifyContent: 'center', marginTop: 20, gap: 10 }}>
        <Button
          variant="outline-secondary"
          disabled={page === 1}
          onClick={() => handlePageChange(1)}
          title="First page"
        >
          <i className="bi bi-skip-start-fill"></i>
        </Button>
        <Button
          variant="outline-secondary"
          disabled={page === 1}
          onClick={() => handlePageChange(page - 1)}
          title="Previous page"
        >
          <i className="bi bi-rewind-fill"></i>
        </Button>
        <div style={{ display: 'flex', alignItems: 'center', margin: '0px 10px' }}>
          {page} / {totalPages}
        </div>
        <Button
          variant="outline-secondary"
          disabled={page === totalPages}
          onClick={() => handlePageChange(page + 1)}
          title="Next page"
        >
          <i className="bi bi-fast-forward-fill"></i>
        </Button>
        <Button
          variant="outline-secondary"
          disabled={page === totalPages}
          onClick={() => handlePageChange(totalPages)}
          title="Last page"
        >
          <i className="bi bi-skip-end-fill"></i>
        </Button>
      </div>
    </Container>
  );
};

export default ActivityPage;
