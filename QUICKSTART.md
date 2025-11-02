# Quick Start Guide

Get the SnapSetup application running in 5 minutes!

## Step 1: Install Dependencies

```bash
npm install
```

This will install all required packages including Electron, React, Vite, and utilities.

## Step 2: Start the Application

```bash
npm run dev
```

This command starts:
- Vite development server (React UI)
- Electron application window

The app will open automatically. If not, wait a few seconds for Vite to start.

## Step 3: Upload a Project

1. Click **"Upload Project"** in the top header
2. Select a JavaScript/Node.js project folder
3. Wait for analysis to complete (2-3 seconds)

### What Gets Analyzed?
- Project type (React, Express, Next.js, etc.)
- Technology stack
- Dependencies from package.json
- Ports used
- Docker Compose presence
- Environment files (.env)

## Step 4: Review Project Info

Check the **left sidebar** to see:
- ✅ Project name and type
- 📦 Technology stack
- 🔌 Detected ports
- 🐳 Docker status
- 🔐 Environment file status
- 📁 File tree

## Step 5: Start Auto Setup

1. Look at the **AI Agent panel** (right side)
2. Click **"Start Auto Setup"** button
3. Watch the process:
   - ✓ System checks (Node.js, npm, Docker)
   - ✓ Environment file creation
   - ✓ Dependency installation with progress
   - ✓ Development server startup

### What You'll See
- **Terminal Panel** (left): Real-time command output
- **AI Agent Panel** (right): Progress and status
- **Progress Bar**: Installation percentage
- **Footer**: Server URLs when ready

## Step 6: Monitor Progress

Watch the installation in real-time:

**Terminal Output:**
```
[14:32:15] Installing express (1 of 18) — 5% complete
[14:32:18] ✓ Installed express
[14:32:18] Installing mongoose (2 of 18) — 11% complete
```

**Progress Indicator:**
```
Installing Dependencies — 45% (9/20)
```

## Step 7: Access Your App

When setup completes:

1. **Frontend URL** appears in the footer (if detected)
   - Example: `Frontend: http://localhost:3000`
   - Click to open in browser

2. **Backend Status** shown in footer
   - `Backend: running on port 5000`

## Common Workflows

### Scenario 1: React Frontend Only

```
Upload project → Start Auto Setup → Wait for install → 
Click frontend URL in footer → App opens in browser
```

### Scenario 2: Full Stack (React + Express)

```
Upload project → Start Auto Setup → Wait for install →
Both frontend and backend start → Access both URLs
```

### Scenario 3: With Docker Compose

If project has `docker-compose.yml`:
```
Upload project → Detects Docker Compose → Runs containers →
Streams container logs to terminal
```

If project needs Docker Compose:
```
Upload project → Click "Generate docker-compose.yml" →
Review preview → Approve → File saved → Containers start
```

### Scenario 4: Missing .env File

```
Upload project → Start Auto Setup → .env created from .env.example →
Notification: "Placeholders generated" → 
Edit .env with real values → Recheck
```

## Keyboard Shortcuts

- `Ctrl+P` - Quick file open (planned)
- `Ctrl+Shift+T` - Toggle terminal focus
- `Ctrl+Shift+A` - Open AI Agent panel
- `Ctrl+R` - Re-run setup / Recheck
- `Ctrl+L` - Open Logs tab

## Tips & Tricks

### 💡 Tip 1: Watch File Changes
The app monitors your project folder. If you edit `.env` or `package.json` externally, you'll get a notification to recheck.

### 💡 Tip 2: View Logs
Click the **"Logs" tab** at the bottom to see:
- All commands executed
- Timestamps
- Success/error status
- Export logs as JSON/CSV

### 💡 Tip 3: Retry Failed Installations
If some packages fail:
1. Click **"Retry Failed"** in AI Agent
2. Or check terminal for specific errors
3. Install build tools if needed (Python, node-gyp)

### 💡 Tip 4: Chat with Agent
Switch to **"Chat" mode** in AI Agent to:
- Ask questions about your setup
- Request specific actions
- Get help troubleshooting

### 💡 Tip 5: Open in Editor
Quick buttons in sidebar:
- **Open in VS Code** - Opens project in VS Code
- **Open in Cursor** - Opens project in Cursor
- **Open Data Folder** - Opens project in file explorer

## Troubleshooting

### ❌ "Node.js not found"
**Solution:** 
1. Install Node.js from https://nodejs.org/
2. Choose LTS version (recommended)
3. Restart the app
4. Click "Start Auto Setup" again

### ❌ "Port already in use"
**Solution:**
1. Check terminal for port number
2. Kill process using that port:
   - Windows: `netstat -ano | findstr :3000` then `taskkill /PID <PID> /F`
   - Mac/Linux: `lsof -ti:3000 | xargs kill`
3. Retry setup

### ❌ Installation fails for specific package (e.g., bcrypt)
**Solution:**
```bash
# Windows: Install Visual Studio Build Tools
npm install --global windows-build-tools

# Mac: Install Xcode Command Line Tools
xcode-select --install

# Linux: Install build essentials
sudo apt-get install build-essential
```

### ❌ Docker Compose not working
**Solution:**
1. Install Docker Desktop
2. Start Docker Desktop
3. Restart the app
4. Try again

### ❌ Terminal not showing output
**Solution:**
1. Check if command is still running
2. Scroll to bottom of terminal
3. Click "Clear terminal" and retry
4. Check main process logs in your IDE terminal

## Example Projects to Test

### Test 1: Simple React App
```bash
npx create-react-app test-app
cd test-app
# Upload this folder in the app
```

### Test 2: Express API
```bash
mkdir test-api && cd test-api
npm init -y
npm install express cors dotenv
# Create index.js with Express server
# Upload this folder
```

### Test 3: Next.js App
```bash
npx create-next-app test-nextjs
cd test-nextjs
# Upload this folder
```

## What's Next?

After successful setup:

1. **Develop Your App**
   - Edit code in your preferred editor
   - Hot reload works automatically
   - Terminal shows live logs

2. **Monitor Your App**
   - Check terminal for errors
   - View server status in footer
   - Use database viewer (if DB connected)

3. **Deploy Your App**
   - Docker Compose ready for deployment
   - Environment variables configured
   - All dependencies installed

## Need Help?

- 📖 Read the full [README.md](README.md)
- 🔧 Check [DEVELOPMENT.md](DEVELOPMENT.md) for advanced topics
- 💬 Switch to Chat mode in AI Agent
- 🐛 Check terminal logs for errors
- 📊 View setup logs in Logs tab

## Video Walkthrough

(Coming soon: Link to video tutorial)

## Community

- GitHub Issues: Report bugs
- Discussions: Ask questions
- Pull Requests: Contribute features

---

**You're all set! 🚀**

Start uploading your projects and let the AI handle the setup automatically.
