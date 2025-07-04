import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import SubscriptionsPage from './pages/SubscriptionsPage';
import AddPlaylistPage from './pages/AddPlaylistPage';
import SettingsPage from './pages/SettingsPage';
import PlaylistDetailsPage from './pages/PlaylistDetailsPage';

function App() {
  return (
    <Router>
      <nav style={{ padding: '10px' }}>
        <Link to="/">Subscriptions</Link> |{' '}
        <Link to="/add">Add Playlist</Link> |{' '}
        <Link to="/settings">Settings</Link>
      </nav>

      <Routes>
        <Route path="/" element={<SubscriptionsPage />} />
        <Route path="/add" element={<AddPlaylistPage />} />
        <Route path="/settings" element={<SettingsPage />} />
        <Route path="/playlist/:id" element={<PlaylistDetailsPage />} />
      </Routes>
    </Router>
  );
}

export default App;