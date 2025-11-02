import React, { useState, useEffect } from 'react';
import { useProject } from '../context/ProjectContext';
import './Header.css';

function Header({ theme, setTheme }) {
  const { loadProject, showToast, setSettingsOpen, setShowLogs } = useProject();

  const handleUploadProject = async () => {
    if (!window.electronAPI) {
      showToast('This feature requires Electron', 'error');
      return;
    }
    const path = await window.electronAPI.selectFolder();
    if (path) {
      const result = await loadProject(path);
      if (!result.success) {
        showToast(`Failed to load project: ${result.error}`, 'error');
      }
    }
  };

  const handleOpenLogs = () => {
    if (setShowLogs) setShowLogs(true);
  };

  const handleSettings = () => {
    setSettingsOpen(true);
  };

  const toggleTheme = () => {
    setTheme(theme === 'dark' ? 'light' : 'dark');
  };

  return (
    <div className="header">
      <div className="header-left">
        <div className="app-logo">
          {/* Header shows only a small SVG mark. The user-provided logo is reserved for desktop/app icon only. */}
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
            <path
              d="M12 2L2 7L12 12L22 7L12 2Z"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <path
              d="M2 17L12 22L22 17"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <path
              d="M2 12L12 17L22 12"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </div>
        <h1 className="app-title">SnapSetup</h1>
      </div>
      
      <div className="header-right">
        <button onClick={handleUploadProject} className="header-btn">
          Upload Project
        </button>
        <button onClick={handleOpenLogs} className="header-btn">
          Open Logs
        </button>
        <button onClick={handleSettings} className="header-btn">
          Settings
        </button>
        <button onClick={toggleTheme} className="header-btn theme-toggle">
          {theme === 'dark' ? '☀️' : '🌙'}
        </button>
      </div>
    </div>
  );
}

export default Header;
