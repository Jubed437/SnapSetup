import React, { useState, useEffect } from 'react';
import Header from './components/Header';
import Settings from './components/Settings';
import Sidebar from './components/Sidebar';
import Terminal from './components/Terminal';
import AIAgent from './components/AIAgent';
import DatabaseViewer from './components/DatabaseViewer';
import Footer from './components/Footer';
import Toast from './components/Toast';
import { ProjectProvider, useProject } from './context/ProjectContext';
import { useFileWatcher } from './hooks/useFileWatcher';
import './App.css';

function AppContent() {
  const [theme, setTheme] = useState('dark');
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [isElectron, setIsElectron] = useState(false);
  

  // Enable file watching
  useFileWatcher();

  useEffect(() => {
    document.body.className = theme;
    setIsElectron(!!window.electronAPI);
  }, [theme]);

  // Sync theme with persisted settings in ProjectContext
  const { settings } = useProject();
  useEffect(() => {
    if (settings && settings.theme && settings.theme !== theme) {
      setTheme(settings.theme);
    }
  }, [settings]);

  return (
    <div className="app">
      {!isElectron && (
        <div style={{
          background: '#d97706',
          color: 'white',
          padding: '12px',
          textAlign: 'center',
          fontWeight: '500',
          fontSize: '14px'
        }}>
          ⚠️ Running in browser mode - Please run with: <code style={{background: 'rgba(0,0,0,0.2)', padding: '2px 8px', borderRadius: '3px', marginLeft: '8px'}}>npm run dev</code>
        </div>
      )}
  <Header theme={theme} setTheme={setTheme} />
      <div className="app-body">
        <Sidebar collapsed={sidebarCollapsed} setCollapsed={setSidebarCollapsed} />
        <div className="main-area">
          <div className="top-panels">
            <Terminal />
            <AIAgent />
          </div>
          <DatabaseViewer />
        </div>
      </div>
      <Footer />
      <Toast />
      <Settings />
    </div>
  );
}

function App() {
  return (
    <ProjectProvider>
      <AppContent />
    </ProjectProvider>
  );
}

export default App;
