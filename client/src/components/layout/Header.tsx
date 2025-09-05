import React from 'react';
import { Link } from 'react-router-dom';

interface HeaderProps {
  searchTerm: string;
  onSearchChange: (value: string) => void;
  onSearchKeyDown: (event: React.KeyboardEvent<HTMLInputElement>) => void;
  onToggleSidebar: () => void;
}

const Header: React.FC<HeaderProps> = ({
  searchTerm,
  onSearchChange,
  onSearchKeyDown,
  onToggleSidebar,
}) => {
  return (
    <header className="app-header">
      <Link className="app-icon" to="/">
        <img className="header-icon" src="/logo192.png" alt="App Icon" />
      </Link>
      <button className="sidebar-toggle" onClick={onToggleSidebar}>
        ☰
      </button>
      <div style={{ display: 'flex' }}>
        <i className="bi bi-search" style={{ fontSize: 'medium' }} />
        <input
          style={{
            backgroundColor: 'transparent',
            border: 'none',
            borderBottom: 'solid 1px white',
            marginLeft: 8,
            width: 200,
            color: 'inherit',
            fontSize: 'medium',
            outline: 'none',
          }}
          placeholder="Search"
          type="text"
          value={searchTerm}
          onChange={(e) => onSearchChange(e.target.value)}
          onKeyDown={onSearchKeyDown}
        />
        {searchTerm && (
          <button
            style={{
              display: 'flex',
              alignItems: 'center',
              borderBottom: 'solid 1px white',
              background: 'none',
              border: 'none',
              color: 'inherit',
            }}
            onClick={() => onSearchChange('')}
          >
            <i className="bi bi-x-lg" style={{ fontSize: 'medium' }} />
          </button>
        )}
      </div>
    </header>
  );
};

export default Header;
