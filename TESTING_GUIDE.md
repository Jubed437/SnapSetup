# Testing Guide

Comprehensive testing scenarios for AI Codebase Setup application.

## Prerequisites for Testing

- Node.js v16+ installed
- npm v8+ installed
- (Optional) Docker Desktop for Docker features
- (Optional) VS Code or Cursor for editor integration
- Sample projects for testing

## Test Environment Setup

### 1. Install the Application
```bash
cd ai-codebase-setup
npm install
npm run dev
```

Wait for the Electron window to open automatically.

### 2. Create Test Projects

#### Test Project 1: Simple React App
```bash
cd ..
npx create-react-app test-react-simple
cd test-react-simple
```

#### Test Project 2: Express Backend
```bash
cd ..
mkdir test-express-api
cd test-express-api
npm init -y
npm install express cors dotenv
echo "PORT=5000" > .env.example
```

Create `index.js`:
```javascript
const express = require('express');
const app = express();
const port = process.env.PORT || 5000;

app.get('/', (req, res) => {
  res.json({ message: 'Hello World!' });
});

app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});
```

Update `package.json` scripts:
```json
{
  "scripts": {
    "start": "node index.js",
    "dev": "node index.js"
  }
}
```

#### Test Project 3: Full Stack
```bash
cd ..
mkdir test-fullstack
cd test-fullstack
npm init -y
npm install express mongoose dotenv
mkdir client
cd client
npx create-react-app .
cd ..
```

## Test Scenarios

### Scenario 1: Basic Project Upload

**Steps:**
1. Click "Upload Project" in header
2. Select `test-react-simple` folder
3. Wait 2-3 seconds

**Expected Results:**
- ✅ Sidebar shows project name
- ✅ Project type: "frontend"
- ✅ Stack: "React"
- ✅ Port: 3000
- ✅ File tree appears
- ✅ AI Agent shows greeting message
- ✅ Toast: "Project loaded successfully"

**Pass Criteria:** All expected results visible

---

### Scenario 2: System Checks

**Steps:**
1. Upload any project
2. Click "Start Auto Setup"
3. Watch AI Agent panel

**Expected Results:**
- ✅ Message: "Checking system requirements..."
- ✅ Node.js version detected and displayed
- ✅ Footer shows "Node: v18.x.x" (or your version)
- ✅ If Node missing: Error message with link to nodejs.org

**Pass Criteria:** System checks complete, Node version shown

---

### Scenario 3: .env File Handling

**Test 3A: .env.example exists, .env missing**

**Steps:**
1. Upload `test-express-api` project (has .env.example)
2. Delete .env if it exists
3. Click "Start Auto Setup"

**Expected Results:**
- ✅ Message: ".env file created with placeholders"
- ✅ Toast notification: ".env file created"
- ✅ New .env file in project folder
- ✅ Contents: `PORT=PLACEHOLDER_PORT`

**Test 3B: No .env files exist**

**Steps:**
1. Create project without any .env files
2. Upload and start setup

**Expected Results:**
- ✅ Minimal .env created with comments
- ✅ Setup continues normally

**Pass Criteria:** .env files handled appropriately

---

### Scenario 4: Dependency Installation

**Steps:**
1. Upload `test-express-api`
2. Click "Start Auto Setup"
3. Monitor terminal and AI Agent

**Expected Results:**
- ✅ Terminal shows: "Installing express..."
- ✅ Progress bar updates in real-time
- ✅ Percentage shown: "Installing Dependencies — 33% (1/3)"
- ✅ Dependency list shows status icons:
  - ⏳ Pending
  - ⚙️ Installing
  - ✅ Installed
- ✅ Terminal timestamps visible
- ✅ Log entries created
- ✅ Toast: "Setup completed successfully"

**Pass Criteria:** All dependencies install with progress updates

---

### Scenario 5: Terminal Functionality

**Test 5A: Output Streaming**

**Steps:**
1. Start any setup
2. Watch terminal panel

