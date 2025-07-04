import { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
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
              <li><Link to="/" onClick={() => setSidebarOpen(false)}>Subscriptions</Link></li>
              <li><Link to="/add" onClick={() => setSidebarOpen(false)}>Add Playlist</Link></li>
              <li><Link to="/settings" onClick={() => setSidebarOpen(false)}>Settings</Link></li>
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