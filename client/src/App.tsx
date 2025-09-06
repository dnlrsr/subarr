import React, { useState } from 'react';
import { Route, BrowserRouter as Router, Routes } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

import { UpdateDialog } from './components/features';
import { Header, Sidebar } from './components/layout';

import ActivityPage from './pages/ActivityPage';
import AddPlaylistPage from './pages/add-playlist-page/AddPlaylistPage';
import PlaylistDetailsPage from './pages/PlaylistDetailsPage';
import SettingsPage from './pages/settings-page/SettingsPage';
import SubscriptionsPage from './pages/SubscriptionsPage';

import { useVersionCheck } from './hooks';

import styles from './App.module.scss';

const AppLayout: React.FC = () => {
  const [sidebarOpen, setSidebarOpen] = useState<boolean>(false);

  const [updateDialogOpen, setUpdateDialogOpen] = useState<boolean>(false);

  const { currentVersion, newVersionInfo, updateAvailable } = useVersionCheck();

  React.useEffect(() => {
    if (updateAvailable) {
      setUpdateDialogOpen(true);
    }
  }, [updateAvailable]);

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  return (
    <div className={styles.appContainer}>
      {/* Fixed Header */}
      <div className={styles.header}>
        <Header onToggleSidebar={toggleSidebar} />
      </div>

      {/* Main Layout Container */}
      <div>
        {/* Mobile Overlay */}
        {sidebarOpen && (
          <div
            className="d-block d-md-none"
            onClick={() => setSidebarOpen(false)}
          />
        )}

        {/* Fixed Sidebar */}
        <div
          className={`${sidebarOpen ? 'd-block' : 'd-none d-md-block'} ${styles.sideBar}`}
        >
          <Sidebar
            isOpen={sidebarOpen}
            onItemClick={() => setSidebarOpen(false)}
          />
        </div>

        {/* Content Area */}
        <div className={styles.mainContent}>
          <div className={`d-none d-md-block`}>
            <Routes>
              <Route path="/" element={<SubscriptionsPage />} />
              <Route path="/add" element={<AddPlaylistPage />} />
              <Route path="/activity" element={<ActivityPage />} />
              <Route path="/settings" element={<SettingsPage />} />
              <Route path="/playlist/:id" element={<PlaylistDetailsPage />} />
            </Routes>
          </div>

          {/* Mobile Content Area (full width when sidebar is hidden) */}
          <div className="d-block d-md-none">
            <Routes>
              <Route path="/" element={<SubscriptionsPage />} />
              <Route path="/add" element={<AddPlaylistPage />} />
              <Route path="/activity" element={<ActivityPage />} />
              <Route path="/settings" element={<SettingsPage />} />
              <Route path="/playlist/:id" element={<PlaylistDetailsPage />} />
            </Routes>
          </div>
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
