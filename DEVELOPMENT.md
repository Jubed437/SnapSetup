# Development Guide

## Getting Started

### Prerequisites
- Node.js v16 or higher
- npm v8 or higher
- Git

### Installation

```bash
# Clone or navigate to the project directory
cd ai-codebase-setup

# Install dependencies
npm install

# Start development server
npm run dev
```

The application will start in development mode with:
- Vite dev server running on `http://localhost:5173`
- Electron window opening automatically
- Hot reload enabled for React components
- DevTools opened by default

## Project Structure

```
ai-codebase-setup/
├── electron/                 # Electron main process
│   ├── main.js              # Main process entry point
│   └── preload.js           # Preload script for IPC
│
├── src/                     # React renderer process
│   ├── components/          # React components
│   │   ├── Header.jsx       # Top navigation bar
│   │   ├── Sidebar.jsx      # Project explorer
│   │   ├── Terminal.jsx     # Terminal output
│   │   ├── AIAgent.jsx      # AI agent panel
│   │   ├── DatabaseViewer.jsx # DB viewer & logs
│   │   ├── Footer.jsx       # Status bar
│   │   └── Toast.jsx        # Notifications
│   │
│   ├── context/             # State management
│   │   └── ProjectContext.jsx # Global app state
│   │
│   ├── hooks/               # Custom React hooks
│   │   └── useFileWatcher.js # File watching hook
│   │
│   ├── utils/               # Utility modules
│   │   ├── SetupManager.js  # Main setup orchestrator
│   │   ├── DependencyInstaller.js # Dependency installer
│   │   └── DatabaseConnector.js # DB connector
│   │
│   ├── App.jsx              # Root component
│   ├── main.jsx             # React entry point
│   └── index.css            # Global styles
│
├── package.json             # Dependencies and scripts
├── vite.config.js           # Vite configuration
├── electron-builder.json    # Build configuration
└── README.md                # User documentation
```

## Key Components

### Electron Main Process (`electron/main.js`)

Handles:
- Window management
- File system operations (read, write, watch)
- Process spawning (npm install, docker-compose, etc.)
- IPC communication with renderer
- System-level operations

Key IPC handlers:
- `select-folder`: Open folder selection dialog
- `read-file`: Read file contents
- `read-directory`: List directory contents
- `run-command`: Execute shell commands with streaming output
- `watch-files`: Start file watcher
- `open-external`: Open URLs in browser

### React Renderer Process

#### ProjectContext (`src/context/ProjectContext.jsx`)
Central state management for:
- Project information and path
- Dependencies list with status
- Installation progress
- Terminal output
- Logs and toasts
- System checks (Node, Docker)

#### SetupManager (`src/utils/SetupManager.js`)
Orchestrates the setup process:
- System checks (Node.js, npm, Docker)
- Environment file handling
- Dependency installation
- Project startup
- Docker Compose generation and execution

#### DependencyInstaller (`src/utils/DependencyInstaller.js`)
Handles package installation:
- Sequential installation with progress tracking
- Automatic retry on failure
- Per-package status updates
- Support for npm install and npm ci

## Development Workflow

### Adding a New Feature

1. **Plan the feature**: Identify which components/utilities need changes

2. **Update state if needed**: Modify `ProjectContext.jsx` to add new state

3. **Implement backend logic**: Add IPC handlers to `electron/main.js` if file system or process operations are needed

4. **Create/update UI components**: Build or modify React components

5. **Test thoroughly**: Test the feature with real projects

### Running Commands

The app uses Node.js `child_process.spawn()` to run commands. Example:

```javascript
const result = await window.electronAPI.runCommand(
  'npm',              // command
  ['install'],        // args
  '/path/to/project', // cwd
  'unique-id'         // process ID
);
```

Output is streamed via IPC events:
- `command-output`: stdout/stderr data
- `command-complete`: process exited
- `command-error`: process error

### File Watching

File watching uses `chokidar` to monitor changes:

```javascript
// Start watching
await window.electronAPI.watchFiles(projectPath, patterns);

// Listen for changes
window.electronAPI.onFileChanged((data) => {
  console.log(`File ${data.path} was ${data.event}d`);
});

// Stop watching
await window.electronAPI.stopWatching();
```

## Testing

### Manual Testing Checklist

#### Basic Functionality
- [ ] Upload a project folder
- [ ] View project analysis in sidebar
- [ ] See file tree in sidebar
- [ ] Check system requirements detection

#### Setup Process
- [ ] Click "Start Auto Setup"
- [ ] Verify Node.js check works
- [ ] See .env file creation if needed
- [ ] Watch dependency installation progress
- [ ] View terminal output in real-time
- [ ] See progress percentage update

#### File Watching
- [ ] Edit .env file externally
- [ ] See notification for file change
- [ ] Edit package.json externally
- [ ] Verify recheck prompt appears

