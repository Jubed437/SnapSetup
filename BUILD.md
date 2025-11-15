# SnapSetup - Production Build Guide

## Prerequisites

Before building for production, ensure you have:
- Node.js v16 or higher
- npm v8 or higher
- All dependencies installed: `npm install`

## Build Commands

### Build for All Platforms
```bash
npm run dist
```

### Build for Specific Platform

**Windows:**
```bash
npm run dist:win
```
Creates:
- `release/SnapSetup Setup 1.0.0.exe` (Installer)
- `release/SnapSetup 1.0.0.exe` (Portable)

**macOS:**
```bash
npm run dist:mac
```
Creates:
- `release/SnapSetup-1.0.0.dmg` (Installer)
- `release/SnapSetup-1.0.0-mac.zip` (Archive)

**Linux:**
```bash
npm run dist:linux
```
Creates:
- `release/SnapSetup-1.0.0.AppImage` (Portable)
- `release/snapsetup_1.0.0_amd64.deb` (Debian package)

## Pre-Build Checklist

1. **Update Version**
   - Edit `package.json` and update `version` field

2. **Test Application**
   ```bash
   npm start
   ```
   - Upload a project
   - Test auto setup
   - Test editor integration
   - Test terminal commands

3. **Build React App**
   ```bash
   npm run build
   ```
   - Verify `dist/` folder is created
   - Check for build errors

4. **Clean Previous Builds**
   ```bash
   # Windows
   rmdir /s /q release
   
   # macOS/Linux
   rm -rf release
   ```

## Build Process

The build process:
1. Runs `vite build` to compile React app → `dist/`
2. Packages Electron app with `electron-builder`
3. Creates installers in `release/` folder

## Distribution

### Windows
- **Installer (NSIS)**: Full installation with shortcuts
- **Portable**: Single .exe file, no installation needed

### macOS
- **DMG**: Drag-and-drop installer
- **ZIP**: Archive for manual installation

### Linux
- **AppImage**: Universal portable format
- **DEB**: Debian/Ubuntu package

## Code Signing (Optional)

For production releases, consider code signing:

**Windows:**
```json
"win": {
  "certificateFile": "path/to/cert.pfx",
  "certificatePassword": "password"
}
```

**macOS:**
```json
"mac": {
  "identity": "Developer ID Application: Your Name"
}
```

## Auto-Update (Future Enhancement)

To enable auto-updates, add to `package.json`:
```json
"publish": {
  "provider": "github",
  "owner": "your-username",
  "repo": "snapsetup"
}
```

## Troubleshooting

### Build Fails
- Clear node_modules: `rm -rf node_modules && npm install`
- Clear cache: `npm cache clean --force`
- Update electron-builder: `npm install electron-builder@latest`

### Large Bundle Size
- Check `dist/` folder size
- Optimize images and assets
- Remove unused dependencies

### Missing Dependencies
- Ensure all runtime dependencies are in `dependencies`, not `devDependencies`
- Check `files` array in `build` config includes all necessary files

## File Structure After Build

```
release/
├── SnapSetup Setup 1.0.0.exe      # Windows installer
├── SnapSetup 1.0.0.exe            # Windows portable
├── SnapSetup-1.0.0.dmg            # macOS installer
├── SnapSetup-1.0.0-mac.zip        # macOS archive
├── SnapSetup-1.0.0.AppImage       # Linux portable
└── snapsetup_1.0.0_amd64.deb      # Linux package
```

## Release Checklist

- [ ] Update version in package.json
- [ ] Test all features
- [ ] Build for target platforms
- [ ] Test installers on clean machines
- [ ] Create release notes
- [ ] Tag release in git
- [ ] Upload to distribution platform

## Support

For issues or questions:
- GitHub Issues: https://github.com/your-username/snapsetup/issues
- Documentation: README.md
