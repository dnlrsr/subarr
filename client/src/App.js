import { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, NavLink, useLocation, Link } from 'react-router-dom';
import SubscriptionsPage from './pages/SubscriptionsPage';
import AddPlaylistPage from './pages/AddPlaylistPage';
import SettingsPage from './pages/SettingsPage';
import PlaylistDetailsPage from './pages/PlaylistDetailsPage';
import './App.css';

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
          <ul>
            <li>
              <NavLink to="/" end className={({ isActive }) =>
                  isActive || location.pathname.startsWith('/playlist')
                    ? 'active-link'
                    : ''
                }
                onClick={() => setSidebarOpen(false)}>
                Subscriptions
              </NavLink>
            </li>
            <li>
              <NavLink to="/add" className={({ isActive }) => isActive ? 'active-link' : ''} onClick={() => setSidebarOpen(false)}>
                Add Playlist
              </NavLink>
            </li>
            {/* Todo: an "Activity" page could be useful to show playlist items recently found */}
            <li>
              <NavLink to="/settings" className={({ isActive }) => isActive ? 'active-link' : ''} onClick={() => setSidebarOpen(false)}>
                Settings
              </NavLink>
            </li>
          </ul>
        </nav>
        <main className="main-content">
          <Routes>
            <Route path="/" element={<SubscriptionsPage />} />
            <Route path="/add" element={<AddPlaylistPage />} />
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