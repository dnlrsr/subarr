import { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, NavLink } from 'react-router-dom';
import SubscriptionsPage from './pages/SubscriptionsPage';
import AddPlaylistPage from './pages/AddPlaylistPage';
import SettingsPage from './pages/SettingsPage';
import PlaylistDetailsPage from './pages/PlaylistDetailsPage';
import './App.css';

function App() {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  return (
    <Router>
      <div className="app-layout">
        <header className="app-header">
          <img src="/logo192.png" alt="App Icon" className="header-icon" />
          <button className="sidebar-toggle" onClick={toggleSidebar}>
            ☰
          </button>
          <h1>YouTubarr</h1>
        </header>
        <div className="app-container">
          <nav className={`sidebar ${sidebarOpen ? 'open' : ''}`}>
            <ul>
              <li>
                <NavLink to="/" end className={({ isActive }) => isActive ? 'active-link' : ''} onClick={() => setSidebarOpen(false)}>
                  Subscriptions
                </NavLink>
              </li>
              <li>
                <NavLink to="/add" className={({ isActive }) => isActive ? 'active-link' : ''} onClick={() => setSidebarOpen(false)}>
                  Add Playlist
                </NavLink>
              </li>
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
    </Router>
  );
}

export default App;