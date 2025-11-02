import React, { useState, useEffect } from 'react';
import { useProject } from '../context/ProjectContext';
import './Sidebar.css';

function Sidebar({ collapsed, setCollapsed }) {
  const { project, projectPath, analysis, showToast } = useProject();
  const [files, setFiles] = useState([]);
  const [expandedFolders, setExpandedFolders] = useState(new Set());

  useEffect(() => {
    if (projectPath) {
      loadFiles();
    }
  }, [projectPath]);

  const loadFiles = async () => {
    if (!window.electronAPI) return;
    const result = await window.electronAPI.readDirectory(projectPath);
    if (result.success) {
      setFiles(result.entries);
    }
  };

  const toggleFolder = (path) => {
    setExpandedFolders((prev) => {
      const next = new Set(prev);
      if (next.has(path)) {
        next.delete(path);
      } else {
        next.add(path);
      }
      return next;
    });
  };

  const handleOpenInVSCode = async () => {
    if (!window.electronAPI) {
      showToast('This feature requires Electron', 'error');
      return;
    }
    if (projectPath) {
      const result = await window.electronAPI.runCommand('code', [projectPath], projectPath);
      if (!result.success) {
        showToast('VS Code not found. Please install VS Code.', 'warning');
      }
    }
  };

  const handleOpenInCursor = async () => {
    if (!window.electronAPI) {
      showToast('This feature requires Electron', 'error');
      return;
    }
    if (projectPath) {
      const result = await window.electronAPI.runCommand('cursor', [projectPath], projectPath);
      if (!result.success) {
        showToast('Cursor not found. Please install Cursor.', 'warning');
      }
    }
  };

  const handleOpenFolder = async () => {
    if (!window.electronAPI) {
      showToast('This feature requires Electron', 'error');
      return;
    }
    if (projectPath) {
      await window.electronAPI.openPath(projectPath);
    }
  };

  const renderFileTree = () => {
    const directories = files.filter(f => f.type === 'directory');
    const regularFiles = files.filter(f => f.type === 'file' && !f.path.includes('/'));

    return (
      <div className="file-tree">
        {directories.map((dir) => (
          <div key={dir.path} className="file-tree-item">
            <div
              className="file-tree-row directory"
              onClick={() => toggleFolder(dir.path)}
            >
              <span className="folder-icon">
                {expandedFolders.has(dir.path) ? '📂' : '📁'}
              </span>
              <span className="file-name">{dir.name}</span>
            </div>
          </div>
        ))}
        {regularFiles.map((file) => (
          <div key={file.path} className="file-tree-item">
            <div className="file-tree-row file">
              <span className="file-icon">📄</span>
              <span className="file-name">{file.name}</span>
            </div>
          </div>
        ))}
      </div>
    );
  };

  if (collapsed) {
    return (
      <div className="sidebar collapsed">
        <button onClick={() => setCollapsed(false)} className="collapse-btn">
          ▶
        </button>
      </div>
    );
  }

  return (
    <div className="sidebar">
      <div className="sidebar-header">
        <h3>Project Explorer</h3>
        <button onClick={() => setCollapsed(true)} className="collapse-btn">
          ◀
        </button>
      </div>

      {project && analysis && (
        <>
          <div className="project-summary">
            <h4>Project: {analysis.name}</h4>
            <div className="summary-item">
              <span className="label">Type:</span>
              <span className="value">{analysis.type}</span>
            </div>
            <div className="summary-item">
              <span className="label">Stack:</span>
              <span className="value">{analysis.stack.join(', ') || 'Unknown'}</span>
            </div>
            {analysis.ports.length > 0 && (
              <div className="summary-item">
                <span className="label">Ports:</span>
                <span className="value">{analysis.ports.join(', ')}</span>
              </div>
            )}
            {analysis.nodeVersion && (
              <div className="summary-item">
                <span className="label">Node:</span>
                <span className="value">{analysis.nodeVersion}</span>
              </div>
            )}
            <div className="summary-item">
              <span className="label">Docker:</span>
              <span className="value">
                {analysis.hasDockerCompose ? '✅ Found' : '❌ Not found'}
              </span>
            </div>
            <div className="summary-item">
              <span className="label">.env:</span>
              <span className="value">
                {analysis.hasEnv ? '✅ Present' : analysis.hasEnvExample ? '⚠️ Example only' : '❌ Missing'}
              </span>
            </div>
          </div>

          <div className="quick-actions">
            <button onClick={handleOpenInVSCode} className="action-btn">
              Open in VS Code
            </button>
            <button onClick={handleOpenInCursor} className="action-btn">
              Open in Cursor
            </button>
            <button onClick={handleOpenFolder} className="action-btn">
              Open Data Folder
            </button>
          </div>

          <div className="file-explorer">
            <h4>Files</h4>
            {renderFileTree()}
          </div>
        </>
      )}

      {!project && (
        <div className="no-project">
          <p>No project loaded</p>
          <p className="hint">Click "Upload Project" to get started</p>
        </div>
      )}
    </div>
  );
}

export default Sidebar;
