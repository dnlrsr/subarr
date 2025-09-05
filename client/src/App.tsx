import React, { useState } from 'react';
import { Route, BrowserRouter as Router, Routes, useNavigate } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

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
    <div style={{ height: '100vh', overflow: 'hidden' }}>
      {/* Fixed Header */}
      <div style={{ position: 'fixed', top: 0, left: 0, right: 0, zIndex: 1030 }}>
        <Header
          searchTerm={searchTerm}
          onSearchChange={setSearchTerm}
          onSearchKeyDown={handleSearchKeyDown}
          onToggleSidebar={toggleSidebar}
        />
      </div>
      
      {/* Search Results Overlay */}
      <div style={{ position: 'fixed', top: '56px', left: 0, right: 0, zIndex: 1025 }}>
        <SearchResults
          isOpen={searchTerm}
          searchResults={searchResults}
          highlightedSearchResult={highlightedIndex}
          onClose={resetSearch}
        />
      </div>
      
      {/* Main Layout Container */}
      <div style={{ 
        display: 'flex', 
        paddingTop: '56px', // Height of the navbar
        height: '100vh' 
      }}>
        {/* Mobile Overlay */}
        {sidebarOpen && (
          <div 
            className="d-block d-md-none"
            style={{
              position: 'fixed',
              top: '56px',
              left: 0,
              right: 0,
              bottom: 0,
              backgroundColor: 'rgba(0, 0, 0, 0.5)',
              zIndex: 1019
            }}
            onClick={() => setSidebarOpen(false)}
          />
        )}
        
        {/* Fixed Sidebar */}
        <div 
          className={`${sidebarOpen ? 'd-block' : 'd-none d-md-block'}`}
          style={{
            position: 'fixed',
            left: 0,
            top: '56px', // Below the header
            width: '250px', // Fixed width for sidebar
            height: 'calc(100vh - 56px)',
            zIndex: 1020,
            backgroundColor: '#2a2a2a',
            boxShadow: '2px 0 5px #0000004d'
          }}
        >
          <Sidebar isOpen={sidebarOpen} onItemClick={() => setSidebarOpen(false)} />
        </div>
        
        {/* Content Area */}
        <div 
          style={{
            marginLeft: '250px', // Space for fixed sidebar on desktop
            padding: '20px',
            width: '100%',
            height: 'calc(100vh - 56px)',
            overflow: 'auto'
          }}
          className="d-none d-md-block"
        >
          <Routes>
            <Route path="/" element={<SubscriptionsPage />} />
            <Route path="/add" element={<AddPlaylistPage />} />
            <Route path="/activity" element={<ActivityPage />} />
            <Route path="/settings" element={<SettingsPage />} />
            <Route path="/playlist/:id" element={<PlaylistDetailsPage />} />
          </Routes>
        </div>
        
        {/* Mobile Content Area (full width when sidebar is hidden) */}
        <div 
          style={{
            padding: '20px',
            width: '100%',
            height: 'calc(100vh - 56px)',
            overflow: 'auto'
          }}
          className="d-block d-md-none"
        >
          <Routes>
            <Route path="/" element={<SubscriptionsPage />} />
            <Route path="/add" element={<AddPlaylistPage />} />
            <Route path="/activity" element={<ActivityPage />} />
            <Route path="/settings" element={<SettingsPage />} />
            <Route path="/playlist/:id" element={<PlaylistDetailsPage />} />
          </Routes>
        </div>
      </div>
      
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