**Expected Results:**
- ✅ Output appears in real-time (no delay)
- ✅ STDOUT in normal color
- ✅ STDERR in red
- ✅ Timestamps for each line
- ✅ Auto-scroll to bottom

**Test 5B: Terminal Controls**

**Steps:**
1. Let terminal fill with output
2. Scroll up manually
3. Click "Copy" button
4. Click "Clear" button

**Expected Results:**
- ✅ Auto-scroll stops when user scrolls up
- ✅ "Scroll to bottom" button appears
- ✅ Copy button copies all output to clipboard
- ✅ Clear button removes all output

**Pass Criteria:** All terminal features work

---

### Scenario 6: File Watching

**Steps:**
1. Upload and complete setup
2. Open project folder in external editor
3. Edit .env file (change a value)
4. Save the file

**Expected Results:**
- ✅ Toast notification: ".env was changed - you may want to recheck setup"
- ✅ Log entry created for file change

**Steps (continue):**
5. Edit package.json
6. Save the file

**Expected Results:**
- ✅ Toast notification about package.json change
- ✅ Log entry created

**Pass Criteria:** File changes detected and notified

---

### Scenario 7: Docker Compose Detection

**Test 7A: Existing docker-compose.yml**

**Steps:**
1. Create docker-compose.yml in test project
2. Upload project
3. Check sidebar

**Expected Results:**
- ✅ Sidebar shows: "Docker: ✅ Found"
- ✅ AI Agent offers to run docker-compose

**Test 7B: Generate docker-compose.yml**

**Steps:**
1. Upload project without docker-compose.yml
2. Click "Generate docker-compose.yml" in AI Agent

**Expected Results:**
- ✅ AI Agent shows: "Generating docker-compose.yml..."
- ✅ Preview appears (or success message)
- ✅ File saved to project root
- ✅ Toast: "Docker compose file generated"

**Pass Criteria:** Docker Compose detected and generated

---

### Scenario 8: Server Startup

**Steps:**
1. Upload and setup React app
2. Wait for setup to complete

**Expected Results:**
- ✅ Terminal shows: "Compiled successfully!" or similar
- ✅ Footer shows: "Frontend: http://localhost:3000"
- ✅ URL is clickable
- ✅ Clicking opens browser
- ✅ App loads in browser

**Pass Criteria:** Server starts and URL works

---

### Scenario 9: AI Agent Modes

**Test 9A: Actions Mode**

**Steps:**
1. Upload project
2. View AI Agent panel (Actions mode by default)

**Expected Results:**
- ✅ Setup Status section visible
- ✅ Actions section with buttons
- ✅ Dependencies list visible
- ✅ All UI elements responsive

**Test 9B: Chat Mode**

**Steps:**
1. Click "Chat" button in AI Agent
2. Type a message
3. Click "Send"

**Expected Results:**
- ✅ Mode switches to chat interface
- ✅ Message appears in chat
- ✅ Agent responds (placeholder response for now)
- ✅ Timestamps visible

**Pass Criteria:** Both modes functional

---

### Scenario 10: Sidebar Features

**Test 10A: Collapse/Expand**

**Steps:**
1. Click collapse button (◀) in sidebar
2. Click expand button (▶)

**Expected Results:**
- ✅ Sidebar collapses to narrow strip
- ✅ Main area expands
- ✅ Sidebar expands back with all content

**Test 10B: Quick Actions**

**Steps:**
1. Click "Open in VS Code"
2. Click "Open in Cursor"
3. Click "Open Data Folder"

**Expected Results:**
- ✅ VS Code opens (if installed)
- ✅ Cursor opens (if installed)
- ✅ File explorer opens to project folder
- ✅ Toast warnings if editors not installed

**Pass Criteria:** Sidebar features work

---

### Scenario 11: Logs Viewer

**Steps:**
1. Complete a setup
2. Click bottom bar to expand Database Viewer
3. Click "Logs" tab

**Expected Results:**
- ✅ All log entries visible
- ✅ Color-coded by type (info, success, error, warning)
- ✅ Timestamps shown
- ✅ Scrollable list
- ✅ Latest logs at bottom

