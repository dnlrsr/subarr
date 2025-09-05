import {
  faChartPie,
  faGear,
  faPlay,
  faPlus,
} from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import React from 'react';
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
            <a href="/" className={styles.link} onClick={onItemClick}>
              <span className={styles.icon}>
                <FontAwesomeIcon icon={faPlay} />
              </span>
              <span>{t('sidebar.playlists')}</span>
            </a>
          </li>
          <li className={styles.item}>
            <a href="/add" className={styles.link} onClick={onItemClick}>
              <span className={styles.icon}>
                <FontAwesomeIcon icon={faPlus} />
              </span>
              <span>{t('sidebar.addNew')}</span>
            </a>
          </li>
          <li className={styles.item}>
            <a href="/activity" className={styles.link} onClick={onItemClick}>
              <span className={styles.icon}>
                <FontAwesomeIcon icon={faChartPie} />
              </span>
              <span>{t('sidebar.activity')}</span>
            </a>
          </li>
          <li className={styles.item}>
            <a href="/settings" className={styles.link} onClick={onItemClick}>
              <span className={styles.icon}>
                <FontAwesomeIcon icon={faGear} />
              </span>
              <span>{t('sidebar.settings')}</span>
            </a>
          </li>
        </ul>
      </nav>
    </div>
  );
};

export default Sidebar;
