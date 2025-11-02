import { useEffect } from 'react';
import { useProject } from '../context/ProjectContext';

export function useFileWatcher() {
  const { projectPath, showToast, addLog } = useProject();

  useEffect(() => {
    if (!projectPath || !window.electronAPI) return;

    // Start watching
    const startWatching = async () => {
      const result = await window.electronAPI.watchFiles(projectPath, [
        '.env',
        '.env.example',
        'package.json',
        'docker-compose.yml',
      ]);

      if (result.success) {
        addLog({
          type: 'info',
          message: 'File watcher started - monitoring for external changes',
        });
      }
    };

    // Set up file change listener
    const handleFileChange = (data) => {
      const fileName = data.path.split(/[\\/]/).pop();
      
      // Important files that require notification
      const importantFiles = ['.env', 'package.json', 'docker-compose.yml'];
      
      if (importantFiles.some(f => fileName === f)) {
        showToast(`${fileName} was ${data.event}d - you may want to recheck setup`, 'info');
        addLog({
          type: 'info',
          message: `External change detected: ${fileName} was ${data.event}d`,
        });
      }
    };

    window.electronAPI.onFileChanged(handleFileChange);
    startWatching();

    // Cleanup
    return () => {
      window.electronAPI.stopWatching();
      window.electronAPI.removeListener('file-changed');
    };
  }, [projectPath]);
}
