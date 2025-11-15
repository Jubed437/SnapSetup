# SnapSetup - Production Deployment Guide

## 🚀 Quick Start for Production

### 1. Install Dependencies
```bash
npm install
```

### 2. Build the Application
```bash
npm run dist
```

This creates production-ready installers in the `release/` folder.

## 📦 What Gets Built

### Windows
- **SnapSetup Setup 1.0.0.exe** - Full installer with shortcuts
- **SnapSetup 1.0.0.exe** - Portable version (no installation)

### macOS
- **SnapSetup-1.0.0.dmg** - Drag-and-drop installer
- **SnapSetup-1.0.0-mac.zip** - Compressed archive

### Linux
- **SnapSetup-1.0.0.AppImage** - Universal portable app
- **snapsetup_1.0.0_amd64.deb** - Debian/Ubuntu package

## 🔧 Production Configuration

### Environment Variables

1. Copy `.env.example` to `.env`:
   ```bash
   cp .env.example .env
   ```

2. Add your API keys (optional):
   ```env
   GROQ_API_KEY=your_actual_key_here
   ```

**Note:** API keys are optional. The app works without them using rule-based AI.

### Security Considerations

✅ **Implemented:**
- Context isolation enabled
- Node integration disabled
- Preload script for secure IPC
- No automatic secrets upload
- Local command execution only

⚠️ **Before Release:**
- Remove or rotate any API keys in `.env`
- Never commit `.env` to version control
- Use environment-specific configs for different deployments

## 🎯 Performance Optimizations

### Already Implemented
- ✅ Window hidden until ready (no flashing)
- ✅ Dark background matching theme
- ✅ Lazy loading of components
- ✅ Optimized bundle size

### Additional Optimizations
```bash
# Analyze bundle size
npm run build -- --mode production

# Check dist folder size
du -sh dist/
```

## 📝 Pre-Release Checklist

### Code Quality
- [ ] All features tested
- [ ] No console errors
- [ ] No memory leaks
- [ ] Error handling in place

### Build
- [ ] Version updated in package.json
- [ ] Build succeeds without errors
- [ ] All assets included
- [ ] Icon files present

### Testing
- [ ] Test on clean Windows machine
- [ ] Test on clean macOS machine
- [ ] Test on clean Linux machine
- [ ] Test all core features:
  - [ ] Project upload
  - [ ] Auto setup
  - [ ] Editor integration
  - [ ] Terminal commands
  - [ ] File watching

### Documentation
- [ ] README.md updated
- [ ] CHANGELOG.md created
- [ ] LICENSE file present
- [ ] Build instructions clear

## 🔐 Code Signing (Recommended)

### Windows
```bash
# Install certificate
# Update package.json:
"win": {
  "certificateFile": "cert.pfx",
  "certificatePassword": "env:CERT_PASSWORD"
}
```

### macOS
```bash
# Sign with Apple Developer ID
"mac": {
  "identity": "Developer ID Application: Your Name (TEAM_ID)"
}
```

## 📊 Monitoring & Analytics (Optional)

Consider adding:
- Error tracking (Sentry)
- Usage analytics (Mixpanel, Amplitude)
- Crash reporting

## 🚢 Distribution Channels

### GitHub Releases
1. Create release on GitHub
2. Upload installers from `release/` folder
3. Add release notes

### Microsoft Store (Windows)
- Package as MSIX
- Submit to Partner Center

### Mac App Store
- Package with proper entitlements
- Submit via App Store Connect

### Snap Store (Linux)
```bash
snapcraft
```

## 🔄 Auto-Updates

To enable auto-updates, add to package.json:

```json
"publish": {
  "provider": "github",
  "owner": "your-username",
  "repo": "snapsetup",
  "releaseType": "release"
}
```

Then in main.js:
```javascript
const { autoUpdater } = require('electron-updater');

app.on('ready', () => {
  autoUpdater.checkForUpdatesAndNotify();
});
```

## 📈 Version Management

### Semantic Versioning
- **Major (1.x.x)**: Breaking changes
- **Minor (x.1.x)**: New features
- **Patch (x.x.1)**: Bug fixes

### Update Version
```bash
npm version patch  # 1.0.0 -> 1.0.1
npm version minor  # 1.0.0 -> 1.1.0
npm version major  # 1.0.0 -> 2.0.0
```

## 🐛 Debugging Production Issues

### Enable Logging
```javascript
// In main.js
if (!app.isPackaged) {
  mainWindow.webContents.openDevTools();
}
```

### Collect Logs
```javascript
const log = require('electron-log');
log.info('Application started');
```

## 📞 Support

### User Support
- Create GitHub Issues template
- Add FAQ section
- Provide troubleshooting guide

### Developer Support
- Document API
- Add contribution guidelines
- Set up CI/CD pipeline

## 🎉 Launch Checklist

- [ ] Final testing complete
- [ ] All platforms built
- [ ] Installers tested
- [ ] Documentation complete
- [ ] GitHub release created
- [ ] Social media announcement
- [ ] Product Hunt launch (optional)
- [ ] Monitor for issues

## 📚 Additional Resources

- [Electron Builder Docs](https://www.electron.build/)
- [Electron Security](https://www.electronjs.org/docs/latest/tutorial/security)
- [Code Signing Guide](https://www.electron.build/code-signing)

---

**Ready to ship? Run `npm run dist` and share SnapSetup with the world! 🚀**
