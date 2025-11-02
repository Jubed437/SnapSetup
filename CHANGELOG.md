# Changelog

All notable changes to the AI Codebase Setup project will be documented in this file.

## [1.0.0] - 2025-10-25

### Initial Release - MVP Complete

#### Added
- **Core Application**
  - Electron + React + Node.js architecture
  - Vite-based development environment
  - Production build configuration with electron-builder

- **User Interface**
  - VS Code-inspired dark theme layout
  - Collapsible sidebar with project explorer
  - Real-time terminal panel with streaming output
  - AI Agent panel with Actions and Chat modes
  - Database/Logs viewer with tabs
  - Status bar footer with live server info
  - Toast notification system
  - Theme toggle (dark/light)

- **Project Management**
  - Folder upload via dialog
  - Automatic project analysis
  - Technology stack detection (React, Express, Next.js, Vite, MongoDB, PostgreSQL, MySQL)
  - Project type classification (frontend, backend, fullstack)
  - File tree visualization
  - Quick actions (Open in VS Code, Cursor, file explorer)

- **Setup Automation**
  - System checks for Node.js, npm, and Docker
  - Automatic .env file generation from .env.example
  - Sequential dependency installation with per-package tracking
  - Real-time progress bar and percentage display
  - Automatic retry logic for failed installations (up to 2 retries)
  - Development server auto-start
  - Server URL detection and display

- **Terminal Integration**
  - Real-time command output streaming
  - Color-coded STDOUT and STDERR
  - Timestamp for each log entry
  - Auto-scroll with manual override indicator
  - Copy all output functionality
  - Clear terminal button
  - Collapsible command sections (UI ready)

- **AI Agent**
  - Actions mode with status display and quick buttons
  - Chat mode for conversational interaction
  - Context-aware messages during setup
  - Progress visualization
  - Dependency status list with icons
  - Smart suggestions based on project analysis

- **File Watching**
  - Continuous monitoring using chokidar
  - Detection of .env, package.json, docker-compose.yml changes
  - Toast notifications for important file modifications
  - Automatic recheck prompts

- **Docker Support**
  - Docker and Docker Compose availability detection
  - Automatic docker-compose.yml generation based on project dependencies
  - Preview and approval workflow
  - Support for MongoDB, PostgreSQL, and MySQL containers
  - Container log streaming to terminal
  - Volume configuration for data persistence

- **Logging & Persistence**
  - Structured log storage with timestamps
  - In-app logs viewer with type filtering
  - Export functionality (JSON, CSV, text - UI ready)
  - Persistent app data directory

- **Security Features**
  - No automatic external upload of sensitive files
  - Clear placeholder markers in generated .env files
  - User confirmation required for Docker Compose generation
  - Secure IPC communication
  - Sandboxed renderer process

#### Technical Details
- **Dependencies**
  - electron ^28.1.0
  - react ^18.2.0
  - vite ^5.0.8
  - chokidar ^3.5.3
  - better-sqlite3 ^9.2.2 (prepared for future use)
  - marked ^9.1.6 (prepared for future use)

- **Development Tools**
  - Vite for fast HMR
  - Concurrent dev server + Electron
  - DevTools auto-open in development
  - ESLint configuration

#### Known Issues
- Database viewer connection logic is placeholder (UI complete)
- Manual retry button needs full implementation (auto-retry works)
- Export logs button needs file system integration (UI ready)
- AI Chat mode needs LLM integration for intelligent responses

#### Documentation
- Comprehensive README.md with features and usage
- DEVELOPMENT.md with architecture and debugging guide
- QUICKSTART.md for 5-minute setup
- PROJECT_SUMMARY.md with complete feature overview

---

## [Unreleased]

### Planned for v1.1.0
- [ ] Full database viewer implementation with real connections
- [ ] Manual retry button for failed dependency installations
- [ ] Complete log export functionality (save to disk)
- [ ] Enhanced port detection from server logs
- [ ] Keyboard shortcuts implementation

### Planned for v1.2.0
- [ ] Local LLM integration (Ollama/LM Studio)
- [ ] Git integration (clone, status, basic operations)
- [ ] Advanced terminal features (input mode, multiple tabs)
- [ ] Project templates library

### Planned for v2.0.0
- [ ] Code generation capabilities
- [ ] Multi-workspace support
- [ ] Plugin/extension system
- [ ] Cloud settings sync

---

## Version History Format

### [Version] - YYYY-MM-DD

#### Added
- New features

#### Changed
- Changes to existing functionality

#### Deprecated
- Features that will be removed

#### Removed
- Removed features

#### Fixed
- Bug fixes

#### Security
- Security improvements

---

**Semantic Versioning**: This project follows [Semantic Versioning](https://semver.org/)
- **MAJOR**: Incompatible API changes
- **MINOR**: Backwards-compatible functionality additions
- **PATCH**: Backwards-compatible bug fixes
