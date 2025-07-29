import { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, NavLink, useLocation, Link } from 'react-router-dom';
import SubscriptionsPage from './pages/SubscriptionsPage';
import AddPlaylistPage from './pages/AddPlaylistPage';
import SettingsPage from './pages/SettingsPage';
import PlaylistDetailsPage from './pages/PlaylistDetailsPage';
import './App.css';
import ActivityPage from './pages/ActivityPage';

function AppLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const location = useLocation();

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  return (
    <div className="app-layout">
      <header className="app-header">
        <Link to='/'>
          <img src="/logo192.png" alt="App Icon" className="header-icon" />
        </Link>
        <button className="sidebar-toggle" onClick={toggleSidebar}>
          ☰
        </button>
        <Link to='/' style={{textDecoration: 'none'}}>
          <h1>YouTubarr</h1>
        </Link>
      </header>
      <div className="app-container">
        <nav className={`sidebar ${sidebarOpen ? 'open' : ''}`}>
          <div style={{display: 'flex', flexDirection: 'column', width: '100%'}}>
            <div className={`navgroup ${location.pathname === '/' || location.pathname.startsWith('/playlist') || location.pathname === '/add' ? 'active' : ''}`}>
              <NavLink to="/" className={({ isActive }) => isActive || location.pathname.startsWith('/playlist') ? 'active' : ''}
                onClick={() => setSidebarOpen(false)}>
                <i className="bi bi-play-fill" style={{fontSize: 'large'}}></i>
                Playlists
              </NavLink>
              <NavLink className='subnav' to="/add" onClick={() => setSidebarOpen(false)}>
                Add New
              </NavLink>
            </div>
            <div className={`navgroup ${location.pathname === '/activity' ? 'active' : ''}`}>
              <NavLink to="/activity" onClick={() => setSidebarOpen(false)}>
                <i className="bi bi-clock" style={{fontSize: 'medium', marginRight: 5}}></i>
                Activity
              </NavLink>
            </div>
            <div className={`navgroup ${location.pathname === '/settings' ? 'active' : ''}`}>
              <NavLink to="/settings" className={({ isActive }) => isActive ? 'active-link' : ''} onClick={() => setSidebarOpen(false)}>
                <i className="bi bi-gear-fill" style={{fontSize: 'medium', marginRight: 5}}></i>
                Settings
              </NavLink>
            </div>
          </div>
        </nav>
        <main className="main-content">
          <Routes>
            <Route path="/" element={<SubscriptionsPage />} />
            <Route path="/add" element={<AddPlaylistPage />} />
            <Route path="/activity" element={<ActivityPage />} />
            <Route path="/settings" element={<SettingsPage />} />
            <Route path="/playlist/:id" element={<PlaylistDetailsPage />} />
          </Routes>
        </main>
      </div>
    </div>
  );
}

function App() {
  return (
    <Router>
      <AppLayout />
    </Router>
  );
}

export default App;