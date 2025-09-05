import React from 'react';
import { NavLink, useLocation } from 'react-router-dom';

interface SidebarProps {
  isOpen: boolean;
  onItemClick: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ isOpen, onItemClick }) => {
  const location = useLocation();

  return (
    <nav className={`sidebar ${isOpen ? 'open' : ''}`}>
      <div style={{ display: 'flex', flexDirection: 'column', width: '100%' }}>
        <div className={`navgroup ${
          location.pathname === '/' || 
          location.pathname.startsWith('/playlist') || 
          location.pathname === '/add' ? 'active' : ''
        }`}>
          <NavLink 
            to="/" 
            className={({ isActive }) => 
              isActive || location.pathname.startsWith('/playlist') ? 'active' : ''
            }
            onClick={onItemClick}
          >
            <i className="bi bi-play-fill" style={{ fontSize: 'large' }}></i>
            Playlists
          </NavLink>
          <NavLink className="subnav" to="/add" onClick={onItemClick}>
            Add New
          </NavLink>
        </div>
        <div className={`navgroup ${location.pathname === '/activity' ? 'active' : ''}`}>
          <NavLink to="/activity" onClick={onItemClick}>
            <i className="bi bi-clock" style={{ fontSize: 'medium', marginRight: 5 }}></i>
            Activity
          </NavLink>
        </div>
        <div className={`navgroup ${location.pathname === '/settings' ? 'active' : ''}`}>
          <NavLink 
            to="/settings" 
            className={({ isActive }) => isActive ? 'active-link' : ''} 
            onClick={onItemClick}
          >
            <i className="bi bi-gear-fill" style={{ fontSize: 'medium', marginRight: 5 }}></i>
            Settings
          </NavLink>
        </div>
      </div>
    </nav>
  );
};

export default Sidebar;
