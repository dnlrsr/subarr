import React from 'react';
import { Nav } from 'react-bootstrap';
import { NavLink, useLocation } from 'react-router-dom';

interface SidebarProps {
  isOpen: boolean;
  onItemClick: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ isOpen: _, onItemClick }) => {
  const location = useLocation();

  return (
    <div className="bg-light h-100 border-end">
      <Nav className="flex-column p-3">
        <div className="mb-3">
          <Nav.Link 
            as={NavLink}
            to="/" 
            className={`d-flex align-items-center ${
              location.pathname === '/' || location.pathname.startsWith('/playlist') 
                ? 'active' : ''
            }`}
            onClick={onItemClick}
          >
            <i className="bi bi-play-fill me-2"></i>
            Playlists
          </Nav.Link>
          <Nav.Link 
            as={NavLink}
            to="/add" 
            className="ps-4 text-muted"
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
