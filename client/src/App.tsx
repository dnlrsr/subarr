import React, { useState } from 'react';
import { Route, BrowserRouter as Router, Routes, useNavigate } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import './App.css';

// Components
import { SearchResults, UpdateDialog } from './components/features';
import { Header, Sidebar } from './components/layout';

// Pages
import ActivityPage from './pages/ActivityPage';
import AddPlaylistPage from './pages/AddPlaylistPage';
import PlaylistDetailsPage from './pages/PlaylistDetailsPage';
import SettingsPage from './pages/SettingsPage';
import SubscriptionsPage from './pages/SubscriptionsPage';

// Hooks
import { usePlaylists, useSearch, useVersionCheck } from './hooks';

const AppLayout: React.FC = () => {
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState<boolean>(false);
  const [updateDialogOpen, setUpdateDialogOpen] = useState<boolean>(false);

  // Custom hooks
  const { playlists } = usePlaylists();
  const { currentVersion, newVersionInfo, updateAvailable } = useVersionCheck();
  const { 
    searchTerm, 
    setSearchTerm, 
    searchResults, 
    highlightedIndex, 
    handleKeyDown, 
    resetSearch 
  } = useSearch(playlists);

  // Update dialog management
  React.useEffect(() => {
    if (updateAvailable) {
      setUpdateDialogOpen(true);
    }
  }, [updateAvailable]);

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  const handleSearchKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    handleKeyDown(event, (playlistId: string) => {
      navigate(`/playlist/${playlistId}`);
    });
  };

  return (
    <div className="app-layout">
      <Header
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
        onSearchKeyDown={handleSearchKeyDown}
        onToggleSidebar={toggleSidebar}
      />
      <SearchResults
        isOpen={searchTerm}
        searchResults={searchResults}
        highlightedSearchResult={highlightedIndex}
        onClose={resetSearch}
      />
      <div className="app-container">
        <Sidebar isOpen={sidebarOpen} onItemClick={() => setSidebarOpen(false)} />
        <main className="main-content">
          <Routes>
            <Route path="/" element={<SubscriptionsPage />} />
            <Route path="/add" element={<AddPlaylistPage />} />
            <Route path="/activity" element={<ActivityPage />} />
            <Route path="/settings" element={<SettingsPage />} />
            <Route path="/playlist/:id" element={<PlaylistDetailsPage />} />
          </Routes>
        </main>
        <UpdateDialog
          isOpen={updateDialogOpen}
          onClose={() => setUpdateDialogOpen(false)}
          currentVersion={currentVersion}
          newVersionInfo={newVersionInfo}
        />
        <ToastContainer
          position="bottom-right"
          theme="dark"
          autoClose={3000}
          hideProgressBar={false}
          newestOnTop={false}
          closeOnClick
          pauseOnHover
        />
      </div>
    </div>
  );
};

const App: React.FC = () => {
  return (
    <Router>
      <AppLayout />
    </Router>
  );
};

export default App;
