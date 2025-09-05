import { formatDistance } from 'date-fns';
import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { Button, Card, Container, LoadingIndicator } from '../components/ui';
import { Activity, PaginatedResponse } from '../types';

const ActivityPage: React.FC = () => {
  const { t } = useTranslation();
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
        <Card.Header >
          <Button
            
            variant="outline-primary"
            onClick={() => refreshActivity(page)}
            title="Refresh Activity"
          >
            <i />
            <span >{t('common.refresh')}</span>
          </Button>
        </Card.Header>
        <Card.Body >
          <table >
            <thead>
              <tr>
                <th></th>
                <th>{t('activityPage.tableHeaders.playlist')}</th>
                <th>{t('activityPage.tableHeaders.title')}</th>
                <th>{t('activityPage.tableHeaders.message')}</th>
                <th>{t('activityPage.tableHeaders.date')}</th>
              </tr>
            </thead>
            <tbody>
              {activities.map((activity) => (
                <tr key={activity.id}>
                  <td>
                    <i 
                      className={`bi bi-${activity.icon}`} 
                    />
                  </td>
                  <td className="fixed">
                    {activity.playlist_db_id ? (
                      <Link to={`/playlist/${activity.playlist_db_id}`}>
                        {activity.playlist_title}
                      </Link>
                    ) : (
                      <div >{t('common.playlistDeleted')}</div>
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
            <div >
              <LoadingIndicator />
            </div>
          )}
        </Card.Body>
      </Card>
      
      <div >
        <Button
          
          variant="outline-secondary"
          disabled={page === 1}
          onClick={() => handlePageChange(1)}
          title={t('activityPage.firstPage')}
        >
          <i ></i>
        </Button>
        <Button
          
          variant="outline-secondary"
          disabled={page === 1}
          onClick={() => handlePageChange(page - 1)}
          title={t('activityPage.previousPage')}
        >
          <i ></i>
        </Button>
        <div >
          {page} / {totalPages}
        </div>
        <Button
          
          variant="outline-secondary"
          disabled={page === totalPages}
          onClick={() => handlePageChange(page + 1)}
          title={t('activityPage.nextPage')}
        >
          <i ></i>
        </Button>
        <Button
          
          variant="outline-secondary"
          disabled={page === totalPages}
          onClick={() => handlePageChange(totalPages)}
          title={t('activityPage.lastPage')}
        >
          <i ></i>
        </Button>
      </div>
    </Container>
  );
};

export default ActivityPage;
