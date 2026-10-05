const fs = require('fs');
const path = require('path');

const rootDir = path.resolve(__dirname, '..');
const html = fs.readFileSync(path.join(rootDir, 'index.html'), 'utf8');

const modules = [
  {
    name: 'landing',
    file: 'modules/landing/landing.html',
    start: '<!-- ==================== PUBLIC LANDING PAGE ==================== -->',
    end: '<div class="app">'
  },
  {
    name: 'sidebar',
    file: 'modules/sidebar/sidebar.html',
    start: '<!-- ==================== SIDEBAR ==================== -->',
    end: '<div class="main">'
  },
  {
    name: 'topbar',
    file: 'modules/topbar/topbar.html',
    start: '<!-- ---------- TOP HEADER ---------- -->',
    end: '<!-- ---------- CONTENT ---------- -->'
  },
  {
    name: 'dashboard',
    file: 'modules/dashboard/dashboard.html',
    start: '<!-- ==================== DASHBOARD ==================== -->',
    end: '<!-- ==================== TRANSACTIONS ==================== -->'
  },
  {
    name: 'transactions',
    file: 'modules/transactions/transactions.html',
    start: '<!-- ==================== TRANSACTIONS ==================== -->',
    end: '<!-- ==================== BUDGETS ==================== -->'
  },
  {
    name: 'budgets',
    file: 'modules/budgets/budgets.html',
    start: '<!-- ==================== BUDGETS ==================== -->',
    end: '<!-- ==================== CATEGORIES ==================== -->'
  },
  {
    name: 'categories',
    file: 'modules/categories/categories.html',
    start: '<!-- ==================== CATEGORIES ==================== -->',
    end: '<!-- ==================== RECURRING ==================== -->'
  },
  {
    name: 'recurring',
    file: 'modules/recurring/recurring.html',
    start: '<!-- ==================== RECURRING ==================== -->',
    end: '<!-- ==================== REPORTS ==================== -->'
  },
  {
    name: 'reports',
    file: 'modules/reports/reports.html',
    start: '<!-- ==================== REPORTS ==================== -->',
    end: '<!-- ==================== SETTINGS ==================== -->'
  },
  {
    name: 'settings',
    file: 'modules/settings/settings.html',
    start: '<!-- ==================== SETTINGS ==================== -->',
    end: '<!-- ==================== ABOUT ==================== -->'
  },
  {
    name: 'about',
    file: 'modules/about/about.html',
    start: '<!-- ==================== ABOUT ==================== -->',
    end: '<!-- ==================== PROFILE ==================== -->'
  },
  {
    name: 'profile',
    file: 'modules/profile/profile.html',
    start: '<!-- ==================== PROFILE ==================== -->',
    end: '</main>'
  },
  {
    name: 'modals',
    file: 'modules/modals/modals.html',
    start: '<!-- ==================== TRANSACTION MODAL ==================== -->',
    end: '<!-- ==================== TOASTS ==================== -->'
  }
];

modules.forEach(m => {
  const startIdx = html.indexOf(m.start);
  if (startIdx === -1) {
    console.error(`Start marker not found for ${m.name}: ${m.start}`);
    return;
  }
  const endIdx = html.indexOf(m.end, startIdx + m.start.length);
  if (endIdx === -1) {
    console.error(`End marker not found for ${m.name}: ${m.end}`);
    return;
  }
  const content = html.slice(startIdx, endIdx).trim();
  const targetPath = path.join(rootDir, m.file);
  fs.mkdirSync(path.dirname(targetPath), { recursive: true });
  fs.writeFileSync(targetPath, content + '\n', 'utf8');
  console.log(`Saved ${m.file} (${content.length} bytes)`);
});

console.log('All modules extracted successfully!');
