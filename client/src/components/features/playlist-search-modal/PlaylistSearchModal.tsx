import { faSearch } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { usePlaylists, useSearch } from '../../../hooks';
import { Modal } from '../../layout';
import { Card, Form, InputGroup } from '../../ui';
import styles from './PlaylistSearchModal.module.scss';

interface PlaylistSearchModalProps {
  show?: boolean;
  onHide?: () => void;
}

const PlaylistSearchModal: React.FC<PlaylistSearchModalProps> = ({
  show = false,
  onHide,
}) => {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const { playlists } = usePlaylists();
  const { searchTerm, searchResults, setSearchTerm } = useSearch(playlists);

  const handleNavigateToPlaylist = (playlistId: number) => {
    navigate(`/playlist/${playlistId}`);
    onHide?.();
  };

  console.log('rendering modal', searchResults);

  return (
    <Modal show={show} onHide={onHide} size="lg">
      <Modal.Header closeButton>
        <Form>
          <InputGroup>
            <InputGroup.Text>
              <FontAwesomeIcon icon={faSearch} />
            </InputGroup.Text>
            <Form.Control
              type="text"
              placeholder={t('header.searchPlaceholder')}
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
            />
          </InputGroup>
        </Form>
      </Modal.Header>
      <Modal.Body>
        <div className={styles.bodyContainer}>
          <>
            {searchResults.slice(0, 5).map(res => (
              <Card
                size="grid"
                key={res.playlist_id}
                onClick={() => handleNavigateToPlaylist(res.id ?? 0)}
                style={{ cursor: 'pointer' }}
              >
                <Card.Img src={res.thumbnail} alt={res.title} />
                <Card.Body>
                  <Card.Title>{res.title}</Card.Title>
                </Card.Body>
              </Card>
            ))}
          </>
        </div>
      </Modal.Body>
    </Modal>
  );
};

export default PlaylistSearchModal;
