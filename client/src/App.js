import { useEffect, useState } from 'react';
import { BrowserRouter as Router, Routes, Route, NavLink, useLocation, Link } from 'react-router-dom';
import Markdown from 'react-markdown';
import SubscriptionsPage from './pages/SubscriptionsPage';
import AddPlaylistPage from './pages/AddPlaylistPage';
import SettingsPage from './pages/SettingsPage';
import PlaylistDetailsPage from './pages/PlaylistDetailsPage';
import './App.css';
import ActivityPage from './pages/ActivityPage';
import { formatDistance } from 'date-fns';
import DialogBase from './components/DialogBase';

function AppLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const location = useLocation();

  const [searchTerm, setSearchTerm] = useState('');

  const [currentVersion, setCurrentVersion] = useState(null);
  const [newVersionInfo, setNewVersionInfo] = useState(null);
  const [updateDialogOpen, setUpdateDialogOpen] = useState(false);

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };
  
  useEffect(() => {
    async function checkForUpdate() {
      const metaResponse = await fetch('/api/meta');
      const currentVersionNumber = (await metaResponse.json()).versions.youtubarr;
      setCurrentVersion(currentVersionNumber);

      const githubResponse = await fetch('https://api.github.com/repos/derekantrican/youtubarr/releases');
      const latestVersionInfo = (await githubResponse.json())[0];
      const latestVersionNumber = Number(latestVersionInfo.tag_name);

      if (currentVersionNumber < latestVersionNumber) {
        setNewVersionInfo(latestVersionInfo);
        setUpdateDialogOpen(true);
      }
    }

    checkForUpdate();
  }, []);

  return (
    <div className="app-layout">
      <header className="app-header">
        <Link className='app-icon' to='/'>
          <img className="header-icon" src="/logo192.png" alt="App Icon" />
        </Link>
        <button className="sidebar-toggle" onClick={toggleSidebar}>
          ☰
        </button>
        <div style={{display: location.pathname === '/' ? 'flex' : 'none' /* Only show the search bar on the home page */}}>
          <i className="bi bi-search" style={{fontSize: 'medium'}}/>
          <input
            style={{backgroundColor: 'transparent', border: 'none', borderBottom: 'solid 1px white', marginLeft: 8, width: 200, color: 'inherit', fontSize: 'medium', outline: 'none'}}
            placeholder='Search'
            type='text'
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}/>
          {searchTerm ?
            <button
            style={{ display: 'flex', alignItems: 'center', borderBottom: 'solid 1px white' }}
            onClick={() => setSearchTerm('')}>
              <i className="bi bi-x-lg" style={{fontSize: 'medium'}}/>
            </button>
          : null}
        </div>
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
            <Route path="/" element={<SubscriptionsPage searchTerm={searchTerm} />} />
            <Route path="/add" element={<AddPlaylistPage />} />
            <Route path="/activity" element={<ActivityPage />} />
            <Route path="/settings" element={<SettingsPage />} />
            <Route path="/playlist/:id" element={<PlaylistDetailsPage />} />
          </Routes>
        </main>
        <DialogBase isOpen={updateDialogOpen} onClose={() => setUpdateDialogOpen(false)} title='Update available!'>
            <div style={{display: 'flex'}}>
              <div style={{minWidth: 80}}>{currentVersion} → {newVersionInfo?.tag_name}</div>
              <div style={{marginLeft: 20, fontStyle: 'italic'}}>(Released: {newVersionInfo ? formatDistance(new Date(newVersionInfo.published_at), new Date(), { addSuffix: true }) : null})</div>
            </div>
            <Markdown components={{
              p: ({node, ...props}) => (<p style={{overflowWrap: 'anywhere'}} {...props}/>),
              code: ({node, ...props}) => (<code style={{backgroundColor: 'lightgray', color: 'black', padding: '2px 5px'}} {...props}/>),
            }}>
                {newVersionInfo?.body}
            </Markdown>
            <a style={{overflowWrap: 'anywhere'}} href={newVersionInfo?.html_url} target='_blank' rel='noreferrer'>{newVersionInfo?.html_url}</a>
        </DialogBase>
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