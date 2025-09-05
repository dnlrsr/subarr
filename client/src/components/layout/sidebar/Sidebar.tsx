import {
  faChartPie,
  faGear,
  faPlay,
  faPlus,
} from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import React from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import styles from './Sidebar.module.scss';

interface SidebarProps {
  isOpen: boolean;
  onItemClick: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ isOpen: _, onItemClick }) => {
  const { t } = useTranslation();

  return (
    <div className={styles.sidebar}>
      <nav className={styles.nav}>
        <ul className={styles.list}>
          <li className={styles.item}>
            <Link to="/" className={styles.link} onClick={onItemClick}>
              <span className={styles.icon}>
                <FontAwesomeIcon icon={faPlay} />
              </span>
              <span>{t('sidebar.playlists')}</span>
            </Link>
          </li>
          <li className={styles.item}>
            <Link to="/add" className={styles.link} onClick={onItemClick}>
              <span className={styles.icon}>
                <FontAwesomeIcon icon={faPlus} />
              </span>
              <span>{t('sidebar.addNew')}</span>
            </Link>
          </li>
          <li className={styles.item}>
            <Link to="/activity" className={styles.link} onClick={onItemClick}>
              <span className={styles.icon}>
                <FontAwesomeIcon icon={faChartPie} />
              </span>
              <span>{t('sidebar.activity')}</span>
            </Link>
          </li>
          <li className={styles.item}>
            <Link to="/settings" className={styles.link} onClick={onItemClick}>
              <span className={styles.icon}>
                <FontAwesomeIcon icon={faGear} />
              </span>
              <span>{t('sidebar.settings')}</span>
            </Link>
          </li>
        </ul>
      </nav>
    </div>
  );
};

export default Sidebar;
