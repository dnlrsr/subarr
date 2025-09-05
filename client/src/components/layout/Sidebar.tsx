import React from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { Nav } from '../ui';

interface SidebarProps {
  isOpen: boolean;
  onItemClick: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ isOpen: _, onItemClick }) => {
  const location = useLocation();

  return (
    <div 
      style={{ 
        height: '100%',
        overflow: 'auto',
        backgroundColor: '#2a2a2a',
        boxShadow: '2px 0 5px #0000004d'
      }}
    >
      <Nav className="flex-column p-3" style={{ height: '100%' }}>
        <div className="mb-3">
          <Nav.Link 
            as={NavLink}
            to="/" 
            className={`d-flex align-items-center ${
              location.pathname === '/' || location.pathname.startsWith('/playlist') 
                ? 'active' : ''
            }`}
            style={{ color: '#ffffff' }}
            onClick={onItemClick}
          >
            <i className="bi bi-play-fill me-2"></i>
            Playlists
          </Nav.Link>
          <Nav.Link 
            as={NavLink}
            to="/add" 
            className="ps-4"
            style={{ color: '#cccccc' }}
            onClick={onItemClick}
          >
            Add New
          </Nav.Link>
        </div>
        
        <Nav.Link 
          as={NavLink}
          to="/activity"
          className={`d-flex align-items-center ${
            location.pathname === '/activity' ? 'active' : ''
          }`}
          style={{ color: '#ffffff' }}
          onClick={onItemClick}
        >
          <i className="bi bi-clock me-2"></i>
          Activity
        </Nav.Link>
        
        <Nav.Link 
          as={NavLink}
          to="/settings"
          className={`d-flex align-items-center ${
            location.pathname === '/settings' ? 'active' : ''
          }`}
          style={{ color: '#ffffff' }}
          onClick={onItemClick}
        >
          <i className="bi bi-gear-fill me-2"></i>
          Settings
        </Nav.Link>
      </Nav>
    </div>
  );
};

export default Sidebar;