**Pass Criteria:** Logs displayed correctly

---

### Scenario 12: Error Handling

**Test 12A: Node.js Not Installed (Simulated)**

**Expected Results:**
- ✅ Clear error message
- ✅ Link to nodejs.org
- ✅ Setup pauses
- ✅ No crash

**Test 12B: Installation Failure**

**Steps:**
1. Disconnect internet
2. Try to install dependencies

**Expected Results:**
- ✅ Error shown in terminal
- ✅ Failed packages marked with ❌
- ✅ Error logged
- ✅ Toast notification
- ✅ App remains functional

**Test 12C: Port Already in Use**

**Steps:**
1. Start a server on port 3000 manually
2. Try to setup React app

**Expected Results:**
- ✅ Error shown in terminal
- ✅ EADDRINUSE detected
- ✅ Suggestion to kill process

**Pass Criteria:** All errors handled gracefully

---

### Scenario 13: Toast Notifications

**Expected Toasts During Setup:**
- ✅ "Project loaded successfully" (green)
- ✅ ".env file created with placeholders" (yellow)
- ✅ "Setup completed successfully" (green)
- ✅ "File changed detected" (blue)
- ✅ Error toasts (red) when failures occur

**Toast Features:**
- ✅ Auto-dismiss after 5 seconds
- ✅ Manual close button (×)
- ✅ Stacks when multiple toasts
- ✅ Slide-in animation

**Pass Criteria:** Toasts appear and dismiss correctly

---

### Scenario 14: Theme Toggle

**Steps:**
1. Click theme toggle button (☀️/🌙) in header
2. Switch between dark and light

**Expected Results:**
- ✅ Theme changes immediately
- ✅ All components update colors
- ✅ Text remains readable
- ✅ No flash or glitch

**Pass Criteria:** Theme toggle works smoothly

---

### Scenario 15: Performance

**Metrics to Check:**
- ✅ App starts in < 3 seconds
- ✅ Project analysis completes in < 2 seconds
- ✅ Terminal output has no visible lag
- ✅ UI remains responsive during installation
- ✅ Memory usage < 200MB idle

**Tools:**
- Task Manager / Activity Monitor for memory
- DevTools Performance tab
- Stopwatch for timing

**Pass Criteria:** All performance metrics met

---

## Regression Testing Checklist

After any code changes, verify:

- [ ] App starts without errors
- [ ] Project upload works
- [ ] Analysis displays correctly
- [ ] System checks pass
- [ ] Dependencies install with progress
- [ ] Terminal shows output
- [ ] File watcher detects changes
- [ ] Docker features work
- [ ] Logs are recorded
- [ ] UI is responsive
- [ ] No console errors
- [ ] No memory leaks

## Bug Reporting Template

When you find a bug, report it with:

```markdown
**Title:** Brief description

**Steps to Reproduce:**
1. Step one
2. Step two
3. Step three

**Expected Behavior:**
What should happen

**Actual Behavior:**
What actually happened

**Environment:**
- OS: Windows 11 / macOS 14 / Ubuntu 22.04
- Node.js version: 18.x.x
- App version: 1.0.0

**Screenshots:**
(if applicable)

**Console Errors:**
(if any)
```

## Test Results Log

Create a test log:

```
Date: 2025-10-25
Tester: [Your Name]
Version: 1.0.0

Scenario 1: ✅ PASS
Scenario 2: ✅ PASS
Scenario 3: ❌ FAIL - .env not created
...

Notes:
- Issue with .env generation on Windows
- Need to investigate file permissions
```

---

## Automated Testing (Future)

### Unit Tests (Planned)
- Component rendering
- Context state management
- Utility functions

### Integration Tests (Planned)
- IPC communication
- File operations
- Process spawning

### E2E Tests (Planned)
- Full setup workflow
- UI interactions
- Error scenarios

---

**Testing Complete When:**
- ✅ All 15 scenarios pass
- ✅ No critical bugs found
- ✅ Performance metrics met
- ✅ Documentation is accurate
