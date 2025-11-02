import React, { useState, useEffect } from 'react';
import DatabaseConnector from '../utils/DatabaseConnector';
import { saveAs } from 'file-saver';
import { useProject } from '../context/ProjectContext';
import './DatabaseViewer.css';

function DatabaseViewer() {
  const { logs, showLogs, setShowLogs, showToast } = useProject();
  const [collapsed, setCollapsed] = useState(true);
  const [activeTab, setActiveTab] = useState('logs'); // logs, data, export
  const [dbDialogOpen, setDbDialogOpen] = useState(false);
  const [dbType, setDbType] = useState('mongodb');
  const [connStr, setConnStr] = useState('');
  const [dbStatus, setDbStatus] = useState(null);
  const [dbConnector, setDbConnector] = useState(null);
  const [tables, setTables] = useState([]);
  const [selectedTable, setSelectedTable] = useState(null);
  const [tableData, setTableData] = useState([]);
  const [loadingData, setLoadingData] = useState(false);

  useEffect(() => {
    if (showLogs) {
      setCollapsed(false);
      setActiveTab('logs');
      if (setShowLogs) setShowLogs(false);
    }
  }, [showLogs]);

  const renderLogs = () => {
    return (
      <div className="logs-content">
        {logs.length === 0 ? (
          <div className="empty-state">
            <p>No logs yet</p>
            <p className="hint">Logs will appear here during setup</p>
          </div>
        ) : (
          <div className="logs-list">
            {logs.map((log) => (
              <div key={log.id} className={`log-entry ${log.type}`}>
                <span className="log-time">
                  {new Date(log.timestamp).toLocaleTimeString()}
                </span>
                <span className="log-type-badge">{log.type}</span>
                <span className="log-message">{log.message}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    );
  };

  const handleOpenDbDialog = () => setDbDialogOpen(true);
  const handleCloseDbDialog = () => setDbDialogOpen(false);

  const handleConnectDb = async () => {
    setDbStatus('connecting');
    const connector = new DatabaseConnector();
    const result = await connector.connect(connStr, dbType);
    setDbStatus(result.success ? 'connected' : 'error');
    setDbConnector(connector);
    if (result.success) {
      showToast && showToast('Connected to database!', 'success');
      // Fetch tables
      const t = await connector.getTables();
      setTables(t.tables || []);
      setSelectedTable(null);
      setTableData([]);
      setDbDialogOpen(false);
    } else {
      showToast && showToast(result.error || 'Failed to connect', 'error');
    }
  };

  const handleSelectTable = async (table) => {
    setSelectedTable(table.name);
    setLoadingData(true);
    if (dbConnector) {
      const res = await dbConnector.queryTable(table.name);
      setTableData(res.data || []);
    }
    setLoadingData(false);
  };

  const renderData = () => {
    if (!dbConnector || dbStatus !== 'connected') {
      return (
        <div className="data-content">
          <div className="empty-state">
            <p>Database viewer</p>
            <p className="hint">Connect to a database to view data</p>
            <button className="connect-btn" onClick={handleOpenDbDialog}>Connect Database</button>
          </div>
          {dbDialogOpen && (
            <div className="db-dialog-overlay">
              <div className="db-dialog">
                <h4>Connect to Database</h4>
                <label>
                  Type:
                  <select value={dbType} onChange={e => setDbType(e.target.value)}>
                    <option value="mongodb">MongoDB</option>
                    <option value="postgres">PostgreSQL</option>
                    <option value="mysql">MySQL</option>
                    <option value="sqlite">SQLite</option>
                  </select>
                </label>
                <label>
                  Connection String:
                  <input value={connStr} onChange={e => setConnStr(e.target.value)} placeholder="e.g. mongodb://localhost:27017/db" />
                </label>
                <div className="db-dialog-actions">
                  <button onClick={handleConnectDb} disabled={!connStr}>Connect</button>
                  <button onClick={handleCloseDbDialog}>Cancel</button>
                </div>
                {dbStatus === 'connecting' && <div>Connecting...</div>}
                {dbStatus === 'error' && <div className="error">Failed to connect</div>}
              </div>
            </div>
          )}
        </div>
      );
    }
    return (
      <div className="data-content">
        <div className="table-list">
          <h5>Tables/Collections</h5>
          {tables.length === 0 ? <div>No tables found</div> : (
            <ul>
              {tables.map(t => (
                <li key={t.name} className={selectedTable === t.name ? 'active' : ''}>
                  <button onClick={() => handleSelectTable(t)}>{t.name} ({t.count})</button>
                </li>
              ))}
            </ul>
          )}
        </div>
        <div className="table-data">
          {selectedTable ? (
            loadingData ? <div>Loading...</div> : (
              <>
                <h5>Data: {selectedTable}</h5>
                {tableData.length === 0 ? <div>No data</div> : (
                  <table>
                    <thead>
                      <tr>
                        {Object.keys(tableData[0] || {}).map(col => <th key={col}>{col}</th>)}
                      </tr>
                    </thead>
                    <tbody>
                      {tableData.map((row, i) => (
                        <tr key={i}>
                          {Object.values(row).map((val, j) => <td key={j}>{String(val)}</td>)}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </>
            )
          ) : <div>Select a table to view data</div>}
        </div>
      </div>
    );
  };

  const exportLogs = (type) => {
    if (!logs || logs.length === 0) {
      showToast && showToast('No logs to export', 'warning');
      return;
    }
    let blob, filename;
    if (type === 'json') {
      blob = new Blob([JSON.stringify(logs, null, 2)], { type: 'application/json' });
      filename = 'logs.json';
    } else if (type === 'csv') {
      const header = Object.keys(logs[0]).join(',');
      const rows = logs.map(l => Object.values(l).map(v => '"' + String(v).replace(/"/g, '""') + '"').join(','));
      blob = new Blob([header + '\n' + rows.join('\n')], { type: 'text/csv' });
      filename = 'logs.csv';
    } else {
      blob = new Blob([logs.map(l => `[${l.type}] ${l.message}`).join('\n')], { type: 'text/plain' });
      filename = 'logs.txt';
    }
    saveAs(blob, filename);
    showToast && showToast('Logs exported as ' + filename, 'success');
  };

  const renderExport = () => {
    return (
      <div className="export-content">
        <div className="export-options">
          <h4>Export Logs</h4>
          <button onClick={() => exportLogs('json')}>Export as JSON</button>
          <button onClick={() => exportLogs('csv')}>Export as CSV</button>
          <button onClick={() => exportLogs('txt')}>Export as Text</button>
        </div>
      </div>
    );
  };

  if (collapsed) {
    return (
      <div className="db-viewer collapsed">
        <button onClick={() => setCollapsed(false)} className="expand-btn">
          Logs & Database ▲
        </button>
      </div>
    );
  }

  return (
    <div className="db-viewer">
      <div className="db-viewer-header">
        <div className="tabs">
          <button
            className={activeTab === 'logs' ? 'active' : ''}
            onClick={() => setActiveTab('logs')}
          >
            Logs ({logs.length})
          </button>
          <button
            className={activeTab === 'data' ? 'active' : ''}
            onClick={() => setActiveTab('data')}
          >
            Data
          </button>
          <button
            className={activeTab === 'export' ? 'active' : ''}
            onClick={() => setActiveTab('export')}
          >
            Export
          </button>
        </div>
        <button onClick={() => setCollapsed(true)} className="collapse-btn">
          ▼
        </button>
      </div>
      <div className="db-viewer-content">
        {activeTab === 'logs' && renderLogs()}
        {activeTab === 'data' && renderData()}
        {activeTab === 'export' && renderExport()}
      </div>
    </div>
  );
}

export default DatabaseViewer;
