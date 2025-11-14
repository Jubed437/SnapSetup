import React, { useState } from 'react';
import { useProject } from '../context/ProjectContext';
import './EditorArea.css';

function EditorArea() {
  const { project, analysis } = useProject();
  const [openTabs, setOpenTabs] = useState([
    { id: 'welcome', title: 'Welcome', type: 'welcome', active: true }
  ]);

  const closeTab = (tabId) => {
    const newTabs = openTabs.filter(tab => tab.id !== tabId);
    if (newTabs.length === 0) {
      setOpenTabs([{ id: 'welcome', title: 'Welcome', type: 'welcome', active: true }]);
    } else {
      setOpenTabs(newTabs.map((tab, index) => ({
        ...tab,
        active: index === newTabs.length - 1
      })));
    }
  };

  const setActiveTab = (tabId) => {
    setOpenTabs(tabs => tabs.map(tab => ({
      ...tab,
      active: tab.id === tabId
    })));
  };

  const renderWelcomeTab = () => (
    <div className="welcome-tab">
      <div className="welcome-header">
        <h1>SnapSetup</h1>
        <p>AI-powered JavaScript codebase setup automation</p>
      </div>
      
      <div className="welcome-content">
        <div className="welcome-section">
          <h3>🚀 Quick Start</h3>
          <ul>
            <li>Click the Explorer icon to browse your project files</li>
            <li>Use the integrated terminal to run commands</li>
            <li>Chat with the AI assistant for setup guidance</li>
          </ul>
        </div>

        {project && analysis && (
          <div className="welcome-section">
            <h3>📁 Current Project</h3>
            <div className="project-info">
              <div className="info-item">
                <span className="label">Name:</span>
                <span className="value">{analysis.name}</span>
              </div>
              <div className="info-item">
                <span className="label">Type:</span>
                <span className="value">{analysis.type}</span>
              </div>
              <div className="info-item">
                <span className="label">Stack:</span>
                <span className="value">{analysis.stack.join(', ') || 'Unknown'}</span>
              </div>
            </div>
          </div>
        )}

        <div className="welcome-section">
          <h3>🔧 Features</h3>
          <div className="features-grid">
            <div className="feature-card">
              <span className="feature-icon">🤖</span>
              <h4>AI Assistant</h4>
              <p>Get intelligent help with your setup process</p>
            </div>
            <div className="feature-card">
              <span className="feature-icon">📦</span>
              <h4>Auto Dependencies</h4>
              <p>Automatic dependency detection and installation</p>
            </div>
            <div className="feature-card">
              <span className="feature-icon">🐳</span>
              <h4>Docker Support</h4>
              <p>Generate and manage Docker configurations</p>
            </div>
            <div className="feature-card">
              <span className="feature-icon">⚡</span>
              <h4>Quick Setup</h4>
              <p>One-click project initialization</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  const activeTab = openTabs.find(tab => tab.active);

  return (
    <div className="editor-area">
      <div className="tab-bar">
        {openTabs.map((tab) => (
          <div
            key={tab.id}
            className={`tab ${tab.active ? 'active' : ''}`}
            onClick={() => setActiveTab(tab.id)}
          >
            <span className="tab-title">{tab.title}</span>
            {tab.id !== 'welcome' && (
              <button
                className="tab-close"
                onClick={(e) => {
                  e.stopPropagation();
                  closeTab(tab.id);
                }}
              >
                ×
              </button>
            )}
          </div>
        ))}
      </div>
      
      <div className="editor-content">
        {activeTab?.type === 'welcome' && renderWelcomeTab()}
      </div>
    </div>
  );
}

export default EditorArea;