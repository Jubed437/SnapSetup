import React, { useState, useEffect } from 'react';
import { useProject } from '../context/ProjectContext';
import './Settings.css';

function Settings() {
  const { settings, saveSettings, settingsOpen, setSettingsOpen } = useProject();
  const [local, setLocal] = useState(settings || {});

  useEffect(() => {
    setLocal(settings || {});
  }, [settings]);

  if (!settingsOpen) return null;

  const close = () => setSettingsOpen(false);

  const handleSave = async () => {
    await saveSettings(local);
    close();
  };

  return (
    <div className="settings-overlay">
      <div className="settings-panel">
        <div className="settings-header">
          <h3>Settings</h3>
          <button onClick={close} className="close-btn">×</button>
        </div>

        <div className="settings-body">
          <label>
            Theme:
            <select value={local.theme || 'dark'} onChange={(e) => setLocal({ ...local, theme: e.target.value })}>
              <option value="dark">Dark</option>
              <option value="light">Light</option>
            </select>
          </label>

          <label>
            Use system terminal for long-running commands:
            <input
              type="checkbox"
              checked={!!local.useSystemTerminal}
              onChange={(e) => setLocal({ ...local, useSystemTerminal: e.target.checked })}
            />
          </label>

          <label>
            Default shell (Windows):
            <select value={local.defaultShell || 'powershell'} onChange={(e) => setLocal({ ...local, defaultShell: e.target.value })}>
              <option value="powershell">PowerShell</option>
              <option value="cmd">Command Prompt</option>
            </select>
          </label>

          <label>
            AI Agent enabled:
            <input
              type="checkbox"
              checked={!!local.aiAgentEnabled}
              onChange={(e) => setLocal({ ...local, aiAgentEnabled: e.target.checked })}
            />
          </label>

          <label>
            AI API Key (for code analysis & modifications):
            <input
              type="password"
              placeholder="Enter your API key"
              value={local.aiApiKey || ''}
              onChange={(e) => setLocal({ ...local, aiApiKey: e.target.value })}
            />
          </label>

          <label>
            AI Model:
            <select value={local.aiModel || 'gpt-4'} onChange={(e) => setLocal({ ...local, aiModel: e.target.value })}>
              <option value="gpt-4">GPT-4</option>
              <option value="gpt-3.5-turbo">GPT-3.5 Turbo</option>
              <option value="claude-3">Claude 3</option>
              <option value="gemini-pro">Gemini Pro</option>
            </select>
          </label>

          <label>
            AI API Key (for code analysis & modifications):
            <input
              type="password"
              placeholder="Enter your API key"
              value={local.aiApiKey || ''}
              onChange={(e) => setLocal({ ...local, aiApiKey: e.target.value })}
            />
          </label>

          <label>
            AI Model:
            <select value={local.aiModel || 'gpt-4'} onChange={(e) => setLocal({ ...local, aiModel: e.target.value })}>
              <option value="gpt-4">GPT-4</option>
              <option value="gpt-3.5-turbo">GPT-3.5 Turbo</option>
              <option value="claude-3">Claude 3</option>
              <option value="gemini-pro">Gemini Pro</option>
            </select>
          </label>
        </div>

        <div className="settings-footer">
          <button onClick={handleSave} className="save-btn">Save</button>
          <button onClick={close} className="cancel-btn">Cancel</button>
        </div>
      </div>
    </div>
  );
}

export default Settings;
