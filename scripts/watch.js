/**
 * scripts/watch.js
 * Watches modules/ and index.template.html for changes and automatically rebuilds index.html
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const rootDir = path.resolve(__dirname, '..');
const modulesDir = path.join(rootDir, 'modules');
const templatePath = path.join(rootDir, 'index.template.html');

console.log('👀 Watching modules/ and index.template.html for edits...');

let timeout = null;
function triggerBuild(event, filename) {
  if (timeout) clearTimeout(timeout);
  timeout = setTimeout(() => {
    try {
      console.log(`[Change detected: ${filename || 'file'}] Rebuilding index.html...`);
      execSync('node scripts/build.js', { cwd: rootDir, stdio: 'inherit' });
    } catch (e) {
      console.error('Build error:', e.message);
    }
  }, 100);
}

if (fs.existsSync(modulesDir)) {
  fs.watch(modulesDir, { recursive: true }, triggerBuild);
}

if (fs.existsSync(templatePath)) {
  fs.watch(templatePath, triggerBuild);
}
