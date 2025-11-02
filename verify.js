// Quick verification script
const fs = require('fs');
const path = require('path');

console.log('🔍 Verifying SnapSetup Project...\n');

const checks = {
  'package.json': fs.existsSync('package.json'),
  'electron/main.js': fs.existsSync('electron/main.js'),
  'electron/preload.js': fs.existsSync('electron/preload.js'),
  'src/main.jsx': fs.existsSync('src/main.jsx'),
  'src/App.jsx': fs.existsSync('src/App.jsx'),
  'src/components/': fs.existsSync('src/components'),
  'vite.config.js': fs.existsSync('vite.config.js'),
  'node_modules/': fs.existsSync('node_modules') && fs.readdirSync('node_modules').length > 0,
  'dist/': fs.existsSync('dist'),
};

let passed = 0;
let failed = 0;

for (const [file, exists] of Object.entries(checks)) {
  if (exists) {
    console.log(`✅ ${file}`);
    passed++;
  } else {
    console.log(`❌ ${file}`);
    failed++;
  }
}

console.log(`\n📊 Results: ${passed} passed, ${failed} failed`);

if (failed === 0) {
  console.log('\n✨ Project structure is perfect!');
  console.log('\nNext steps:');
  console.log('  npm run dev          - Start development mode');
  console.log('  npm run build        - Build React app');
  console.log('  npm run build:electron - Build Electron app');
} else {
  console.log('\n⚠️  Some files are missing. Please check the errors above.');
}
