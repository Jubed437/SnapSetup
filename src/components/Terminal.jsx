import React, { useEffect, useRef, useState } from 'react';
import { useProject } from '../context/ProjectContext';
import './Terminal.css';

function Terminal() {
  const { terminalOutput, clearTerminal, addTerminalOutput } = useProject();
  const terminalRef = useRef(null);
  const [autoScroll, setAutoScroll] = useState(true);

  useEffect(() => {
    // Check if running in Electron
    if (!window.electronAPI) {
      console.warn('Not running in Electron - Terminal features disabled');
      return;
    }

    // Set up listeners for command output
    window.electronAPI.onCommandOutput((data) => {
      addTerminalOutput({
        type: data.type,
        text: data.data,
        commandId: data.id,
      });
    });

    window.electronAPI.onCommandComplete((data) => {
      addTerminalOutput({
        type: 'info',
        text: `\n[Process exited with code ${data.code}]\n`,
        commandId: data.id,
      });
    });

    window.electronAPI.onCommandError((data) => {
      addTerminalOutput({
        type: 'error',
        text: `\n[Error: ${data.error}]\n`,
        commandId: data.id,
      });
    });

    return () => {
      window.electronAPI.removeListener('command-output');
      window.electronAPI.removeListener('command-complete');
      window.electronAPI.removeListener('command-error');
    };
  }, []);

  useEffect(() => {
    if (autoScroll && terminalRef.current) {
      terminalRef.current.scrollTop = terminalRef.current.scrollHeight;
    }
  }, [terminalOutput, autoScroll]);

  const handleScroll = (e) => {
    const { scrollTop, scrollHeight, clientHeight } = e.target;
    const isAtBottom = scrollHeight - scrollTop - clientHeight < 50;
    setAutoScroll(isAtBottom);
  };

  const handleClear = () => {
    clearTerminal();
  };

  const handleCopy = () => {
    const text = terminalOutput.map((o) => o.text).join('');
    navigator.clipboard.writeText(text);
  };

  const formatTimestamp = (timestamp) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString('en-US', { hour12: false });
  };

  const getLineClass = (type) => {
    if (type === 'stderr' || type === 'error') return 'error';
    if (type === 'info') return 'info';
    return 'stdout';
  };

  return (
    <div className="terminal-panel">
      <div className="terminal-header">
        <div className="terminal-title">
          <span className="icon">▶️</span>
          <span>Terminal</span>
        </div>
        <div className="terminal-actions">
          <button onClick={handleCopy} className="terminal-btn" title="Copy output">
            📋
          </button>
          <button onClick={handleClear} className="terminal-btn" title="Clear terminal">
            🗑️
          </button>
        </div>
      </div>
      <div
        className="terminal-content"
        ref={terminalRef}
        onScroll={handleScroll}
      >
        {terminalOutput.length === 0 ? (
          <div className="terminal-empty">
            <p>Terminal output will appear here...</p>
            <p className="hint">Commands will be executed when you start the setup</p>
          </div>
        ) : (
          <div className="terminal-lines">
            {terminalOutput.map((output, index) => (
              <div key={output.id || index} className={`terminal-line ${getLineClass(output.type)}`}>
                <span className="timestamp">{formatTimestamp(output.timestamp)}</span>
                <span className="output-text">{output.text}</span>
              </div>
            ))}
          </div>
        )}
        {!autoScroll && (
          <div className="scroll-indicator">
            <button onClick={() => terminalRef.current?.scrollTo({ top: terminalRef.current.scrollHeight, behavior: 'smooth' })}>
              ↓ Scroll to bottom
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

export default Terminal;
