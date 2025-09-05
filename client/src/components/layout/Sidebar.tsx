import React from 'react';
import { useTranslation } from 'react-i18next';
import { NavLink, useLocation } from 'react-router-dom';
import { Nav } from '../ui';

interface SidebarProps {
  isOpen: boolean;
  onItemClick: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ isOpen: _, onItemClick }) => {
  const { t } = useTranslation();
  const location = useLocation();

  return (
    <div 
    >
      <Nav >
        <div >
          <Nav.Link 
            as={NavLink}
            to="/" 
            className={`d-flex align-items-center ${
              location.pathname === '/' || location.pathname.startsWith('/playlist') 
                ? 'active' : ''
            }`}
            
            onClick={onItemClick}
          >
            <i ></i>
            {t('sidebar.playlists')}
          </Nav.Link>
          <Nav.Link 
            as={NavLink}
            to="/add" 
            
            
            onClick={onItemClick}
          >
            {t('sidebar.addNew')}
          </Nav.Link>
        </div>
        
        <Nav.Link 
          as={NavLink}
          to="/activity"
          className={`d-flex align-items-center ${
            location.pathname === '/activity' ? 'active' : ''
          }`}
          
          onClick={onItemClick}
        >
          <i ></i>
          {t('sidebar.activity')}
        </Nav.Link>
        
        <Nav.Link 
          as={NavLink}
          to="/settings"
          className={`d-flex align-items-center ${
            location.pathname === '/settings' ? 'active' : ''
          }`}
          
          onClick={onItemClick}
        >
          <i ></i>
          {t('sidebar.settings')}
        </Nav.Link>
      </Nav>
    </div>
  );
};

export default Sidebar;