#### AI Agent
- [ ] View actions panel
- [ ] See setup status updates
- [ ] Switch to chat mode
- [ ] Send messages to agent

#### Docker Support
- [ ] Test with project that has docker-compose.yml
- [ ] Generate docker-compose.yml for project without one
- [ ] Verify preview and approval flow
- [ ] Run docker-compose up

#### UI/UX
- [ ] Collapse/expand sidebar
- [ ] Collapse/expand database viewer
- [ ] Scroll terminal output
- [ ] See auto-scroll indicator
- [ ] Clear terminal
- [ ] Copy terminal output
- [ ] View logs in database viewer tab
- [ ] See toast notifications

### Test Projects

Create test projects with different configurations:

**Simple React App**
```bash
npx create-react-app test-react-app
# Upload this folder to test React detection
```

**Express Backend**
```bash
mkdir test-express && cd test-express
npm init -y
npm install express
# Add index.js with simple Express server
```

**Full Stack (React + Express)**
- Frontend in `/client` folder
- Backend in root
- Separate package.json files

**With Docker**
- Include docker-compose.yml
- Test both MongoDB and PostgreSQL

**With .env Requirements**
- Create .env.example
- Test placeholder generation

## Building for Production

### Development Build
```bash
npm run build        # Build React app
```

### Electron Build
```bash
npm run build:electron   # Build for current platform
```

Output in `dist-electron/` folder:
- **Windows**: `.exe` installer and portable
- **macOS**: `.dmg` and `.zip`
- **Linux**: `.AppImage` and `.deb`

## Debugging

### Renderer Process (React)
- Press `Ctrl+Shift+I` (or `Cmd+Option+I` on Mac) to open DevTools
- Use React Developer Tools extension
- Check console for errors

### Main Process (Electron)
Add `console.log()` statements in `electron/main.js`:
```javascript
console.log('Main process log:', data);
```

View logs in terminal where you ran `npm run dev`

### IPC Communication
Debug IPC by logging in both processes:

**Main process:**
```javascript
ipcMain.handle('my-handler', async (event, data) => {
  console.log('[MAIN] Received:', data);
  return { result: 'success' };
});
```

**Renderer process:**
```javascript
const result = await window.electronAPI.myHandler(data);
console.log('[RENDERER] Result:', result);
```

## Common Issues

### Port Already in Use
If Vite port 5173 is in use:
1. Change port in `vite.config.js`
2. Update port in `electron/main.js` loadURL

### Node.js Not Detected
- Ensure Node.js is in PATH
- Restart terminal/IDE after Node.js installation
- Test with `node -v` in terminal

### Electron Window Not Opening
- Check terminal for errors
- Ensure Vite dev server started first
- Wait for "ready to use" message

### Dependencies Not Installing
- Check internet connection
- Verify npm registry is accessible
- Check terminal output for specific errors

## Performance Optimization

### Reduce Bundle Size
- Use dynamic imports for large components
- Lazy load routes if implementing routing
- Tree-shake unused dependencies

### Improve Startup Time
- Minimize operations in main process startup
- Use lazy initialization for heavy modules
- Cache project analysis results

### Memory Management
- Clean up event listeners on unmount
- Stop file watchers when not needed
- Limit terminal output history

## Security Considerations

### .env File Handling
- Never automatically upload .env contents
- Mark placeholders clearly
- Warn users about sensitive data

### Command Execution
- Validate user input before running commands
- Use `shell: true` carefully
- Sanitize file paths

### External URLs
- Use `openExternal()` for browser URLs
- Don't load untrusted content in webview

## Future Enhancements

### Planned Features
- [ ] Local LLM integration for AI agent
- [ ] Database schema visualization
- [ ] Git integration (clone, status, commit)
- [ ] Code generation capabilities
- [ ] Multi-project workspace support
- [ ] Custom setup templates
- [ ] Plugin/extension system
- [ ] Advanced terminal (input mode, multiple tabs)
- [ ] Real-time collaboration features

### Technical Improvements
- [ ] Add unit tests (Jest + React Testing Library)
- [ ] Add E2E tests (Playwright)
- [ ] Implement error boundaries
- [ ] Add performance monitoring
- [ ] Improve accessibility (ARIA labels, keyboard navigation)
- [ ] Add internationalization (i18n)

## Contributing

### Code Style
- Use functional components with hooks
- Follow existing naming conventions
- Add comments for complex logic
- Keep files under 500 lines

### Commit Messages
- Use conventional commits format
- Examples:
  - `feat: add Docker Compose generation`
  - `fix: resolve terminal scrolling issue`
  - `docs: update development guide`

### Pull Request Process
1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit PR with description

## Resources

- [Electron Documentation](https://www.electronjs.org/docs)
- [React Documentation](https://react.dev/)
- [Vite Documentation](https://vitejs.dev/)
- [Node.js API](https://nodejs.org/api/)
- [Chokidar (File Watching)](https://github.com/paulmillr/chokidar)
