import React, { useState } from 'react';
import { Col, Container, Row } from 'react-bootstrap';
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
    <div className="d-flex flex-column min-vh-100">
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
      <Container fluid className="flex-grow-1">
        <Row className="h-100">
          <Col md={3} lg={2} className={`p-0 ${sidebarOpen ? 'd-block' : 'd-none d-md-block'}`}>
            <Sidebar isOpen={sidebarOpen} onItemClick={() => setSidebarOpen(false)} />
          </Col>
          <Col md={9} lg={10} className="p-3">
            <Routes>
              <Route path="/" element={<SubscriptionsPage />} />
              <Route path="/add" element={<AddPlaylistPage />} />
              <Route path="/activity" element={<ActivityPage />} />
              <Route path="/settings" element={<SettingsPage />} />
              <Route path="/playlist/:id" element={<PlaylistDetailsPage />} />
            </Routes>
          </Col>
        </Row>
      </Container>
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
